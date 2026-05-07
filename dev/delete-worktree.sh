#!/bin/bash
# Delete a worktree (and its docker containers/volumes/local images).
#
# Refuses to proceed if the worktree has uncommitted changes or commits not
# pushed to any origin ref. Pass -f / --force to bypass these checks.

set -e

FORCE=false
BRANCH_NAME=""

while [ $# -gt 0 ]; do
    case "$1" in
        -f|--force) FORCE=true ;;
        -h|--help)
            echo "Usage: $0 <branch> [-f|--force]"
            echo "  --force / -f  skip uncommitted/unpushed safety checks"
            exit 0
            ;;
        -*)
            echo "Error: unknown flag '$1'"
            echo "Usage: $0 <branch> [-f|--force]"
            exit 1
            ;;
        *)
            if [ -z "$BRANCH_NAME" ]; then
                BRANCH_NAME="$1"
            else
                echo "Error: too many positional arguments"
                exit 1
            fi
            ;;
    esac
    shift
done

if [ -z "$BRANCH_NAME" ]; then
    echo "Error: Please provide a branch name."
    echo "Usage: $0 <branch> [-f|--force]"
    exit 1
fi

REPO_NAME=$(basename "$PWD")
TARGET_DIR="../${REPO_NAME}_${BRANCH_NAME}"

if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Worktree directory $TARGET_DIR does not exist."
    exit 1
fi

ORIGIN_DIR="$PWD"

if [ "$FORCE" != true ]; then
    echo "Checking $TARGET_DIR for uncommitted / unpushed work…"
    cd "$TARGET_DIR"

    # Refresh remote refs so the "unpushed" check is accurate
    git fetch origin --quiet 2>/dev/null || true

    DIRTY=$(git status --porcelain)
    if [ -n "$DIRTY" ]; then
        echo
        echo "❌ Refusing to delete: $TARGET_DIR has uncommitted changes:"
        echo "$DIRTY" | sed 's/^/    /'
        echo
        echo "Commit / push / stash them, or pass -f / --force to bypass."
        exit 1
    fi

    # Commits reachable from HEAD but NOT reachable from any origin/* ref.
    # Catches: never-pushed branches, branches ahead of upstream, detached HEAD with unique commits.
    UNPUSHED_COUNT=$(git rev-list --count HEAD --not --remotes=origin 2>/dev/null || echo 0)
    if [ "$UNPUSHED_COUNT" -gt 0 ]; then
        echo
        echo "❌ Refusing to delete: $TARGET_DIR has $UNPUSHED_COUNT commit(s) not present on any origin ref:"
        git --no-pager log --oneline HEAD --not --remotes=origin | sed 's/^/    /'
        echo
        echo "Push them (e.g. 'git push -u origin $BRANCH_NAME'), or pass -f / --force to bypass."
        exit 1
    fi

    cd "$ORIGIN_DIR"
    echo "✓ working tree clean and all commits present on origin"
fi

echo "Stopping & removing docker compose services in $TARGET_DIR (with volumes and orphans)"
cd "$TARGET_DIR"
# --profile dev --profile test : catch every container the worktree may have started
# -v : drop named volumes (mongo, elasticsearch, s3mock, clamav…) — data is worktree-scoped
# --remove-orphans : sweep any container left over from a previous compose file
# --rmi local : remove images built locally for this worktree (keeps remote-pulled images)
docker compose --profile dev --profile test down -v --remove-orphans --rmi local

echo "Removing git worktree at $TARGET_DIR"
cd "$ORIGIN_DIR"
git worktree remove "$TARGET_DIR"

echo "-----------------------------------------------"
echo "✅ Worktree $BRANCH_NAME deleted!"
echo "-----------------------------------------------"
