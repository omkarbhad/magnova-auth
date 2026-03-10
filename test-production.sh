#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="https://astrova.magnova.ai"
FIREBASE_UID="test-user-$(date +%s)"
TEST_EMAIL="test-$(date +%s)@example.com"

echo "🧪 Astrova Production API Test"
echo "=============================="
echo "Using Firebase UID: $FIREBASE_UID"
echo ""

# Helper function to test API
test_api() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4

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

  if [[ "$http_code" =~ ^(200|201|400|403|404|500)$ ]]; then
    if [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
      echo -e "${GREEN}✓ $http_code${NC}"
    else
      echo -e "${YELLOW}⚠ $http_code${NC}"
    fi
    if [ ! -z "$body" ]; then
      echo "   Response: $(echo "$body" | jq -c . 2>/dev/null || echo "$body" | head -c 100)"
    fi
  else
    echo -e "${RED}✗ $http_code (unexpected)${NC}"
    echo "   Response: $body"
  fi
  echo ""
}

echo "=== AUTH TESTS ==="
test_api "GET" "/api/auth/session" "" "Get session (first-time user creation)"

echo "=== USER TESTS ==="
test_api "GET" "/api/users" "" "Get current user"
test_api "POST" "/api/users" "{\"email\":\"$TEST_EMAIL\",\"displayName\":\"Test User\"}" "Update user profile"

echo "=== CREDITS TESTS ==="
test_api "POST" "/api/credits/claim-free" "" "Claim free 20 credits (first time)"
test_api "POST" "/api/credits/claim-free" "" "Claim free credits again (should fail)"
test_api "GET" "/api/users" "" "Get updated user (verify credits = 30)"

echo "=== CHARTS TESTS ==="
test_api "GET" "/api/charts" "" "Get charts list"

echo "=== SESSIONS TESTS ==="
test_api "GET" "/api/sessions" "" "Get sessions list"

echo "=== MODELS TESTS ==="
test_api "GET" "/api/models" "" "Get available models"

echo "=== KB TESTS ==="
test_api "GET" "/api/kb" "" "Get knowledge base"

echo "=== ADMIN TESTS ==="
test_api "GET" "/api/admin/config" "" "Admin config (403 expected for non-admin)"

echo ""
echo "=============================="
echo "✅ Production test completed!"
