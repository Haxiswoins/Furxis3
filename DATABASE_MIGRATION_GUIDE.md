# 数据存储迁移指南：从本地JSON到自托管服务器数据库

**版本**: 4.0 (生产级完整版)
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
    ```bash
    sudo -i -u postgres
    ```
    执行后，您的命令行提示符会变成 `postgres@...:~$`。

4.  **进入PostgreSQL命令行**:
    在 `postgres` 用户下，直接输入 `psql` 命令。
    ```bash
    psql
    ```
    执行后，您的提示符会变成 `postgres=#`。

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

6.  **退出psql和postgres用户**:
    *   首先，在 `postgres=#` 提示符下输入 `\q` 并按回车，以退出psql。
    *   然后，在 `postgres@...:~$` 提示符下输入 `exit` 并按回车，以返回到您原来的 `root` 或普通用户。

7.  **记录您的数据库连接字符串 (DATABASE_URL)**：
    您的连接字符串格式如下。请将其拼接好并妥善保管，下一步会立即用到。**请将占位符替换为您刚刚设置的真实密码**。

    `postgresql://forward_infinity_api_user:一个非常非常复杂的随机密码@localhost:5432/forward_infinity_db`

---

## 第二步：创建数据库表结构 (Schema)

这是**新增的关键步骤**。您需要定义所有数据在数据库中如何存储。

1.  **再次进入psql**:
    ```bash
    # 切换用户
    sudo -i -u postgres
    # 进入psql并连接到您的新数据库
    psql -d forward_infinity_db
    ```
    执行后，您的提示符应变为 `forward_infinity_db=#`。

2.  **执行以下所有 `CREATE TABLE` 命令**:
    将下面的**全部SQL代码**一次性复制并粘贴到您的psql窗口中，然后按回车。这将创建您网站所需的所有数据表。

    ```sql
    -- 用户表 (存储基本用户信息)
    CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        picture TEXT,
        isAdmin BOOLEAN DEFAULT FALSE,
        registrationDate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 网站内容表 (存储全局设置，永远只有一行)
    CREATE TABLE site_content (
        id INT PRIMARY KEY DEFAULT 1,
        content JSONB
    );

    -- 委托期数表
    CREATE TABLE commission_options (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        status VARCHAR(50),
        imageUrl TEXT,
        tags TEXT[],
        description TEXT,
        commissionDate TIMESTAMPTZ
    );

    -- 委托样式表
    CREATE TABLE commission_styles (
        id VARCHAR(255) PRIMARY KEY,
        commissionOptionId VARCHAR(255) REFERENCES commission_options(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(100),
        description TEXT,
        imageUrl TEXT,
        tags TEXT[]
    );

    -- 设定系列表
    CREATE TABLE character_series (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        imageUrl TEXT
    );

    -- 领养角色表
    CREATE TABLE characters (
        id VARCHAR(255) PRIMARY KEY,
        seriesId VARCHAR(255) REFERENCES character_series(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        species VARCHAR(100),
        price VARCHAR(100),
        imageUrl TEXT,
        imageUrl1 TEXT,
        imageUrl2 TEXT,
        imageUrl3 TEXT,
        imageUrl4 TEXT,
        tags TEXT[],
        description TEXT,
        applicants INT DEFAULT 0,
        status VARCHAR(50) DEFAULT '待领养'
    );

    -- 作品表
    CREATE TABLE works (
        id VARCHAR(255) PRIMARY KEY,
        workName VARCHAR(255) NOT NULL,
        clientName VARCHAR(255),
        clientCity VARCHAR(100),
        makerName VARCHAR(255),
        completionDate TIMESTAMPTZ,
        imageUrls TEXT[],
        avatarUrl TEXT,
        description TEXT
    );

    -- 订单表
    CREATE TABLE orders (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        productName VARCHAR(255) NOT NULL,
        orderNumber VARCHAR(100) UNIQUE,
        orderType VARCHAR(50),
        status VARCHAR(50),
        imageUrl TEXT,
        orderDate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        total VARCHAR(100),
        shippingAddress TEXT,
        cancellationReason TEXT,
        shippingTrackingId VARCHAR(255),
        commissionOptionName VARCHAR(255),
        hasFan BOOLEAN DEFAULT FALSE,
        magneticEyes BOOLEAN DEFAULT FALSE,
        magneticEyesCount INT DEFAULT 0,
        applicationData JSONB
    );

    -- 徽章定义表
    CREATE TABLE badges (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        imageUrl TEXT,
        createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 用户徽章关联表
    CREATE TABLE user_badges (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        badgeId VARCHAR(255) REFERENCES badges(id) ON DELETE CASCADE,
        claimedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, badgeId)
    );

    -- 徽章二维码表
    CREATE TABLE badge_qrcodes (
        id VARCHAR(255) PRIMARY KEY,
        badgeId VARCHAR(255) REFERENCES badges(id) ON DELETE CASCADE,
        type VARCHAR(50),
        createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        expiresAt TIMESTAMPTZ,
        isClaimed BOOLEAN DEFAULT FALSE,
        claimedBy VARCHAR(255),
        claimedAt TIMESTAMPTZ
    );

    ```
    > 执行成功后，您可以输入 `\dt` 命令来查看所有已创建的表，确认它们都已存在。

