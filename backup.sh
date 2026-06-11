#!/bin/bash
# 数据备份脚本 — 建议 crontab 每小时执行一次
# 用法: bash backup.sh
# cron: 0 3 * * * cd /opt/gemevault && bash backup.sh

BACKUP_DIR="/opt/backups/gemevault"
mkdir -p "$BACKUP_DIR"

DATE=$(date +%Y%m%d-%H%M)
FILE="$BACKUP_DIR/gemevault-data-$DATE.tar.gz"

tar czf "$FILE" data/*.json data/.secret

# 只保留最近 30 份备份
ls -t "$BACKUP_DIR"/gemevault-data-*.tar.gz | tail -n +31 | xargs -r rm

echo "备份完成: $FILE ($(du -h "$FILE" | cut -f1))"
