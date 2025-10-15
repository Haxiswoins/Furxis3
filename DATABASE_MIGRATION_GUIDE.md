# 数据存储迁移指南：从本地JSON到服务器数据库

**版本**: 1.0
**目标**: 将网站的数据存储从项目内的JSON文件，迁移到一个在您自己云服务器上运行的、独立的、安全的数据库系统。

---

## 概述

目前，您的网站将所有数据（如订单、用户、作品等）以明文JSON文件的形式存储在 `src/data/` 目录中。这种方式存在严重的安全和性能瓶颈。本指南将指导您完成一个标准的、生产级的迁移流程，将数据存储移至您自己的云服务器。

**核心架构**：我们将采用经典的**前后端分离**架构。
1.  **前端 (Next.js)**：保持不变，继续作为用户界面。
2.  **后端API服务 (新建)**：您需要在您的云服务器上创建一个新的、独立的Node.js服务（我们将以Express.js为例）。这个服务是**唯一**有权访问数据库的程序。
3.  **数据库 (新建)**：在您的云服务器上安装一个真正的数据库软件（我们将以PostgreSQL为例）。

**数据流**：用户在网站上的操作 -> Next.js前端调用后端API -> 后端API服务验证请求并操作数据库。

---

## 第一步：在您的云服务器上安装和配置数据库

我们推荐使用 **PostgreSQL**，这是一个非常强大且流行的开源关系型数据库。

1.  **登录您的云服务器**:
    ```bash
    ssh your_user@your_server_ip
    ```

2.  **安装PostgreSQL**:
    (以Ubuntu/Debian系统为例)
    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    ```

3.  **设置数据库和用户**:
    a. 切换到 `postgres` 系统用户：
    ```bash
    sudo -i -u postgres
    ```
    b. 进入PostgreSQL命令行：
    ```bash
    psql
    ```
    c. 创建一个新的数据库（例如，名为 `forward_infinity_db`）:
    ```sql
    CREATE DATABASE forward_infinity_db;
    ```
    d. 创建一个新的数据库用户，并设置一个**极其强壮的密码**：
    ```sql
    -- ！！！极其重要：您的密码必须用单引号 ' ' 包裹起来！
    CREATE USER forward_infinity_user WITH PASSWORD '一个非常复杂的密码';
    ```
    e. 授予该用户在新数据库上的所有权限：
    ```sql
    GRANT ALL PRIVILEGES ON DATABASE forward_infinity_db TO forward_infinity_user;
    ```
    f. 退出 `psql` 和 `postgres` 用户：
    ```sql
    \q
    exit
    ```

4.  **记录数据库连接字符串**：
    您的数据库连接字符串（`DATABASE_URL`）格式如下，请务必妥善保管，下一步会用到：
    `postgresql://forward_infinity_user:一个非常复杂的密码@localhost:5432/forward_infinity_db`

---

## 第二步：创建独立的后端API服务

这个新的服务将和您的Next.js应用一起，在您服务器上用PM2运行。

1.  **在服务器上创建项目文件夹**:
    在您喜欢的位置（例如 `/var/www/`）创建一个新文件夹：
    ```bash
    mkdir /var/www/forward_infinity_api
    cd /var/www/forward_infinity_api
    ```

2.  **初始化Node.js项目并安装依赖**:
    ```bash
    npm init -y
    npm install express pg cors dotenv helmet express-rate-limit
    ```
    *   `express`: Web框架。
    *   `pg`: PostgreSQL的Node.js驱动。
    *   `cors`: 处理跨域请求。
    *   `dotenv`: 管理环境变量。
    *   `helmet`: 设置安全相关的HTTP头。
    *   `express-rate-limit`: 限制API请求频率。

