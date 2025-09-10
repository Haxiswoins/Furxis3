
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
| **Google AI** | (未来功能) AI相关 | `GOOGLE_API_KEY` 或 `GEMINI_API_KEY` | 当前未激活。如需使用，请前往 Google AI Studio 获取。 |

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
    cp .env .env.local
    ```
    > **注意**: `.env.local` 文件已被`.gitignore`忽略，因此不会被上传到您的Git仓库，确保了密钥安全。

2.  使用文本编辑器（如 `nano` 或 `vim`）打开 `.env.local` 文件：

    ```bash
    nano .env.local
    ```

3.  **将您的真实密钥和配置信息填入文件中**。文件内容应如下所示，**请务必将所有 `...` 替换为您的实际值**：

    ```env
# 网站基础URL (⚠️ 极其重要！)
# 这个URL是让您上传的图片在生产环境中正确显示所必需的。
# 请确保填写您网站的完整公网访问地址，并包含协议 (http/https)，例如：https://www.yourdomain.com 或 http://YOUR_SERVER_IP:3000
NEXT_PUBLIC_BASE_URL="..."

# --- Resend API Key (用于邮件通知) ---
# 详细配置请务必参考项目中的 RESEND_GUIDE.md
RESEND_API_KEY="..."

# --- 图片上传服务配置 ---
# 这是用于将图片上传到您的图床的API密钥 (Token)。
# 格式通常是 "1|abcdefg..."，请完整粘贴。
IMAGE_UPLOAD_TOKEN="..."

# 这是您的图床域名，不包含 "https://"。例如：cdn.example.com
# 配置此项后，后台上传的图片才能正确显示。
NEXT_PUBLIC_IMAGE_HOST="..."

# --- Authing 应用配置 (用于用户认证) ---
# 您可以从 Authing 控制台 > 选择您的自建应用 > 应用配置 中找到以下大部分值。
AUTHING_APP_ID="..."
AUTHING_APP_SECRET="..."
# Issuer URL, 通常格式为 https://<YOUR-SUBDOMAIN>.authing.cn
AUTHING_ISSUER="..."

# 登录回调URL, 必须与您在 Authing 应用配置中的 "登录回调 URL" 完全一致
#
# ⚠️ 注意：本地开发时，您需要将 "http://localhost:3000/api/auth/authing/callback" 添加到 Authing 白名单。
#         线上部署后，您需要将 "https://您的域名/api/auth/authing/callback" 添加到 Authing 白名单。
#         请根据您的部署情况修改此值！
AUTHING_REDIRECT_URI="http://localhost:3000/api/auth/authing/callback"

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

为了让 Authing 知道在用户登录成功后应该将他们安全地送回您网站的哪个地址，您**必须**配置回调 URL 白名单。

1.  **登录到您的 Authing 控制台**。
2.  进入您的应用，找到 **应用配置** -> **登录回调 URL**。
3.  将您部署后的网站回调地址完整地粘贴进去。地址的格式为：**`您网站的公网域名/api/auth/authing/callback`**。

    例如：
    *   如果您的域名是 `https://www.suitopia.club`，您需要填写：`https://www.suitopia.club/api/auth/authing/callback`
    *   如果您的访问地址是 `http://123.45.67.89:3000`，您需要填写：`http://123.45.67.89:3000/api/auth/authing/callback`
    
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

默认情况下，应用会运行在 `3000` 端口。您现在应该可以通过服务器的 IP 地址和端口访问您的网站了（例如 `http://YOUR_SERVER_IP:3000`）。

---

### **(推荐) 第 7 步：使用 PM2 保持应用持续运行**

直接使用 `npm start` 启动的应用在您关闭终端后会停止。为了让您的网站在后台持续运行并能自动重启，强烈推荐使用进程管理器 `PM2`。

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
    *   `pm2 logs suitopia-app`: 查看应用的实时日志。
    *   `pm2 startup` 和 `pm2 save`: 设置开机自启动，非常重要！

---

### **(可选) 第 8 步：配置反向代理（如 Nginx）**

为了使用域名（例如 `www.yourdomain.com`）并通过标准的 80 (HTTP) 和 443 (HTTPS) 端口访问您的网站，您需要设置一个反向代理。Nginx 是一个非常流行的选择。

这通常涉及编辑 Nginx 的配置文件，将来自您域名的请求转发到 Next.js 应用正在运行的本地端口（`http://localhost:3000`）。这是一个专业的系统管理任务，具体配置会根据您的服务器和域名设置而异。

部署完成！您的网站现在已经在您自己的服务器上成功运行了。
