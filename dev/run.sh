#!/usr/bin/env bash
# Minimal dev environment: dependencies, ingress manager, api, ui and portal, in one terminal. Ctrl+C stops them.
# Usage: npm run dev [-- <docker compose args>]
set -euo pipefail
cd "$(dirname "$0")/.."

bash dev/deps.sh "$@"

# the global compose options (e.g. --profile events) given to dev/deps.sh also select the services seen here
compose_args=()
while [ $# -gt 0 ]; do
  case "$1" in
    --scale) shift 2 ;;
    --scale=*) shift ;;
    *) compose_args+=("$1"); shift ;;
  esac
done

set -a
. ./.env
set +a

# where the processes write their logs, dev/logs by default
log_dir=${DEV_LOG_DIR:-dev/logs}
log_prefix=${DEV_LOG_PREFIX:-}
mkdir -p "$log_dir"
set -m
pids=()
cleanup () {
  trap - EXIT INT TERM
  # each process runs in its own process group (set -m): stop npm and what it started
  for pid in "${pids[@]}"; do kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# an optional service is absent when its port variable is empty: blank the ones whose container does not run
running=$(docker compose ${compose_args[@]+"${compose_args[@]}"} ps --services --status running)
for entry in events:EVENTS_PORT agents:AGENTS_PORT mcp:MCP_PORT capture:CAPTURE_PORT; do
  if ! grep -qx "${entry%%:*}" <<< "$running"; then export "${entry##*:}="; fi
done

processes=(ingress api ui portal)
for process in "${processes[@]}"; do
  npm run "dev:$process" < /dev/null > "$log_dir/${log_prefix}$process.log" 2>&1 &
  pids+=($!)
done

echo "logs in $log_dir (${log_prefix}<process>.log for ${processes[*]})"
echo "manager available at http://$DEV_HOST:$NGINX_PORT/portals-manager/dev"
# stop everything as soon as one process exits
wait -n || true
