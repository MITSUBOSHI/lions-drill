#!/usr/bin/env bash
# 共有コードを upstream(このスクリプトがあるリポジトリ)から対象リポジトリへ同期する。
#
# 使い方(baystars-drill のルートで実行):
#   bash scripts/sync/sync-shared.sh ../hawks-drill
#   bash scripts/sync/sync-shared.sh ../lions-drill
#
# --dry-run を付けると変更予定の一覧だけを表示する。
set -euo pipefail

DRY_RUN=""
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN="--dry-run"
  shift
fi

if [ $# -ne 1 ]; then
  echo "usage: $0 [--dry-run] <target-repo-dir>" >&2
  exit 2
fi

SRC_DIR=$(cd "$(dirname "$0")/../.." && pwd)
DEST_DIR=$(cd "$1" && pwd)
MANIFEST="$SRC_DIR/scripts/sync/shared-paths.txt"

if [ ! -f "$DEST_DIR/src/config/team.config.json" ]; then
  echo "error: $DEST_DIR は team drill リポジトリに見えません" >&2
  exit 1
fi

includes=()
additive=()
excludes=()
while IFS= read -r raw; do
  line="${raw%%#*}"
  line="$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  [ -z "$line" ] && continue
  case "$line" in
    !*) excludes+=("${line#!}") ;;
    +*)
      includes+=("${line#+}")
      additive+=("${line#+}")
      ;;
    *) includes+=("$line") ;;
  esac
done <"$MANIFEST"

is_additive() {
  local p
  for p in "${additive[@]:-}"; do
    [ "$p" = "$1" ] && return 0
  done
  return 1
}

changed=0
for path in "${includes[@]}"; do
  # このパス配下に該当する除外を rsync の除外(転送ルート相対)に変換する
  ex_args=()
  for ex in "${excludes[@]}"; do
    case "$ex" in
      "$path"/*) ex_args+=(--exclude "/${ex#"$path"/}") ;;
    esac
  done

  delete_arg="--delete"
  if is_additive "$path"; then
    delete_arg=""
  fi

  if [ -d "$SRC_DIR/$path" ]; then
    mkdir -p "$DEST_DIR/$path"
    out=$(rsync -rlc $delete_arg $DRY_RUN --itemize-changes "${ex_args[@]}" \
      "$SRC_DIR/$path/" "$DEST_DIR/$path/")
  elif [ -f "$SRC_DIR/$path" ]; then
    mkdir -p "$DEST_DIR/$(dirname "$path")"
    out=$(rsync -lc $DRY_RUN --itemize-changes "$SRC_DIR/$path" "$DEST_DIR/$path")
  else
    echo "warn: $path が upstream に存在しません" >&2
    continue
  fi

  if [ -n "$out" ]; then
    changed=1
    echo "== $path =="
    echo "$out"
  fi
done

if [ "$changed" -eq 0 ]; then
  echo "共有コードは既に同期済みです"
elif [ -n "$DRY_RUN" ]; then
  echo "(dry-run: 実際には変更していません)"
else
  echo "同期完了。$DEST_DIR で tsc / jest / build を実行して確認してください"
fi
