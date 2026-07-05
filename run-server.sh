#!/bin/bash
cd /home/z/my-project
exec 0>/dev/null
exec 1>/home/z/my-project/server.log
exec 2>/home/z/my-project/server-err.log
while true; do
  NODE_ENV=production NODE_OPTIONS="--trace-warnings" node .next/standalone/server.js
  echo "[$(date)] Restarting..." >&2
  sleep 1
done
