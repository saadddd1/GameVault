#!/bin/bash
# GameVault 一键部署脚本
# 用法: 在 game-site/ 目录下执行 bash deploy.sh
# 流程: 推送代码 → 同步数据/图片 → 服务器拉取 → 构建 → 重启 → 验证
set -e

SERVER="root@185.216.118.136"
APP_DIR="/opt/gemevault"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== 1/5 推送代码到 GitHub ===${NC}"
git push origin master

echo ""
echo -e "${GREEN}=== 2/5 同步数据文件 ===${NC}"
echo "  → data/*.json + .secret"
scp data/*.json "$SERVER:$APP_DIR/data/" 2>/dev/null
if [ -f "data/.secret" ]; then
  scp data/.secret "$SERVER:$APP_DIR/data/"
fi

echo ""
echo -e "${GREEN}=== 3/5 同步图片资源 ===${NC}"
echo "  → public/images/"
rsync -avz --delete public/images/ "$SERVER:$APP_DIR/public/images/" 2>/dev/null || \
  scp -r public/images/* "$SERVER:$APP_DIR/public/images/" 2>/dev/null || \
  echo "  (无新图片或同步跳过)"

echo ""
echo -e "${GREEN}=== 4/5 服务器更新 ===${NC}"
ssh "$SERVER" "cd $APP_DIR && bash update.sh"

echo ""
echo -e "${GREEN}=== 5/5 验证部署 ===${NC}"
HTTP_CODE=$(curl -sk -o /dev/null -w '%{http_code}' https://lootvault.dpdns.org)
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 部署成功 — HTTPS 200${NC}"
else
  echo -e "${RED}✗ 部署可能失败 — HTTPS $HTTP_CODE${NC}"
fi
echo ""
echo "访问: https://lootvault.dpdns.org"
