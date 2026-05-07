#!/usr/bin/env bash
# Bring up dev docker containers, stream their logs to a file in the background,
# and watch a status table refreshed every 4 seconds.
#
# Containers are NOT stopped when this script exits (Ctrl+C in the pane just
# stops the watch + log streamer). They are stopped via "npm run stop-dev-deps",
# which is chained after zellij in the "dev-zellij" script so the cleanup only
# happens when the whole zellij session is closed.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_DIR"

mkdir -p dev/logs

docker compose --profile dev up -d --wait

docker compose --profile dev logs -f --no-color > dev/logs/docker-compose.log 2>&1 &
LOG_PID=$!

trap 'kill "$LOG_PID" 2>/dev/null || true' EXIT INT TERM

watch -c -n 4 -t "docker compose ps --all --format 'table {{.Name}}\t{{.Status}}'"
