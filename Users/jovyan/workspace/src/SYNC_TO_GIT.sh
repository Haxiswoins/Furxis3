
#!/bin/sh
# 这是一个将您当前的项目更改同步到 GitHub 的脚本。

# 退出脚本，如果任何命令失败。
set -e

# === 脚本开始 ===
echo "🚀 开始将当前更改同步到 Git..."

# 0. 设置默认的 pull 策略为 rebase，以保持清晰的提交历史
# 这可以避免 "fatal: Need to specify how to reconcile divergent branches" 错误
git config pull.rebase true

# 1. 检查远程 'origin' 是否存在，如果不存在则尝试从 .git/config 中恢复
if ! git remote | grep -q "^origin$"; then
    echo "🤔 未找到名为 'origin' 的远程仓库。"
    # 尝试从初始设置脚本留下的配置中恢复
    if [ -f ".git/config" ] && grep -q 'url = ' .git/config; then
        REMOTE_URL=$(grep 'url = ' .git/config | awk '{print $3}')
        if [ -n "$REMOTE_URL" ]; then
            echo "正在尝试从配置文件中恢复远程仓库: $REMOTE_URL"
            git remote add origin "$REMOTE_URL"
            echo "✅ 成功添加 'origin'。"
        else
            echo "❌ 无法在 .git/config 中找到远程 URL。请先运行 SETUP_GIT.sh 脚本。"
            exit 1
        fi
    else
        echo "❌ 找不到 .git/config 或其中没有 URL。请先运行 SETUP_GIT.sh 脚本。"
        exit 1
    fi
fi


# 2. 将所有当前文件夹中的更改（新增、修改、删除）添加到暂存区
echo "正在添加所有文件更改..."
git add .

# 3. 获取提交信息
if [ -z "$1" ]; then
  echo "请输入本次更新的描述信息 (例如: '修复了bug' 或 '添加了新功能')，然后按 Enter:"
  read COMMIT_MESSAGE
else
  COMMIT_MESSAGE="$1"
fi

# 如果没有输入任何信息，提供一个默认值
if [ -z "$COMMIT_MESSAGE" ]; then
  COMMIT_MESSAGE="Sync: Update project files"
  echo "未提供描述，使用默认信息: '$COMMIT_MESSAGE'"
fi

# 4. 创建一个新的提交
echo "正在创建新的提交..."
# 使用双引号包裹提交信息以支持更复杂的字符串
git commit -m "$COMMIT_MESSAGE" --allow-empty
echo "提交已创建！"


echo "\n\n"
echo "========================================================================"
echo "✅ 本地提交已成功创建！"
echo ""
echo "下一步，请在终端手动运行以下命令来将您的提交推送到 GitHub："
echo "\n"
echo "    git push"
echo "\n"
echo "这个命令会将您刚刚创建的“存档点”上传到您的 GitHub 仓库。"
echo "========================================================================"
