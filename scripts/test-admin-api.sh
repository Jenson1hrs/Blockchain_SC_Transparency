#!/usr/bin/env bash
# Admin API smoke test — run from the project root (fabric-project/).
#
# Prerequisites: API running, jq installed, admin account exists.
#
#   cd /path/to/fabric-project
#   EMAIL=admin@example.com PASSWORD=yourpass API=http://localhost:3000 ./scripts/test-admin-api.sh
#
# LAN (match fabric-frontend/.env VITE_API_BASE_URL):
#   EMAIL=... PASSWORD=... API=http://192.168.1.6:3000 ./scripts/test-admin-api.sh

set -euo pipefail

API="${API:-http://localhost:3000}"
EMAIL="${EMAIL:?Set EMAIL (admin account)}"
PASSWORD="${PASSWORD:?Set PASSWORD}"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Install: sudo apt install jq"
  exit 1
fi

echo "API: $API"
echo "Logging in as $EMAIL ..."

LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN" | jq -r '.token // empty')
if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "Login failed:"
  echo "$LOGIN" | jq .
  exit 1
fi

AUTH=(-H "Authorization: Bearer $TOKEN")

echo ""
echo "=== GET /health (public) ==="
curl -s "$API/health" | jq

echo ""
echo "=== GET /admin/system-status ==="
curl -s "$API/admin/system-status" "${AUTH[@]}" | jq

echo ""
echo "=== GET /admin/users (summary) ==="
curl -s "$API/admin/users" "${AUTH[@]}" | jq '{ success, userCount: (.data | length), roleCounts }'

echo ""
echo "=== GET /dashboard/summary ==="
curl -s "$API/dashboard/summary" "${AUTH[@]}" | jq

echo ""
echo "Done."
