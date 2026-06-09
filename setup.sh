#!/bin/bash
# 首次部署脚本 — Debian 12 服务器
# 用法: 在项目目录执行 bash setup.sh
set -e

echo "=== 安装 Node.js 22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "=== 安装 Nginx + PM2 ==="
apt-get install -y nginx
npm install -g pm2

echo "=== 项目目录 ==="
mkdir -p /opt/gemevault
cp -r . /opt/gemevault/
cd /opt/gemevault

echo "=== 初始化数据文件（如果不存在） ==="
mkdir -p data
for f in games.json mods.json android.json windows.json users.json feedback.json search-stats.json; do
  if [ ! -f "data/$f" ]; then
    echo "  创建 data/$f ..."
    case "$f" in
      games.json)     echo '{"games":[],"categories":[]}' > "data/$f" ;;
      mods.json)      echo '{"mods":[],"categories":[],"games":[]}' > "data/$f" ;;
      android.json)   echo '{"apps":[],"categories":[]}' > "data/$f" ;;
      windows.json)   echo '{"apps":[],"categories":[]}' > "data/$f" ;;
      users.json)     echo '{"users":[{"id":1,"username":"admin","email":"admin@game.com","password":"CHANGE_ME","role":"admin","createdAt":"2026-01-01T00:00:00.000Z"}],"nextId":2}' > "data/$f" ;;
      feedback.json)  echo '{"feedbacks":[]}' > "data/$f" ;;
      search-stats.json) echo '{"queries":{}}' > "data/$f" ;;
    esac
  fi
done

echo "=== 安装依赖 ==="
npm ci --omit=dev

echo "=== 构建 ==="
npm run build

echo "=== Nginx 配置 ==="
cp nginx.conf /etc/nginx/sites-available/gemevault
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/gemevault /etc/nginx/sites-enabled/gemevault
nginx -t && systemctl reload nginx

echo "=== PM2 启动 ==="
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "==================== 部署完成 ===================="
echo "访问 http://服务器IP 即可"
echo ""
echo "首次登录: admin / 密码需用 bcrypt 生成后替换 data/users.json"
echo "后续更新代码: ssh 到服务器，cd /opt/gemevault && bash update.sh"
echo "数据备份:   tar czf backup-\$(date +%Y%m%d).tar.gz data/"
echo "================================================="
echo ""
pm2 status