3.  **创建核心API文件 `server.js`**:
    ```bash
    nano server.js
    ```
    将以下这份**经过安全加固的、包含完整CRUD示例**的代码粘贴进去：
    ```javascript
    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const helmet = require('helmet');
    const rateLimit = require('express-rate-limit');
    const { Pool } = require('pg');

    const app = express();
    // 为API服务选择一个与Next.js(3000)不同的端口
    const port = process.env.PORT || 4000;

    // --- 安全中间件配置 ---

    // 1. 设置基础的安全HTTP头
    app.use(helmet());

    // 2. 配置CORS，只允许您的Next.js前端域名访问
    const corsOptions = {
        origin: process.env.NEXT_PUBLIC_BASE_URL,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    };
    app.use(cors(corsOptions));
    
    // 3. 配置请求频率限制，防止暴力攻击
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 100, // 每个IP在15分钟内最多请求100次
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api/', limiter);

    // 4. 解析JSON请求体
    app.use(express.json());

    // 5. API密钥认证中间件 - 这是一个简单的安全层，确保只有您的Next.js应用能调用API
    const apiKeyMiddleware = (req, res, next) => {
        const apiKey = req.headers['x-api-key'];
        if (apiKey && apiKey === process.env.API_KEY) {
            next();
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    };
    
    // --- 数据库连接 ---
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // --- API 路由 ---
    // 所有API路由都应使用apiKeyMiddleware进行保护
    const apiRouter = express.Router();
    apiRouter.use(apiKeyMiddleware);

    // 示例：为 'orders' 表创建完整的 CRUD 操作

    // GET /api/orders - 获取所有订单
    apiRouter.get('/orders', async (req, res) => {
      try {
        // 使用参数化查询防止SQL注入 (虽然这里没有参数，但这是最佳实践)
        const result = await pool.query('SELECT * FROM orders ORDER BY "orderDate" DESC');
        res.json(result.rows);
      } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // GET /api/orders/:id - 获取单个订单
    apiRouter.get('/orders/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(`Error fetching order ${id}:`, err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // POST /api/orders - 创建新订单 (注意：这里的字段需要和你的数据表完全对应)
    apiRouter.post('/orders', async (req, res) => {
        // 实际应用中，这里需要用Zod之类的库做严格的数据验证
        const { userId, productName, total, status } = req.body;
        if (!userId || !productName || !total || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        try {
            const result = await pool.query(
                'INSERT INTO orders ("userId", "productName", total, status, "orderDate") VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
                [userId, productName, total, status]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating order:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // PUT /api/orders/:id - 更新订单
    apiRouter.put('/orders/:id', async (req, res) => {
        const { id } = req.params;
        // 在实际应用中，只允许更新特定字段，例如 status, total, shippingTrackingId
        const { status, total } = req.body;
        if (!status && !total) {
             return res.status(400).json({ error: 'No updateable fields provided' });
        }
        try {
            // 动态构建更新查询，这是一个更安全的做法
            const result = await pool.query(
                'UPDATE orders SET status = $1, total = $2 WHERE id = $3 RETURNING *',
                [status, total, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(`Error updating order ${id}:`, err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    // DELETE /api/orders/:id - 删除订单
    apiRouter.delete('/orders/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.status(204).send(); // 204 No Content表示成功删除
        } catch (err) {
            console.error(`Error deleting order ${id}:`, err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });


    // 将受保护的路由应用到 /api 路径下
    app.use('/api', apiRouter);

    // --- 启动服务器 ---
    app.listen(port, () => {
      console.log(`Forward Infinity API server listening on port ${port}`);
    });
    ```

4.  **创建环境变量文件 `.env`**:
    ```bash
    nano .env
    ```
    将您的数据库连接字符串、前端URL，以及一个**新生成的API密钥**填入：
    ```
    # 数据库连接字符串
    DATABASE_URL="postgresql://forward_infinity_user:一个非常复杂的密码@localhost:5432/forward_infinity_db"
    
    # 允许访问API的前端域名
    NEXT_PUBLIC_BASE_URL="您网站的完整域名，例如 https://www.yourdomain.com"
    
    # 用于保护API的密钥，请生成一个足够复杂的随机字符串
    # 您可以在终端用 `openssl rand -base64 32` 命令生成
    API_KEY="一个非常非常复杂的随机字符串"
    
    # API服务运行的端口 (可选)
    PORT=4000
    ```

