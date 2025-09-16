#!/bin/sh
# 这是一个将您当前的项目更改同步到 GitHub 的脚本。

# 退出脚本，如果任何命令失败。
set -e

# === 脚本开始 ===
echo "🚀 开始将当前更改同步到 Git..."

# 0. 强制设置默认的 pull 策略为 rebase，以保持清晰的提交历史
# 这可以避免 "fatal: Need to specify how to reconcile divergent branches" 错误
git config pull.rebase true

# 1. 将所有当前文件夹中的更改（新增、修改、删除）添加到暂存区
echo "正在添加所有文件更改..."
git add .

# 2. 获取提交信息
COMMIT_MESSAGE="$1"
if [ -z "$COMMIT_MESSAGE" ]; then
  COMMIT_MESSAGE="Sync: Update project files"
fi
echo "使用提交信息: '$COMMIT_MESSAGE'"

# 3. 创建一个新的提交
echo "正在创建新的提交..."
# 使用 --allow-empty-message 允许在某些自动化场景下提交空信息
# 如果暂存区为空，则不会创建提交，也不会报错
git commit --allow-empty -m "$COMMIT_MESSAGE"
echo "提交已创建！"


echo "\n\n"
echo "========================================================================"
echo "✅ 本地提交已成功创建！"
echo ""
echo "下一步，请在终端手动运行以下命令来将您的提交推送到 GitHub："
echo "\n"
echo "    git pull origin \"3.1（增加过渡动画）\" --rebase"
echo "    git push"
echo "\n"
echo "这个命令会先将远程的更改合并到本地，然后再将您的代码上传。"
echo "========================================================================"