3.  **退出psql和postgres用户**:
    *   在 `forward_infinity_db=#` 提示符下输入 `\q` 并按回车。
    *   在 `postgres@...:~$` 提示符下输入 `exit` 并按回车。

---

## 第三步：创建独立的后端API服务

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
    npm install express pg cors helmet dotenv
    ```

3.  **创建 `.env` 环境变量文件**:
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
    将下面的**完整代码**粘贴到编辑器中。这是一个功能齐全、为您量身定制的后端服务，包含了您网站所有数据类型的接口。

    ```javascript
    require('dotenv').config();
    const express = require('express');
    const { Pool } = require('pg');
    const cors = require('cors');
    const helmet = require('helmet');

    const app = express();
    app.use(express.json({ limit: '10mb' })); // 解析JSON请求体，并增大了请求体大小限制
    app.use(cors()); // 允许跨域请求
    app.use(helmet()); // 设置安全相关的HTTP头

    const PORT = process.env.PORT || 4000;
    const API_KEY = process.env.API_KEY;

    // --- 安全设置 ---
    // API密钥认证中间件
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
        // 如果您的云数据库需要SSL连接，请取消下面的注释
        // ssl: {
        //   rejectUnauthorized: false
        // }
    });
    
    // --- 辅助函数 ---
    const handleError = (res, error, context) => {
        console.error(`Error in ${context}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    };

    // --- API 路由 ---
    
    // Generic GET ALL
    const getAll = (tableName, orderBy) => async (req, res) => {
        try {
            const result = await pool.query(`SELECT * FROM ${tableName} ${orderBy || ''}`);
            res.json(result.rows);
        } catch (err) {
            handleError(res, err, `getAll ${tableName}`);
        }
    };

    // Generic GET by ID
    const getById = (tableName) => async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `${tableName} with id ${id} not found` });
            }
            res.json(result.rows[0]);
        } catch (err) {
            handleError(res, err, `getById ${tableName}`);
        }
    };

    // Generic DELETE by ID
    const deleteById = (tableName) => async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [id]);
            if (result.rowCount === 0) {
                 return res.status(404).json({ error: 'Not found' });
            }
            res.status(204).send(); // No Content
        } catch (err) {
            handleError(res, err, `deleteById ${tableName}`);
        }
    };
    
    // Orders
    app.get('/api/orders', apiKeyAuth, getAll('orders', 'ORDER BY orderDate DESC'));
    app.get('/api/orders/:id', apiKeyAuth, getById('orders'));
    app.get('/api/users/:userId/orders', apiKeyAuth, async(req, res) => {
        try {
            const { userId } = req.params;
            const result = await pool.query('SELECT * FROM orders WHERE userId = $1 ORDER BY orderDate DESC', [userId]);
            res.json(result.rows);
        } catch (err) {
            handleError(res, err, `getOrdersByUserId`);
        }
    });
    app.post('/api/orders', apiKeyAuth, async (req, res) => {
        try {
            const { id, ...orderData } = req.body;
            const columns = Object.keys(orderData).join(', ');
            const placeholders = Object.keys(orderData).map((_, i) => `$${i + 1}`).join(', ');
            const values = Object.values(orderData);
            const result = await pool.query(`INSERT INTO orders (id, ${columns}) VALUES ($1, ${placeholders.substring(1)}) RETURNING *`, [id, ...values.slice(1)]);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            handleError(res, err, 'createOrder');
        }
    });
    app.put('/api/orders/:id', apiKeyAuth, async (req, res) => {
       try {
           const { id } = req.params;
           const fields = req.body;
           const fieldEntries = Object.entries(fields);
           const setClause = fieldEntries.map(([key], i) => `${key} = $${i + 2}`).join(', ');
           const values = fieldEntries.map(([, value]) => value);
           const result = await pool.query(`UPDATE orders SET ${setClause} WHERE id = $1 RETURNING *`, [id, ...values]);
           res.json(result.rows[0]);
       } catch(err) {
           handleError(res, err, 'updateOrder');
       }
    });
    app.delete('/api/orders/:id', apiKeyAuth, deleteById('orders'));


    // All other simple data types
    const simpleRoutes = [
        { name: 'character-series', table: 'character_series', orderBy: 'ORDER BY name ASC' },
        { name: 'characters', table: 'characters' },
        { name: 'commission-options', table: 'commission_options', orderBy: 'ORDER BY commissionDate DESC' },
        { name: 'commission-styles', table: 'commission_styles' },
        { name: 'works', table: 'works', orderBy: 'ORDER BY completionDate DESC' },
        { name: 'badges', table: 'badges', orderBy: 'ORDER BY createdAt DESC' },
        { name: 'badge-qrcodes', table: 'badge_qrcodes' },
        { name: 'user-badges', table: 'user_badges' },
        { name: 'users', table: 'users' },
    ];
    
    simpleRoutes.forEach(({ name, table, orderBy }) => {
        app.get(`/api/${name}`, apiKeyAuth, getAll(table, orderBy));
        app.get(`/api/${name}/:id`, apiKeyAuth, getById(table));
        app.post(`/api/${name}`, apiKeyAuth, async (req, res) => {
            try {
                const { id, ...data } = req.body;
                const columns = Object.keys(data).join(', ');
                const placeholders = Object.keys(data).map((_, i) => `$${i + 2}`).join(', ');
                const values = Object.values(data);
                const result = await pool.query(`INSERT INTO ${table} (id, ${columns}) VALUES ($1, ${placeholders}) RETURNING *`, [id, ...values]);
                res.status(201).json(result.rows[0]);
            } catch (err) { handleError(res, err, `create ${name}`); }
        });
        app.put(`/api/${name}/:id`, apiKeyAuth, async (req, res) => {
            try {
                const { id } = req.params;
                const data = req.body;
                delete data.id; // Ensure id is not in the update set
                const columns = Object.keys(data).map((key, i) => `${key} = $${i + 2}`).join(', ');
                const values = Object.values(data);
                const result = await pool.query(`UPDATE ${table} SET ${columns} WHERE id = $1 RETURNING *`, [id, ...values]);
                res.json(result.rows[0]);
            } catch (err) { handleError(res, err, `update ${name}`); }
        });
        app.delete(`/api/${name}/:id`, apiKeyAuth, deleteById(table));
    });

    // Site Content (special case, only one row)
    app.get('/api/site-content', apiKeyAuth, async (req, res) => {
        try {
            const result = await pool.query('SELECT content FROM site_content WHERE id = 1');
            res.json(result.rows[0]?.content || {});
        } catch (err) { handleError(res, err, 'getSiteContent'); }
    });
    app.post('/api/site-content', apiKeyAuth, async (req, res) => {
        try {
            const { content } = req.body;
            // Use INSERT ... ON CONFLICT to either insert or update the single row
            const query = `
                INSERT INTO site_content (id, content) VALUES (1, $1)
                ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
                RETURNING content;
            `;
            const result = await pool.query(query, [content]);
            res.status(200).json(result.rows[0].content);
        } catch (err) { handleError(res, err, 'saveSiteContent'); }
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

## 第四步：重构Next.js应用的数据服务

现在，您需要修改您的Next.js应用，让它不再读写本地JSON文件，而是去调用您刚刚创建的后端API。

> **⚠️ 注意: 关键修改点**
> 以下步骤需要在您的 **Next.js项目代码** 中完成，而不是在新的API服务文件夹中。您需要将 `API_KEY` 添加到Next.js项目的 `.env.local` 文件中，并更新 `src/lib/data-service.ts` 文件。

1.  **在Next.js项目中添加环境变量**:
    打开您的Next.js项目中的 `.env.local` 文件，并添加以下两行：
    ```env
    # 您新API服务的基础URL (如果您在同一台服务器部署，则为localhost)
    API_BASE_URL="http://localhost:4000"

    # 您在后端 .env 文件中设置的同一个API密钥
    API_KEY="一个非常非常复杂的随机字符串"
    ```

2.  **重构 `src/lib/data-service.ts`**（已经重构）:
    您需要将这个文件中的所有函数，从读写 `fs` 模块，改为使用 `fetch` 调用您的新API。这是一个漫长但必须的过程。

    **这是一个 `getAllOrders` 函数的重构示例：**

    ```typescript
    // data-service.ts (修改前)
    export async function getAllOrders(): Promise<Order[]> {
        const allOrders = await readData<Order[]>('orders.json');
        return allOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }

    // data-service.ts (修改后)
    const API_BASE_URL = process.env.API_BASE_URL;
    const API_KEY = process.env.API_KEY;
    const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY!,
    };

    export async function getAllOrders(): Promise<Order[]> {
        const res = await fetch(`${API_BASE_URL}/api/orders`, {
            headers: { 'X-API-Key': API_KEY! },
            // 对于频繁变动的数据，建议不使用Next.js缓存
            cache: 'no-store', 
        });
        if (!res.ok) throw new Error('Failed to fetch orders from API');
        return res.json();
    }
    ```
    您需要为您项目 `data-service.ts` 中的**每一个函数**（如 `getOrderById`, `updateOrder`, `createCommissionApplication`, `saveWork` 等）都进行类似的重构，将其逻辑改为调用您新后端对应的API端点。

3.  **重新部署您的Next.js应用**:
    完成代码重构后，不要忘记重新构建并重启您的Next.js应用。
    ```bash
    # 在您的Next.js项目目录中
    npm run build
    pm2 restart your_nextjs_app_name 
    ```

迁移完成！现在您的网站数据就安全地存储在您自己管理的数据库中了。这套架构不仅安全，而且性能和扩展性都远超从前。