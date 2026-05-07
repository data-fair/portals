#!/usr/bin/env bash
# Run a command with FORCE_COLOR=1 so the terminal gets ANSI colors,
# while writing a stripped (plain text) copy of stdout/stderr to a log file.
#
# Usage: log-tee.sh <log-file> -- <command...>
#   The "--" is optional.

set -e

LOG_FILE="$1"
shift
[ "${1:-}" = "--" ] && shift

mkdir -p "$(dirname "$LOG_FILE")"

FORCE_COLOR=1 "$@" 2>&1 | tee >(sed -u $'s/\x1b\\[[0-9;]*[a-zA-Z]//g' > "$LOG_FILE")
