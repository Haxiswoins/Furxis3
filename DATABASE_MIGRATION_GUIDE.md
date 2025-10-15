# 数据存储迁移指南：从本地JSON到自托管服务器数据库

**版本**: 3.0
**目标**: 将网站的数据存储从项目内的JSON文件，迁移到您自己在云服务器上搭建和管理的、独立的、更安全的数据库系统（以PostgreSQL为例）。

---

## 概述

您当前的网站将所有数据以明文JSON文件的形式存储在 `src/data/` 目录中，这存在严重的安全和性能瓶颈。本指南将指导您完成一个标准的、生产级的迁移流程。

**核心架构**：我们将采用经典的**前后端分离**架构。
1.  **前端 (Next.js)**：保持不变，继续作为用户界面。它将运行在 `localhost:3000`。
2.  **后端API服务 (新建)**：您将在您的云服务器上创建一个新的、独立的Node.js服务。这个服务是**唯一**有权访问数据库的程序。它将运行在另一个端口，例如 `localhost:4000`。
3.  **数据库 (新建)**：您将在您的云服务器上安装并运行一个PostgreSQL数据库服务。

**数据流**：用户在网站上的操作 -> Next.js前端调用后端API -> 后端API服务验证请求并连接本地数据库进行操作。

---

## 第一步：在您的服务器上安装并设置PostgreSQL

1.  **登录您的云服务器**:
    ```bash
    ssh your_user@your_server_ip
    ```

2.  **更新软件包列表并安装PostgreSQL**:
    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    ```

3.  **切换到 `postgres` 系统用户以进行数据库管理**:
    安装完成后，系统会自动创建一个名为 `postgres` 的Linux用户。我们需要用这个用户身份来创建我们的数据库和新用户。
    ```bash
    sudo -i -u postgres
    ```
    执行后，您的命令行提示符会变成 `postgres@...:~$`。

4.  **进入PostgreSQL命令行**:
    在 `postgres` 用户下，直接输入 `psql` 命令。
    ```bash
    psql
    ```
    执行后，您的提示符会变成 `postgres=#`，这表示您已进入数据库的交互式命令行。

5.  **创建数据库和专用用户（关键步骤）**:
    现在，逐行执行以下SQL命令。每一行命令都以分号 `;` 结尾。

    ```sql
    -- 1. 创建一个新的、名为 'forward_infinity_db' 的数据库
    CREATE DATABASE forward_infinity_db;

    -- 2. 创建一个新的、用于API服务的专用数据库用户
    -- ！！！极其重要：您的密码必须用单引号 ' ' 包裹起来！
    -- ！！！请务必将 '一个非常非常复杂的随机密码' 替换为您自己的强密码！
    CREATE USER forward_infinity_api_user WITH PASSWORD '一个非常非常复杂的随机密码';

    -- 3. 将新数据库的所有权限授予这个新用户
    GRANT ALL PRIVILEGES ON DATABASE forward_infinity_db TO forward_infinity_api_user;
    ```
    > 每当您成功执行一条命令，psql都会返回相应的确认信息，如 `CREATE DATABASE` 或 `GRANT`。如果您看到 `ERROR`，请检查您的命令是否拼写正确，特别是密码周围的单引号。

6.  **退出psql和postgres用户**:
    *   首先，在 `postgres=#` 提示符下输入 `\q` 并按回车，以退出psql。
    *   然后，在 `postgres@...:~$` 提示符下输入 `exit` 并按回车，以返回到您原来的 `root` 或普通用户。

7.  **记录您的数据库连接字符串 (DATABASE_URL)**：
    您的连接字符串格式如下。请将其拼接好并妥善保管，下一步会立即用到。**请将占位符替换为您刚刚设置的真实密码**。

    `postgresql://forward_infinity_api_user:一个非常非常复杂的随机密码@localhost:5432/forward_infinity_db`

---

## 第二步：创建独立的后端API服务

这个新的服务将和您的Next.js应用一起，在您的云服务器上用PM2运行。

1.  **在服务器上创建项目文件夹**:
    在您喜欢的位置（例如 `/var/www/`）创建一个新文件夹。
    ```bash
    # 确保您已退回到 root 或普通用户下
    mkdir /var/www/forward_infinity_api
    cd /var/www/forward_infinity_api
    ```

2.  **初始化Node.js项目并安装依赖**:
    ```bash
    npm init -y
    npm install express pg cors helmet express-rate-limit dotenv
    ```

3.  **创建 `.env` 环境变量文件**:
    这是存放您数据库密码和API密钥等敏感信息的地方。
    ```bash
    nano .env
    ```
    在打开的编辑器中，粘贴以下内容，**并替换成您的真实值**：
    ```env
    # 您在第一步中记录的数据库连接字符串
    DATABASE_URL="postgresql://forward_infinity_api_user:一个非常非常复杂的随机密码@localhost:5432/forward_infinity_db"

    # API服务运行的端口
    PORT="4000"

    # 创建一个用于保护您的API的密钥，请替换成一个足够复杂的随机字符串
    API_KEY="一个非常非常复杂的随机字符串"
    ```
    保存并关闭文件 (`Ctrl+X`, `Y`, `Enter`)。

