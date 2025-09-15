
# 网站服务器部署指南

本文档将指导您如何将此 Next.js 应用程序部署到您自己的服务器。

> **⚠️ 极其重要：网络连接要求**
> 为了让邮件通知和用户认证等核心功能正常工作，您的服务器**必须**具备稳定访问以下国际互联网服务的能力：
> *   **Authing (认证服务)**: 用于所有用户登录、注册流程。其服务域名为 `*.authing.cn`。
> *   **Resend (邮件服务)**: 用于发送所有系统通知邮件。其服务域名为 `api.resend.com`。
>
> **关于Google服务**：
> *   **Google Fonts**：已在项目构建时自动下载并自托管，**运行时不依赖Google**。
> *   **Google AI (Genkit)**：项目预置了Google AI功能，但目前未激活。如未来使用，需确保服务器能访问Google AI的API (`generativelanguage.googleapis.com`)。

---

### **API接口与密钥配置 (API & Key Configuration)**

在进行部署前，请确保您已经注册并获取了以下第三方服务的API密钥。这些是保证网站核心功能正常运行所必需的。

| 服务商 | 功能 | 所需环境变量 | 获取指南 |
| :--- | :--- | :--- | :--- |
| **Authing** | 用户认证 (登录/注册) | `AUTHING_APP_ID`<br>`AUTHING_APP_SECRET`<br>`AUTHING_ISSUER`<br>`AUTHING_REDIRECT_URI`<br>`AUTHING_SECRET`<br>`ADMIN_EMAIL` | 请参照 `Authing` 控制台的应用配置。 |
| **Resend** | 邮件服务 (各类通知) | `RESEND_API_KEY` | 详细设置请务必参考项目中的 **`RESEND_GUIDE.md`** 文件。 |
| **图片托管服务 (图床)** | 图片上传 | `IMAGE_UPLOAD_TOKEN`<br>`NEXT_PUBLIC_IMAGE_HOST` | Token请从图床后台获取。域名需单独配置。 |
| **Google AI** | (未来功能) AI相关 | `GEMINI_API_KEY` | 当前未激活。如需使用，请前往 Google AI Studio 获取。 |

您需要在服务器上创建一个 `.env.local` 文件，并将从上述服务获取到的所有密钥填入其中。详细步骤见下文。

---

### **第 1 步：准备服务器环境**

在您的服务器上，您需要确保已安装以下软件：

1.  **Node.js**: 推荐使用 **18.x** 或 **20.x** 版本。您可以通过运行 `node -v` 来检查版本。
2.  **Git**: 用于从代码仓库拉取项目。

---

### **第 2 步：获取项目代码**

通过 SSH 登录到您的服务器，然后运行以下命令将代码克隆到服务器上：

```bash
# 请将下面的 URL 替换为您自己的项目 GitHub 仓库地址
git clone https://github.com/YourUsername/YourRepository.git
```

这会在当前目录下创建一个与您仓库同名的文件夹。接下来，请进入这个文件夹：

```bash
# 请将 "YourRepository" 替换为您的文件夹名
cd YourRepository
```

后续的所有操作都将在这个项目文件夹中进行。

---

### **第 3 步：安装依赖**

进入项目目录后，运行以下命令安装项目所需的所有依赖包：

```bash
npm install
```

---

### **第 4 步：配置环境变量 (最关键的一步)**

这是**至关重要**的一步。您需要创建一个本地环境变量文件来存放所有的密钥和配置。

1.  在项目根目录中，复制示例文件来创建您的本地配置文件：

    ```bash
    cp .env.local.example .env.local
    ```
    > **注意**: `.env.local` 文件已被`.gitignore`忽略，因此不会被上传到您的Git仓库，确保了密钥安全。

2.  使用文本编辑器（如 `nano` 或 `vim`）打开 `.env.local` 文件：

    ```bash
    nano .env.local
    ```

3.  **将您的真实密钥和配置信息填入文件中**。**请务必将 `...` 替换为您的实际值**，并确保以下两个URL是您网站的**最终域名地址**：

    ```env
# 网站基础URL (⚠️ 极其重要！)
# 这个URL是让您上传的图片在生产环境中正确显示所必需的。
# 请确保填写您网站的完整公网访问地址，并包含协议 (http/https)。
NEXT_PUBLIC_BASE_URL="http://haxis.cn"

# --- Resend API Key (用于邮件通知) ---
# 详细配置请务必参考项目中的 RESEND_GUIDE.md
RESEND_API_KEY="..."

# --- 图片上传服务配置 ---
# 这是用于将图片上传到您的图床的API密钥 (Token)。
IMAGE_UPLOAD_TOKEN="..."

# 这是您的图床域名，不包含 "https://"。例如：cdn.example.com
NEXT_PUBLIC_IMAGE_HOST="..."

# --- Authing 应用配置 (用于用户认证) ---
# 您可以从 Authing 控制台 > 选择您的自建应用 > 应用配置 中找到以下大部分值。
AUTHING_APP_ID="..."
AUTHING_APP_SECRET="..."
# Issuer URL, 通常格式为 https://<YOUR-SUBDOMAIN>.authing.cn
AUTHING_ISSUER="..."

# 登录回调URL, 必须与您在 Authing 应用配置中的 "登录回调 URL" 完全一致
# 您的域名是 haxis.cn，请使用此值。
AUTHING_REDIRECT_URI="http://haxis.cn/api/auth/authing/callback"

# 用于加密会话的密钥, 请生成一个足够复杂的随机字符串 (至少32位)
# 您可以在您的服务器或本地终端使用 `openssl rand -base64 32` 命令生成一个
AUTHING_SECRET="..."

# 管理员邮箱地址
# 拥有此邮箱的用户登录后将自动获得网站的管理员权限
ADMIN_EMAIL="..."
    ```
    > **重要提示**: `AUTHING_SECRET` 用于保护用户登录会话的安全，请务必使用一个足够强大的随机字符串。

