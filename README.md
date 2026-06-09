# Geme Vault

精品免费单机游戏分享平台。Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript，JSON 文件存储，无数据库。

## 本地开发

```bash
npm run dev       # 开发服务器 (Turbopack, http://localhost:3000)
npm run build     # 生产构建
npx tsc --noEmit  # TypeScript 类型检查
```

## 服务器部署

1C1G Debian 12，PM2 + nginx + Cloudflare CDN。

```bash
bash setup.sh     # 一键部署
bash update.sh    # 从 GitHub 拉取 → 构建 → 重启（不覆盖 data/ 数据）
bash backup.sh    # 备份 data/ 到 /opt/backups/gemevault/
```

## 密码重置

```bash
node scripts/reset-password.js <用户名> <新密码>
```
