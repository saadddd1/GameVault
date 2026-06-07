#!/bin/bash
set -e

echo "=== 安装 Node.js 22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "=== 安装 Nginx + PM2 ==="
apt-get install -y nginx
npm install -g pm2

echo "=== 项目目录 ==="
mkdir -p /opt/gamevault
cp -r . /opt/gamevault/

cd /opt/gamevault
npm ci --omit=dev

echo "=== 构建 ==="
npm run build

echo "=== Nginx 配置 ==="
cp nginx.conf /etc/nginx/sites-available/gamevault
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/gamevault /etc/nginx/sites-enabled/gamevault
nginx -t && systemctl reload nginx

echo "=== PM2 启动 ==="
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo "=== 部署完成 ==="
echo "访问 http://服务器IP 即可"
pm2 status
