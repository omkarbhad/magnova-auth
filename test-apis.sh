#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5173"
API_BASE="http://localhost:5173/api"
FIREBASE_UID="test-user-$(date +%s)"
TEST_EMAIL="test@example.com"

echo "🧪 Astrova API Test Suite"
echo "========================="
echo "Using Firebase UID: $FIREBASE_UID"
echo ""

# Helper function to test API
test_api() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_code=$4
  local description=$5

  echo -n "🔹 $description ... "

  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" \
      -X "$method" \
      "$API_BASE$endpoint" \
      -H "Cookie: magnova_session=$FIREBASE_UID" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" \
      -X "$method" \
      "$API_BASE$endpoint" \
      -H "Cookie: magnova_session=$FIREBASE_UID" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" == "$expected_code" ]; then
    echo -e "${GREEN}✓ $http_code${NC}"
    if [ ! -z "$body" ]; then
      echo "   Response: $(echo "$body" | jq -c . 2>/dev/null || echo "$body" | head -c 100)"
    fi
  else
    echo -e "${RED}✗ Expected $expected_code, got $http_code${NC}"
    echo "   Response: $body"
  fi
  echo ""
}

echo "=== AUTH TESTS ==="
test_api "GET" "/auth/session" "" "200" "Get session (first-time user creation)"

echo "=== USER TESTS ==="
test_api "GET" "/users" "" "200" "Get current user"
test_api "POST" "/users" "{\"email\":\"$TEST_EMAIL\",\"displayName\":\"Test User\"}" "200" "Update user profile"

echo "=== CREDITS TESTS ==="
test_api "POST" "/credits/claim-free" "" "200" "Claim free 20 credits (first time)"
test_api "POST" "/credits/claim-free" "" "400" "Claim free credits again (should fail)"

test_api "GET" "/users" "" "200" "Get updated user (check credits = 30)"

echo "=== CHARTS TESTS ==="
test_api "GET" "/charts" "" "200" "Get charts list"
test_api "POST" "/charts" "{\"name\":\"Test Chart\",\"birth_data\":{\"date\":\"2000-01-01\",\"time\":\"12:00:00\",\"place\":\"New York\"}}" "201" "Create chart"

echo "=== SESSIONS TESTS ==="
test_api "GET" "/sessions" "" "200" "Get sessions list"

echo "=== MODELS TESTS ==="
test_api "GET" "/models" "" "200" "Get available models"

echo "=== KB TESTS ==="
test_api "GET" "/kb" "" "200" "Get knowledge base"

echo "=== ADMIN TESTS ==="
test_api "GET" "/admin/config" "" "403" "Admin config (should be forbidden for non-admin)"

echo ""
echo "========================="
echo "✅ Test suite completed!"
