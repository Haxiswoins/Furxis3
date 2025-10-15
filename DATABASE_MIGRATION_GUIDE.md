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
    npm install express pg cors dotenv
    ```
    *   `express`: Web框架。
    *   `pg`: PostgreSQL的Node.js驱动。
    *   `cors`: 处理跨域请求。
    *   `dotenv`: 管理环境变量。

3.  **创建核心API文件 `server.js`**:
    ```bash
    nano server.js
    ```
    将以下代码粘贴进去。这是一个**基础的、未经安全加固的示例**，用于获取所有订单：
    ```javascript
    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const { Pool } = require('pg');

    const app = express();
    const port = 4000; // 为API服务选择一个与Next.js(3000)不同的端口

    // --- 数据库连接 ---
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // --- 中间件 ---
    app.use(cors({
        origin: process.env.NEXT_PUBLIC_BASE_URL // 只允许您的Next.js前端访问
    }));
    app.use(express.json());

    // --- API 路由示例：获取所有订单 ---
    // ！！！警告：这是一个未经验证的示例，实际生产中必须添加身份验证！
    app.get('/api/orders', async (req, res) => {
      try {
        // 假设您已创建了一个名为 'orders' 的表
        const result = await pool.query('SELECT * FROM orders ORDER BY "orderDate" DESC');
        res.json(result.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 您需要为 orders, works, characters 等所有数据类型创建对应的增删改查(CRUD)路由
    // 例如: POST /api/orders, PUT /api/orders/:id, DELETE /api/orders/:id 等

    app.listen(port, () => {
      console.log(`Forward Infinity API server listening on port ${port}`);
    });
    ```

4.  **创建环境变量文件 `.env`**:
    ```bash
    nano .env
    ```
    将您的数据库连接字符串和前端URL填入：
    ```
    DATABASE_URL="postgresql://forward_infinity_user:一个非常复杂的密码@localhost:5432/forward_infinity_db"
    NEXT_PUBLIC_BASE_URL="您网站的完整域名，例如 https://www.yourdomain.com"
    ```

5.  **（关键）创建数据表和迁移数据**:
    这是一个手动过程。您需要连接到数据库，创建与 `src/types/index.ts` 中类型定义相匹配的数据表（`orders`, `works` 等），然后手动将 `src/data/` 目录下的JSON数据导入到这些新表中。

---

## 第三步：重构Next.js应用的数据服务

现在，回到您Firebase Studio中的Next.js项目，我们将修改代码，让它不再读写本地文件，而是去调用您刚刚创建的后端API。

1.  **修改环境变量**:
    在您的Next.js项目的 `.env.local` 文件中，添加一个新的变量，指向您的API服务器地址：
    ```
    NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api" 
    # 在服务器上，这里通常是 http://localhost:4000/api
    # 如果您的API部署在不同机器上，请使用其公网地址
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
    import { revalidatePath } from 'next/cache';

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    export async function getAllOrders(): Promise<Order[]> {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          next: { tags: ['orders'] } // 用于按需重新验证
        });
        if (!res.ok) {
          throw new Error('Failed to fetch orders from API');
        }
        return res.json();
      } catch (error) {
        console.error('Data service error fetching orders:', error);
        return []; // 出错时返回空数组
      }
    }
    
    // 对于写入操作，例如 updateOrder，您需要使用 POST 或 PUT 方法
    export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
        await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        // revalidatePath('/admin/orders'); // 这种方式可能不再有效，
                                         // 您需要在前端进行状态更新或重新获取数据
        revalidateTag('orders'); // 按标签重新验证
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
