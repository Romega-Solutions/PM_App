#!/usr/bin/env bash
# =============================================================================
# run-android.sh — launch PinayMate on a USB-connected Android phone via Expo Go
#
# Uses Metro + Expo Go over an adb USB bridge. NO native build (no expo
# run:android), so it pulls zero NDK/Gradle — saves disk.
#
# Usage:
#   npm run android:go              # via the package.json alias
#   bash scripts/run-android.sh     # directly
#
# Optional env overrides:
#   PORT=8081           Metro port (default 8081)
#   DEVICE=<adb-serial> target a specific device (default: first one connected)
# =============================================================================
set -euo pipefail

PORT="${PORT:-8081}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

EXPO_URL="exp://127.0.0.1:${PORT}"

# --- preflight ---------------------------------------------------------------
command -v adb >/dev/null 2>&1 || { echo "❌ adb not found — install Android platform-tools."; exit 1; }
command -v npx >/dev/null 2>&1 || { echo "❌ npx not found — install Node.js."; exit 1; }

# Pick the connected device: env override, else the first 'device' in adb.
DEVICE="${DEVICE:-$(adb devices | awk '/\tdevice$/{print $1; exit}')}"
if [ -z "${DEVICE:-}" ]; then
  echo "❌ No Android device connected over USB."
  echo "   • Plug in the phone, enable USB debugging, approve the prompt on-screen."
  echo "   • Verify with:  adb devices"
  exit 1
fi
echo "📱 Device: $DEVICE   ·   Port: $PORT"

# Opens the project in Expo Go on the phone (USB bridge + VIEW intent).
open_on_phone() {
  adb -s "$DEVICE" reverse "tcp:${PORT}" "tcp:${PORT}" >/dev/null 2>&1
  adb -s "$DEVICE" shell am start -a android.intent.action.VIEW -d "$EXPO_URL" >/dev/null 2>&1
}

# --- if Metro is already running, just push to the phone and exit ------------
if curl -s -o /dev/null -m 2 "http://127.0.0.1:${PORT}/status" 2>/dev/null; then
  echo "ℹ️  Metro already running on ${PORT} — opening the app on the phone."
  open_on_phone
  echo "✅ Opened in Expo Go on $DEVICE ($EXPO_URL)."
  exit 0
fi

# --- otherwise: wire the phone once Metro is up (background), then run Metro --
(
  for _ in $(seq 1 90); do
    if curl -s -o /dev/null -m 2 "http://127.0.0.1:${PORT}/status" 2>/dev/null; then
      open_on_phone
      echo ""
      echo "✅ Opened in Expo Go on $DEVICE ($EXPO_URL) — the bundle builds on the phone."
      exit 0
    fi
    sleep 1
  done
  echo "⚠️  Metro didn't answer on port ${PORT} within 90s."
  echo "   Open Expo Go manually and enter:  $EXPO_URL"
) &

echo "🚀 Starting Metro (Expo Go, offline). Press Ctrl-C to stop."
exec npx expo start --go --offline --port "$PORT"
