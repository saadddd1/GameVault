#!/bin/bash
# 服务器安全加固脚本 — Debian 12
# 用法：连上服务器后 bash harden.sh
set -e

echo "=== 1. 系统更新 ==="
apt update && apt upgrade -y

echo ""
echo "=== 2. 基础安全工具 ==="
apt install -y ufw fail2ban unattended-upgrades

echo ""
echo "=== 3. 数据目录权限 ==="
chmod 700 /opt/gemevault/data
chmod 600 /opt/gemevault/data/.secret
echo "  已设置: data/ 700, .secret 600"

echo ""
echo "=== 4. UFW 防火墙 ==="
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable
echo "  防火墙已开启: 22, 80, 443 放行"

echo ""
echo "=== 5. fail2ban ==="
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
maxretry = 3
bantime = 3600
findtime = 600
EOF
systemctl restart fail2ban
echo "  SSH 爆破防护已启用: 10分钟内3次失败封1小时"

echo ""
echo "=== 6. 自动安全更新 ==="
echo 'APT::Periodic::Update-Package-Lists "1";' > /etc/apt/apt.conf.d/20auto-upgrades
echo 'APT::Periodic::Unattended-Upgrade "1";' >> /etc/apt/apt.conf.d/20auto-upgrades
echo 'APT::Periodic::AutocleanInterval "7";' >> /etc/apt/apt.conf.d/20auto-upgrades
echo "  自动安全更新已开启（仅安全补丁）"

echo ""
echo "=== 7. Nginx 隐藏版本号 ==="
if grep -q "server_tokens off;" /etc/nginx/nginx.conf; then
  echo "  已配置，跳过"
else
  sed -i '/^http {/a\    server_tokens off;' /etc/nginx/nginx.conf
  nginx -t && systemctl reload nginx
  echo "  已隐藏 nginx 版本号"
fi

echo ""
echo "==================== 完成 ===================="
echo "  建议接下来手动做:"
echo "  1. 修改 root 密码: passwd"
echo "  2. 建专用用户: useradd -r -s /bin/false gameapp"
echo "  3. SSH 密钥登录: 把公钥加到 ~/.ssh/authorized_keys"
echo "  4. 禁用密码登录: /etc/ssh/sshd_config → PasswordAuthentication no"
echo "  5. Cloudflare SSL/TLS 设为 Full (strict)"
echo "=============================================="
