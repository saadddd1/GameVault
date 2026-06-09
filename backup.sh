#!/bin/bash
# 数据备份脚本 — 建议 crontab 每天执行一次
# 用法: bash backup.sh
# cron: 0 3 * * * cd /opt/gamevault && bash backup.sh

BACKUP_DIR="/opt/backups/gamevault"
mkdir -p "$BACKUP_DIR"

DATE=$(date +%Y%m%d-%H%M)
FILE="$BACKUP_DIR/gamevault-data-$DATE.tar.gz"

tar czf "$FILE" data/*.json data/.secret

# 只保留最近 7 天的备份
ls -t "$BACKUP_DIR"/gamevault-data-*.tar.gz | tail -n +8 | xargs -r rm

echo "备份完成: $FILE ($(du -h "$FILE" | cut -f1))"