4.  保存并关闭文件 (在 `nano` 中，按 `Ctrl+X`，然后按 `Y`，最后按 `Enter`)。

---

### **第 5 步：在 Authing 中配置回调 URL (部署后必须操作)**

为了让 Authing 知道在用户登录成功后应该将他们安全地送回您的网站，您**必须**配置回调 URL 白名单。

1.  **登录到您的 Authing 控制台**。
2.  进入您的应用，找到 **应用配置** -> **登录回调 URL**。
3.  **非常重要**：将您的服务器回调地址完整地粘贴进去：
    **`http://haxis.cn/api/auth/authing/callback`**
    
    > **提示**：此列表支持填写多个地址，每个地址占一行。您可以同时保留本地开发和线上生产的地址。

---

### **第 6 步：构建并启动应用**

1.  **构建应用**: 运行以下命令来创建 Next.js 应用的优化生产版本：
    ```bash
    npm run build
    ```

2.  **启动应用**: 构建完成后，使用以下命令启动服务器：
    ```bash
    npm start
    ```

默认情况下，应用会运行在 `3000` 端口。

---

### **第 7 步：使用 PM2 保持应用持续运行**

直接使用 `npm start` 启动的应用在您关闭终端后会停止。为了让您的网站在后台持续运行并能自动重启，强烈推荐使用进程管理器 `PM2`。

1.  在您的服务器上全局安装 PM2：
    ```bash
    npm install pm2 -g
    ```

2.  使用 PM2 来启动您的应用：
    ```bash
    # 您可以将 "forward-infinity-app" 替换为您想为应用起的名字
    pm2 start npm --name "forward-infinity-app" -- start
    ```

3.  **常用 PM2 命令**:
    *   `pm2 list`: 查看所有正在运行的应用。
    *   `pm2 restart forward-infinity-app`: 重启您的应用。
    *   `pm2 stop forward-infinity-app`: 停止您的应用。
    *   `pm2 logs forward-infinity-app`: 查看应用的实时日志。
    *   `pm2 startup` 和 `pm2 save`: 设置开机自启动，非常重要！

---

### **第 8 步：配置 Nginx 反向代理 (使用 `haxis.cn` 域名访问)**

这一步是让您能通过 `haxis.cn` 直接访问网站的关键。它会将外部对您域名的访问请求，转发到内部运行在 3000 端口的应用上。

#### 1. 安装 Nginx

如果您的服务器是 Ubuntu/Debian 系统，运行以下命令来安装 Nginx：
```bash
sudo apt update
sudo apt install nginx -y
```

#### 2. 创建 Nginx 配置文件

我们需要为您的网站创建一个专门的配置文件。
首先，创建一个新的配置文件：
```bash
sudo nano /etc/nginx/sites-available/haxis.cn
```

然后，**将下面所有的配置代码完整地复制并粘贴到这个新打开的文件中**：
```nginx
server {
    listen 80;
    listen [::]:80;

    # 这里填写您的域名
    server_name haxis.cn www.haxis.cn; 

    location / {
        # 将请求转发到您在 3000 端口运行的 Next.js 应用
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
粘贴完成后，保存并关闭文件 (在 `nano` 中，按 `Ctrl+X`，然后按 `Y`，最后按 `Enter`)。

#### 3. 激活配置

现在，我们需要告诉 Nginx 启用这个新配置。我们通过创建一个“快捷方式”来做到这一点：
```bash
sudo ln -s /etc/nginx/sites-available/haxis.cn /etc/nginx/sites-enabled/
```
> 这行命令会在 `sites-enabled` 目录中创建一个指向您配置文件的链接。

#### 4. 测试并重启 Nginx

在重启之前，先测试一下配置文件语法是否有误，这是一个好习惯：
```bash
sudo nginx -t
```
如果您看到 `syntax is ok` 和 `test is successful` 的字样，说明一切正常。

最后，重启 Nginx 来让所有配置生效：
```bash
sudo systemctl restart nginx
```

**大功告成！** 现在，您应该可以直接在浏览器中输入 `http://haxis.cn` 来访问您的网站了！

> **关于 HTTPS**: 以上配置只适用于 HTTP。启用 HTTPS (SSL加密) 是一个更复杂的步骤，通常需要您使用 Certbot 等工具为您的域名申请免费的 SSL 证书。这超出了本指南的范围，但 Nginx 是实现它的基础。

部署完成！您的网站现在已经在您自己的服务器上，并通过域名成功运行了。

    