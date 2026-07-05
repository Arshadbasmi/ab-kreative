#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_ENV=production NODE_OPTIONS="--trace-warnings" node .next/standalone/server.js >> /home/z/my-project/server.log 2>> /home/z/my-project/server-err.log
  sleep 1
done
