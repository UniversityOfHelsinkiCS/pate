#!/usr/bin/env bash
#
# Send a test mail through a locally running Pate, sent as Toska. Asks for the
# receiver and an optional attachment.
#
# Usage: ./sendtestmail.sh [email] [options]
#
#   -a, --attachment F   Local file or fileId, skips the prompt ("" for none)
#   -u, --url URL        Pate base url (default: http://localhost:8000, env PATE_URL)
#   -s, --subject TEXT   Subject (default: "Pate test mail <timestamp>")
#   -m, --text TEXT      Body text (default: a short test message)
#   -p, --preview        POST to /preview and print the html instead of sending
#   -d, --dryrun         Let Pate accept and log the payload without sending
#   -h, --help           Show this help
#
# Anything not given on the command line is asked for. A local file is
# uploaded to /upload first and attached by the fileId that comes back. A bare
# name that is not a local file is used as the fileId as is, for reusing
# something that was uploaded earlier. Pate resolves it under /tmp/uploads, so
# a fileId is always a plain filename, never a path.
#
# Note: Pate always sends from noreply@helsinki.fi, the "from" field only sets
# the display name, which is "Toska" here.

set -euo pipefail

usage() {
  sed -n '2,24p' "$0" | sed 's/^#\{1,2\} \{0,1\}//'
}

url="${PATE_URL:-http://localhost:8000}"
subject=""
text=""
preview=false
dryrun=false
to=""
attachment=""
attachment_given=false

while [ $# -gt 0 ]; do
  case "$1" in
    -a|--attachment) attachment="$2"; attachment_given=true; shift 2 ;;
    -u|--url) url="$2"; shift 2 ;;
    -s|--subject) subject="$2"; shift 2 ;;
    -m|--text) text="$2"; shift 2 ;;
    -p|--preview) preview=true; shift ;;
    -d|--dryrun) dryrun=true; shift ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
    *)
      if [ -n "$to" ]; then
        echo "Only one email address can be given" >&2
        exit 1
      fi
      to="$1"; shift ;;
  esac
done

# Keep it strict: the address is interpolated into json below
valid_email() {
  printf '%s' "$1" | grep -Eq '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
}

while [ -z "$to" ] || ! valid_email "$to"; do
  [ -z "$to" ] || echo "Not a valid email address: $to" >&2
  if [ ! -t 0 ]; then
    echo "Missing receiver email address" >&2
    exit 1
  fi
  read -r -p "Receiver email: " to
done

# A local file gets uploaded, anything else is taken as an already uploaded
# fileId. Pate prepends /tmp/uploads to it, so a fileId cannot contain a path.
usable_attachment() {
  [ -z "$1" ] || [ -f "$1" ] || case "$1" in */*|.|..) return 1 ;; *) return 0 ;; esac
}

while ! $attachment_given; do
  if [ ! -t 0 ]; then
    attachment_given=true
    break
  fi
  read -r -e -p "Local file to upload, or fileId (empty for none): " attachment
  if usable_attachment "$attachment"; then
    attachment_given=true
  else
    echo "Not a local file, and not usable as a fileId: $attachment" >&2
  fi
done

if ! usable_attachment "$attachment"; then
  echo "Not a local file, and not usable as a fileId: $attachment" >&2
  exit 1
fi

timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
[ -n "$subject" ] || subject="Pate test mail $timestamp"
[ -n "$text" ] || text="This is a test mail sent by sendtestmail.sh at $timestamp.\nSent to $to."

# Escape quotes and backslashes for json. Literal \n in --text stays a newline.
escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\\\\n/\\n/g'
}

attachment_field=""
if [ -n "$attachment" ]; then
  if [ -f "$attachment" ]; then
    echo "POST $url/upload ($attachment)"
    upload_response="$(curl -fsS -X POST "$url/upload" -F "file=@$attachment")"
    file_id="$(printf '%s' "$upload_response" | sed -n 's/.*"fileId" *: *"\([^"]*\)".*/\1/p')"
    if [ -z "$file_id" ]; then
      echo "Upload failed: $upload_response" >&2
      exit 1
    fi
    echo "fileId: $file_id"
  else
    file_id="$attachment"
    echo "fileId: $file_id (not uploaded, expected to be in /tmp/uploads already)"
  fi
  attachment_field="
      \"attachmentFileId\": \"$(escape "$file_id")\","
fi

endpoint="$url"
$preview && endpoint="$url/preview"

payload=$(cat <<EOF
{
  "template": {
    "from": "Toska",
    "text": "$(escape "$text")"
  },
  "emails": [
    {$attachment_field
      "to": "$to",
      "subject": "$(escape "$subject")"
    }
  ],
  "settings": {
    "disableToska": true,
    "header": "Pate test",
    "color": "lightsteelblue",
    "headerFontColor": "black",
    "dryrun": $dryrun
  }
}
EOF
)

echo "POST $endpoint"
echo "to: $to (from Toska <noreply@helsinki.fi>)"
$dryrun && echo "dryrun: mail will be logged but not sent"

curl -fsS -X POST "$endpoint" \
  -H 'Content-Type: application/json' \
  --data-binary "$payload"

echo
