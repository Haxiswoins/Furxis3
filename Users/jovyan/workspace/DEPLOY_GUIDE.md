
# 网站服务器部署指南

本文档将指导您如何将此 Next.js 应用程序部署到您自己的服务器。

> **⚠️ 极其重要：网络连接要求**
> 为了让用户认证等核心功能正常工作，您的服务器**必须**具备稳定访问 Authing 认证服务的能力，其服务域名为 `*.authing.cn`。

---

### **API接口与密钥配置 (API & Key Configuration)**

在进行部署前，请确保您已经注册并获取了以下第三方服务的API密钥。

| 服务商 | 功能 | 所需环境变量 | 获取指南 |
| :--- | :--- | :--- | :--- |
| **Authing** | 用户认证 | `AUTHING_APP_ID`<br>`AUTHING_APP_SECRET`<br>`AUTHING_REDIRECT_URI`<br>`AUTHING_SECRET`<br>`ADMIN_EMAIL`<br>`AUTHING_AUTH_ENDPOINT`<br>`AUTHING_TOKEN_ENDPOINT`<br>`AUTHING_USERINFO_ENDPOINT`<br>`NEXT_PUBLIC_AUTHING_LOGOUT_ENDPOINT`| 请参照 `Authing` 控制台的应用配置。 |
| **Resend** | 邮件服务 | `RESEND_API_KEY` | 请参考项目中的 `RESEND_GUIDE.md`。 |
| **图床** | 图片上传 | `IMAGE_UPLOAD_TOKEN`<br>`NEXT_PUBLIC_IMAGE_HOST` | Token请从图床后台获取。域名需单独配置。|

---

### **第 1 步：准备服务器环境**

1.  **Node.js**: 推荐使用 **18.x** 或 **20.x** 版本。
2.  **Git**: 用于从代码仓库拉取项目。

---

### **第 2 步：获取项目代码**

通过 SSH 登录到您的服务器，然后运行 `git clone` 将代码克隆到您的服务器上。

---

### **第 3 步：安装依赖**

进入项目目录后，运行 `npm install`。

---

### **第 4 步：配置环境变量 (最关键的一步)**

这是**至关重要**的一步。您需要在项目根目录中创建一个 `.env.local` 文件。

1.  使用文本编辑器（如 `nano` 或 `vim`）打开 `.env.local` 文件：
    ```bash
    nano .env.local
    ```

2.  **将您的真实密钥和配置信息填入文件中**。**请务必将所有 `...` 替换为您的实际值**。

    ```env
# 网站基础URL (⚠️ 极其重要！)
# 请确保填写您网站的完整公网访问地址，并包含协议 (https)
# 例如: https://www.yourdomain.com
NEXT_PUBLIC_BASE_URL="https://haxis.cn"

# --- Resend API Key (用于邮件通知) ---
RESEND_API_KEY="..."

# --- 图片上传服务配置 ---
IMAGE_UPLOAD_TOKEN="..."
NEXT_PUBLIC_IMAGE_HOST="..."

# --- Authing 应用配置 (用于用户认证) ---
AUTHING_APP_ID="..."
AUTHING_APP_SECRET="..."

# 登录回调URL
# 您的服务器必须使用这个地址来接收 Authing 的回调。
# ⚠️ 这个值必须与您在第5步中添加到 Authing 白名单中的地址完全一致！
AUTHING_REDIRECT_URI="https://haxis.cn/api/auth/authing/callback"

# Authing 端点 (请从 Authing 控制台的应用配置页面复制完整的 URL)
AUTHING_AUTH_ENDPOINT="https://..."
AUTHING_TOKEN_ENDPOINT="https://..."
AUTHING_USERINFO_ENDPOINT="https://..."
NEXT_PUBLIC_AUTHING_LOGOUT_ENDPOINT="https://..."

# 用于加密会话的密钥, 请生成一个足够复杂的随机字符串 (至少32位)
# 您可以在终端使用 `openssl rand -base64 32` 命令生成。
AUTHING_SECRET="..."

# 管理员邮箱地址
ADMIN_EMAIL="..."
    ```
    > **重要提示**: `AUTHING_SECRET` 用于保护用户登录会话的安全，请务必使用一个足够强大的随机字符串。

3.  保存并关闭文件 (在 `nano` 中，按 `Ctrl+X`，然后按 `Y`，最后按 `Enter`)。

---

### **第 5 步：在 Authing 中配置回调 URL (解决问题的关键)**

为了让 Authing 知道在用户登录成功后应该将他们安全地送回您网站的哪个地址，您**必须**将这个地址添加到回调 URL 白名单。

1.  **登录到您的 Authing 控制台**。
2.  在左侧菜单进入 **应用**，然后选择您正在使用的应用。
3.  在您的应用页面中，找到 **应用配置** 选项卡。
4.  向下滚动找到 **登录回调 URL** 的配置区域。
5.  **将您网站的回调地址完整地粘贴进去**。这个地址的格式为：`您网站的公网域名/api/auth/authing/callback`。

    根据您的 `.env.local` 文件配置，您需要添加的地址是：
    *   **`https://haxis.cn/api/auth/authing/callback`**

    > **提示**: 此列表支持填写多个地址，每个地址占一行。如果您本地也需要开发测试，可以把本地地址 `http://localhost:3000/api/auth/authing/callback` 也加上。

---

### **第 6 步：构建并启动应用**

1.  **构建应用**: 运行 `npm run build`
2.  **启动应用**: 使用 PM2 或 `npm start` 启动。

部署完成！配置好回调 URL 后，登录问题应该就解决了。
