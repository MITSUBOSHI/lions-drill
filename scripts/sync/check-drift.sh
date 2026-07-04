#!/usr/bin/env bash
# このリポジトリの共有コードが upstream(baystars-drill)と一致しているか検査する。
# 乖離があれば一覧を表示して exit 1。CI(shared-drift.yml)から呼ばれる。
#
# 使い方(チームリポジトリのルートで実行):
#   bash scripts/sync/check-drift.sh <upstream-dir>
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <upstream-dir>" >&2
  exit 2
fi

REPO_DIR=$(pwd)
UPSTREAM_DIR=$(cd "$1" && pwd)
MANIFEST="$REPO_DIR/scripts/sync/shared-paths.txt"

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

drift=0
for path in "${includes[@]}"; do
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

  if [ -d "$UPSTREAM_DIR/$path" ] || [ -d "$REPO_DIR/$path" ]; then
    out=$(rsync -rlcn $delete_arg --itemize-changes "${ex_args[@]}" \
      "$UPSTREAM_DIR/$path/" "$REPO_DIR/$path/" 2>/dev/null || true)
  else
    out=$(rsync -lcn --itemize-changes "$UPSTREAM_DIR/$path" "$REPO_DIR/$path" 2>/dev/null || true)
  fi

  if [ -n "$out" ]; then
    drift=1
    echo "== drift: $path =="
    echo "$out"
  fi
done

if [ "$drift" -ne 0 ]; then
  cat >&2 <<'MSG'

共有コードが upstream(baystars-drill)と乖離しています。
upstream 側で `bash scripts/sync/sync-shared.sh <このリポジトリ>` を実行して
同期するか、逆方向の変更なら upstream に取り込んでから同期してください。
MSG
  exit 1
fi

echo "共有コードは upstream と一致しています ✓"
