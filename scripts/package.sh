#!/usr/bin/env bash
set -euo pipefail

flavor="${1:?Usage: scripts/package.sh chrome|firefox}"
case "$flavor" in
  chrome|firefox) ;;
  *) echo 'Flavor must be chrome or firefox.' >&2; exit 2 ;;
esac

root="$(cd "$(dirname "$0")/.." && pwd)"
stage="$root/dist/$flavor"
archive="$root/dist/ip-extension-$flavor.zip"

rm -rf "$stage" "$archive"
mkdir -p "$stage"
cp "$root/manifest.$flavor.json" "$stage/manifest.json"
cp -R "$root/src" "$root/assets" "$stage/"
(
  cd "$stage"
  zip -X -q -r "$archive" manifest.json src assets
)
echo "Created $archive"