4.  **创建核心API文件 `server.js`**:
    ```bash
    nano server.js
    ```
    将下面的**完整代码**粘贴到编辑器中。这是一个功能齐全、包含安全加固的后端服务模板。

    ```javascript
    require('dotenv').config();
    const express = require('express');
    const { Pool } = require('pg');
    const cors = require('cors');
    const helmet = require('helmet');
    const rateLimit = require('express-rate-limit');

    const app = express();
    app.use(express.json()); // 解析JSON请求体
    app.use(cors()); // 允许跨域请求
    app.use(helmet()); // 设置安全相关的HTTP头

    const PORT = process.env.PORT || 4000;
    const API_KEY = process.env.API_KEY;

    // --- 安全设置 ---

    // 速率限制: 防止暴力攻击
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 100, // 每个IP在15分钟内最多100个请求
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);

    // API密钥认证中间件: 保护您的API
    const apiKeyAuth = (req, res, next) => {
        const providedApiKey = req.header('X-API-Key');
        if (providedApiKey && providedApiKey === API_KEY) {
            next();
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    };

    // --- 数据库连接 ---

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    // --- API 路由 (以Orders为例) ---

    // 获取所有订单 (GET /api/orders)
    app.get('/api/orders', apiKeyAuth, async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM orders ORDER BY orderDate DESC');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // 获取单个订单 (GET /api/orders/:id)
    app.get('/api/orders/:id', apiKeyAuth, async (req, res) => {
        try {
            // 使用参数化查询防止SQL注入
            const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Order not found' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // 创建一个新订单 (POST /api/orders)
    app.post('/api/orders', apiKeyAuth, async (req, res) => {
        const { productName, total, userId } = req.body; // 简化示例
        if (!productName || !total || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        try {
            const result = await pool.query(
                'INSERT INTO orders (productName, total, userId, orderDate, status) VALUES ($1, $2, $3, NOW(), $4) RETURNING *',
                [productName, total, userId, '处理中']
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    // 更新一个订单 (PUT /api/orders/:id)
    app.put('/api/orders/:id', apiKeyAuth, async (req, res) => {
        const { status, total } = req.body;
        // 在实际应用中，您需要更复杂的逻辑来决定哪些字段可以被更新
        if (!status && !total) {
            return res.status(400).json({ error: 'No updateable fields provided' });
        }
        try {
            const result = await pool.query(
                'UPDATE orders SET status = COALESCE($1, status), total = COALESCE($2, total) WHERE id = $3 RETURNING *',
                [status, total, req.params.id]
            );
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Order not found' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


    // --- 启动服务器 ---
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    ```
    保存并关闭文件。

5.  **使用 PM2 启动您的后端服务**:
    ```bash
    # 如果您还没有安装 PM2
    npm install pm2 -g

    # 启动API服务
    pm2 start server.js --name "forward-infinity-api"
    
    # 设置开机自启
    pm2 startup
    pm2 save
    ```
    您的后端API现在已经在后台运行了！

---

## 第三步：重构Next.js应用的数据服务

现在，您需要修改您的Next.js应用，让它不再读写本地JSON文件，而是去调用您刚刚创建的后端API。

> **⚠️ 注意: 关键修改点**
> 以下步骤需要在您的 **Next.js项目代码** 中完成，而不是在新的API服务文件夹中。您需要将 `API_KEY` 添加到Next.js项目的 `.env.local` 文件中，并更新 `src/lib/data-service.ts` 文件。

1.  **在Next.js项目中添加环境变量**:
    打开您的Next.js项目中的 `.env.local` 文件，并添加以下两行：
    ```env
    # 您新API服务的基础URL
    API_BASE_URL="http://localhost:4000"

    # 您在后端 .env 文件中设置的同一个API密钥
    API_KEY="一个非常非常复杂的随机字符串"
    ```

2.  **重构 `src/lib/data-service.ts`**:
    您需要将这个文件中的所有函数，从读写 `fs` 模块，改为使用 `fetch` 调用您的新API。

    **这是一个 `getAllOrders` 函数的重构示例：**

    ```typescript
    // data-service.ts (修改前)
    export async function getAllOrders(): Promise<Order[]> {
        const allOrders = await readData<Order[]>('orders.json');
        return allOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }

    // data-service.ts (修改后)
    export async function getAllOrders(): Promise<Order[]> {
        const res = await fetch(`${process.env.API_BASE_URL}/api/orders`, {
            headers: {
                'X-API-Key': process.env.API_KEY!,
            },
            // 使用 next: { revalidate: 10 } 或 cache: 'no-store' 来控制缓存策略
            cache: 'no-store', 
        });

        if (!res.ok) {
            throw new Error('Failed to fetch orders from API');
        }
        return res.json();
    }
    ```
    您需要为您项目 `data-service.ts` 中的**每一个函数**（如 `getOrderById`, `updateOrder`, `createCommissionApplication` 等）都进行类似的重构。

3.  **重新部署您的Next.js应用**:
    完成代码重构后，不要忘记重新构建并重启您的Next.js应用。
    ```bash
    # 在您的Next.js项目目录中
    npm run build
    pm2 restart your_nextjs_app_name 
    ```

迁移完成！现在您的网站数据就安全地存储在您自己管理的数据库中了。这套架构不仅安全，而且性能和扩展性都远超从前。