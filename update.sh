#!/bin/bash
# 生产服务器增量更新脚本
# 用法: ssh 到服务器，cd /opt/gamevault && bash update.sh
# 不会覆盖 data/*.json 生产数据
set -e

echo "=== 拉取最新代码 ==="
git pull origin master

echo "=== 安装依赖 ==="
npm ci --omit=dev

echo "=== 构建 ==="
npm run build

echo "=== 重启服务（零停机 reload） ==="
pm2 reload gamevault

echo "=== 状态 ==="
pm2 status

echo "更新完成！"
echo "如果 nginx 配置有变更，运行: cp nginx.conf /etc/nginx/sites-available/gamevault && nginx -t && systemctl reload nginx"
