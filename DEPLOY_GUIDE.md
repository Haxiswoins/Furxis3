# 自定义服务器部署指南

本文档将指导您如何将此 Next.js 应用程序部署到您自己的服务器（例如，一台安装了 Node.js 的 VPS）。

> **⚠️ 重要提示：** 在开始之前，请确保您已经完成了所有的开发和测试。部署到生产环境前，强烈建议您使用 Git 将代码备份到您自己的 GitHub 仓库。

---

### **第 1 步：获取项目代码**

首先，请通过 SSH 登录到您的服务器，然后运行以下命令将代码克隆到服务器上：

```bash
git clone https://github.com/Haxiswoins/Suittopia.git
```

这会在当前目录下创建一个名为 `Suittopia` 的文件夹。接下来，请进入这个文件夹：

```bash
cd Suittopia
```

后续的所有操作都将在这个项目文件夹中进行。

---

### **第 2 步：在您的服务器上准备环境**

在您的服务器上，您需要确保已安装以下软件：

1.  **Node.js**: 推荐使用 18.x 或更高版本。您可以通过运行 `node -v` 来检查版本。
2.  **npm** (或 **yarn**): 通常会随 Node.js 一起安装。

---

### **第 3 步：安装依赖**

进入项目目录后，运行以下命令安装项目所需的所有依赖包：

```bash
npm install
```

---

### **第 4 步：配置环境变量**

为了让应用能够连接到 Firebase 用户认证和 Resend 邮件服务，您需要配置环境变量。这是**至关重要**的一步。

1.  在项目根目录中，创建一个名为 `.env.local` 的文件：

    ```bash
    touch .env.local
    ```

2.  使用文本编辑器（如 `nano` 或 `vim`）打开 `.env.local` 文件：

    ```bash
    nano .env.local
    ```

3.  将您的真实密钥和配置信息添加到文件中。文件内容应如下所示，请将 `...` 替换为您的实际值：

    ```
# 网站基础URL (⚠️ 极其重要！)
# 这个URL用于生成发送给管理员的邮件通知中的链接，并且是让您上传的图片在生产环境中正确显示所必需的。
# 请确保填写您网站的完整公网访问地址，例如：https://www.yourdomain.com 或 http://YOUR_SERVER_IP:3000
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Firebase 项目配置 (仅需要认证部分)
# 您可以从 Firebase 控制台的项目设置中找到这些值



# Resend API Key for Email Notifications
# 邮件通知功能是网站的核心之一，详细配置请务必参考 RESEND_GUIDE.md
# 请参考 RESEND_GUIDE.md 文档获取并配置此项。
RESEND_API_KEY="re_..."

# Firebase 服务账号密钥 (用于服务器端图片上传)
# 这是一个非常重要的 JSON 字符串，请从 Firebase 控制台 > 项目设置 > 服务账号 > 生成新的私钥处获取。
# 获取后，请将整个 JSON 文件的内容压缩成一行，并用引号包裹起来。
# 例如: FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "...", ...}'
FIREBASE_SERVICE_ACCOUNT_KEY=''

    ```
    > **重要提示**: 这些密钥是应用正常运行所必需的。特别是 `FIREBASE_SERVICE_ACCOUNT_KEY` 和 `RESEND_API_KEY`，它们分别是图片上传和邮件通知功能的核心。

4.  保存并关闭文件 (在 `nano` 中，按 `Ctrl+X`，然后按 `Y`，最后按 `Enter`)。

---

### **第 5 步：构建并启动应用**

现在，您的应用已经准备好在生产模式下运行了。

1.  **构建应用**: 运行以下命令来创建 Next.js 应用的优化生产版本：

    ```bash
    npm run build
    ```

2.  **启动应用**: 构建完成后，使用以下命令启动服务器：

    ```bash
    npm start
    ```

默认情况下，应用会运行在 `3000` 端口。您现在应该可以通过服务器的 IP 地址和端口访问您的网站了（例如 `http://YOUR_SERVER_IP:3000`）。

---

### **(可选) 第 6 步：使用 PM2 保持应用持续运行**

直接使用 `npm start` 启动的应用在您关闭终端后会停止。为了让您的网站在后台持续运行，推荐使用进程管理器，如 `PM2`。

1.  在您的服务器上全局安装 PM2：

    ```bash
    npm install pm2 -g
    ```

2.  使用 PM2 来启动您的应用：

    ```bash
    # 您可以将 "suitopia-app" 替换为您想为应用起的名字
    pm2 start npm --name "suitopia-app" -- start
    ```

3.  **常用 PM2 命令**:
    *   `pm2 list`: 查看所有正在运行的应用。
    *   `pm2 restart suitopia-app`: 重启您的应用。
    *   `pm2 stop suitopia-app`: 停止您的应用。
    *   `pm2 logs suitopia-app`: 查看应用的日志。
    *   `pm2 startup` 和 `pm2 save`: 设置开机自启动。

---

### **(可选) 第 7 步：配置反向代理（如 Nginx）**

为了使用域名（例如 `www.yourdomain.com`）并通过标准的 80 (HTTP) 和 443 (HTTPS) 端口访问您的网站，您需要设置一个反向代理。Nginx 是一个非常流行的选择。

这通常涉及编辑 Nginx 的配置文件，将来自您域名的请求转发到 Next.js 应用正在运行的本地端口（例如 `http://localhost:3000`）。这是一个专业的系统管理任务，具体配置会根据您的服务器和域名设置而异。

部署完成！您的网站现在已经在您自己的服务器上成功运行了。
