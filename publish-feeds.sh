#!/bin/bash
# HALEX-M feed publisher — runs every 15 min via cron
# Builds feed JSON from local SQLite DBs and POSTs to Vercel /api/publish.
#
# TEMPLATE — set these env vars, never hardcode tokens:
#   HALEX_API_TOKEN   (required) Bearer token for /api/publish
#   PUBLISH_ENDPOINT  (optional) default: HALEX-M production /api/publish
#   EVM_DB            (optional) path to EVM pools SQLite DB
#   MARKET_INDEX_DB   (optional) path to market-index SQLite DB
set -e

: "${HALEX_API_TOKEN:?Set HALEX_API_TOKEN env var (see AI_BUILD.md)}"
ENDPOINT="${PUBLISH_ENDPOINT:-https://halex-web-sharpchefjeff-1314.vercel.app/api/publish}"
EVM_DB="${EVM_DB:-$HOME/workspace/solana-tracker/evm.db}"
MARKET_INDEX_DB="${MARKET_INDEX_DB:-$HOME/workspace/solana-tracker/market-index/market_index.db}"
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# 1. launches — 50 most recent EVM pools
sqlite3 "$EVM_DB" "SELECT json_group_array(json_object('chain',chain,'pool_address',pool_address,'base_address',base_address,'base_symbol',base_symbol,'quote_symbol',quote_symbol,'reserve_usd',reserve_usd,'first_seen',first_seen,'source',source)) FROM (SELECT * FROM epools ORDER BY first_seen DESC LIMIT 50);" > "$TMPDIR/launches.json" 2>/dev/null || echo '{"status":"pending"}' > "$TMPDIR/launches.json"

# 2. market-index — top tokens (placeholder if DB empty)
if [ -s "$MARKET_INDEX_DB" ]; then
  sqlite3 "$MARKET_INDEX_DB" "SELECT json_group_array(json_object('symbol',symbol,'name',name,'price',price_usd,'market_cap',market_cap)) FROM (SELECT * FROM tokens ORDER BY market_cap DESC LIMIT 20);" > "$TMPDIR/market-index.json" 2>/dev/null || echo '{"status":"pending","message":"Feed not yet configured"}' > "$TMPDIR/market-index.json"
else
  echo '{"status":"pending","message":"Feed not yet configured"}' > "$TMPDIR/market-index.json"
fi

# 3. oasis — placeholder
echo '{"status":"pending","message":"Oasis feed coming soon"}' > "$TMPDIR/oasis.json"

# 4. enrichment — placeholder
echo '{"status":"pending","message":"Enrichment feed coming soon"}' > "$TMPDIR/enrichment.json"

# Publish each
for feed in launches market-index oasis enrichment; do
  DATA=$(cat "$TMPDIR/$feed.json")
  # Build JSON payload with python to handle escaping
  PAYLOAD=$(python3 -c "import json,sys; print(json.dumps({'feed': sys.argv[1], 'data': json.loads(sys.argv[2])}))" "$feed" "$DATA")
  RESULT=$(curl -s -X POST "$ENDPOINT" \
    -H "Authorization: Bearer $HALEX_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    --max-time 30 \
    --retry 3 \
    --retry-delay 5)
  echo "$(date -u +%FT%TZ) $feed: $RESULT"
done