5.  **（关键）创建数据表和迁移数据**:
    这是一个手动过程。您需要连接到数据库，创建与 `src/types/index.ts` 中类型定义相匹配的数据表（`orders`, `works` 等），然后手动将 `src/data/` 目录下的JSON数据导入到这些新表中。

---

## 第三步：重构Next.js应用的数据服务

> **⚠️ 注意：这一步是在您本地的Firebase Studio项目中操作，而不是在服务器上！**
> 您需要修改您Next.js应用的代码，让它去调用您刚刚在服务器上创建的新后端API。

现在，回到您Firebase Studio中的Next.js项目。

1.  **修改环境变量**:
    在您的Next.js项目的 `.env.local` 文件中，添加API地址和API密钥。**请确保将占位符替换为您自己的真实值！**
    ```
    # 您的新后端API地址
    # 如果您的API服务和Next.js应用在同一台服务器上，这个值通常就是 http://localhost:4000/api
    NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api" 
    
    # ！！！注意：这里必须填写您在后端 .env 文件中设置的同一个API密钥
    API_KEY="一个非常非常复杂的随机字符串"
    ```

2.  **重构 `src/lib/data-service.ts`**:
    这是核心修改。您需要将这个文件中所有使用 `fs.readFile` 和 `fs.writeFile` 的函数，全部替换为使用 `fetch` 来调用您的新API。

    **修改前 (以 `getAllOrders` 为例):**
    ```typescript
    // 'use server';
    import fs from 'fs/promises';
    // ...

    export async function getAllOrders(): Promise<Order[]> {
        const allOrders = await readData<Order[]>('orders.json');
        return allOrders.sort(/* ... */);
    }
    ```

    **修改后:**
    ```typescript
    // 'use server';
    // 不再需要 'fs'
    import type { Order } from '@/types';
    import { revalidateTag } from 'next/cache';

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const API_KEY = process.env.API_KEY;

    // 创建一个包含通用头部的fetch实例
    const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY || '',
        };
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: '请求失败，且无法解析错误信息' }));
            console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(errorBody.error || 'API请求失败');
        }

        if (response.status === 204) { // No Content
            return;
        }

        return response.json();
    };

    export async function getAllOrders(): Promise<Order[]> {
      try {
        // 使用next.js的fetch缓存和重新验证机制
        return await apiFetch('/orders', { next: { tags: ['orders'] } });
      } catch (error) {
        console.error('Data service error fetching orders:', error);
        return []; // 出错时返回空数组
      }
    }
    
    // 对于写入操作，例如 updateOrder
    export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
        await apiFetch(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        revalidateTag('orders'); // 按标签重新验证，使缓存失效
    }
    ```

您需要为您项目中的**每一个**数据获取和保存函数都进行类似的重构。

---

## 第四步：部署

1.  **部署后端API服务**:
    在您的服务器上，进入API项目文件夹 (`/var/www/forward_infinity_api`)，使用PM2启动它：
    ```bash
    pm2 start server.js --name "forward-infinity-api"
    ```

2.  **重新部署Next.js应用**:
    在您的Next.js项目文件夹中，确保您已拉取了所有最新代码，然后运行构建和重启命令：
    ```bash
    git pull origin main # 或者您的主分支
    npm install
    npm run build
    pm2 restart your_nextjs_app_name
    ```

迁移完成后，您的网站将变得前所未有的安全和健壮。所有敏感数据都隔离在安全的数据库中，并通过一个专用的API进行访问。这是一个专业网站的黄金标准。
