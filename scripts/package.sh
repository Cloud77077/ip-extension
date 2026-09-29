#!/usr/bin/env bash
set -euo pipefail
flavor="${1:?Usage: scripts/package.sh chrome|firefox}"
case "$flavor" in chrome|firefox) ;; *) echo 'Flavor must be chrome or firefox.' >&2; exit 2;; esac
root="$(cd "$(dirname "$0")/.." && pwd)"; stage="$root/dist/$flavor"; zipfile="$root/dist/hm-proxy-time-$flavor.zip"
rm -rf "$stage" "$zipfile"; mkdir -p "$stage"
cp "$root/manifest.$flavor.json" "$stage/manifest.json"
cp -R "$root/src" "$root/assets" "$stage/"
(cd "$stage" && zip -qr "$zipfile" manifest.json src assets)
echo "Created $zipfile"
