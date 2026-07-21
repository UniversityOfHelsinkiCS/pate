#!/usr/bin/env bash
#
# Upload a test file to a locally running Pate. Multer stores it in the
# /tmp/uploads dir and Pate answers with the fileId, which can be used as
# "attachmentFileId" when sending mail.
#
# Usage: ./sendtestfile.sh [file] [options]
#
#   -u, --url URL   Pate base url (default: http://localhost:8000, env PATE_URL)
#   -h, --help      Show this help
#
# With no file given, a small text file is generated and uploaded.

set -euo pipefail

usage() {
  sed -n '2,13p' "$0" | sed 's/^#\{1,2\} \{0,1\}//'
}

url="${PATE_URL:-http://localhost:8000}"
file=""

while [ $# -gt 0 ]; do
  case "$1" in
    -u|--url) url="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
    *)
      if [ -n "$file" ]; then
        echo "Only one file can be given" >&2
        exit 1
      fi
      file="$1"; shift ;;
  esac
done

cleanup() { :; }
trap 'cleanup' EXIT

if [ -z "$file" ]; then
  timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
  file="$(mktemp -t pate-testfile-XXXXXX.txt)"
  cleanup() { rm -f "$file"; }
  printf 'Test file uploaded by sendtestfile.sh at %s\n' "$timestamp" > "$file"
elif [ ! -f "$file" ]; then
  echo "No such file: $file" >&2
  exit 1
fi

echo "POST $url/upload"
echo "file: $file ($(wc -c < "$file" | tr -d ' ') bytes)"

curl -fsS -X POST "$url/upload" -F "file=@$file"

echo
