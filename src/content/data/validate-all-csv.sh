#!/bin/bash

# Script để validate tất cả file CSV với output chi tiết
# Sử dụng: ./validate-all-csv.sh [--verbose]

echo "🚀 Starting CSV validation for all files..."
echo "================================================"
echo ""

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Biến đếm
TOTAL=0
PASSED=0
FAILED=0
VERBOSE=false

# Parse arguments
if [[ "$1" == "--verbose" || "$1" == "-v" ]]; then
    VERBOSE=true
fi

# Function để validate một file với output chi tiết
validate_file() {
    local file=$1
    local type=$2
    local name=$3
    
    TOTAL=$((TOTAL + 1))
    
    echo -e "${BLUE}📋 Validating $name...${NC}"
    echo "   File: $file"
    echo "   Type: $type"
    
    # Run validation and capture output
    local output
    output=$(npx tsx src/content/cli/validate.ts "$file" "$type" 2>&1)
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}   ✅ PASSED${NC}"
        PASSED=$((PASSED + 1))
        
        # Show summary even on success if verbose
        if [ "$VERBOSE" = true ]; then
            echo "$output" | grep -E "(Total Rows|Valid Rows|✅)" | sed 's/^/   /'
        fi
    else
        echo -e "${RED}   ❌ FAILED${NC}"
        FAILED=$((FAILED + 1))
        
        # Always show errors
        echo ""
        echo -e "${YELLOW}   Errors found:${NC}"
        echo "$output" | grep -E "(❌|Error|Trường|không hợp lệ|thiếu|bị trùng)" | sed 's/^/   /'
        echo ""
        echo -e "   ${YELLOW}Để xem chi tiết, chạy:${NC}"
        echo "   npx tsx src/content/cli/validate.ts $file $type"
    fi
    echo ""
    
    return $exit_code
}

# Header
echo "Validating content files..."
echo "----------------------------"
echo ""

# Core content files
echo -e "${BLUE}=== Core Content ===${NC}"
validate_file "src/content/data/characters.csv" "character" "Characters"
validate_file "src/content/data/swimsuits.csv" "swimsuit" "Swimsuits"
validate_file "src/content/data/accessories.csv" "accessory" "Accessories"
validate_file "src/content/data/events.csv" "event" "Events"
validate_file "src/content/data/gachas.csv" "gacha" "Gachas"
validate_file "src/content/data/episodes.csv" "episode" "Episodes"
validate_file "src/content/data/missions.csv" "mission" "Missions"
validate_file "src/content/data/items.csv" "item" "Items"

echo -e "${BLUE}=== Guide/Tool/Quiz Content ===${NC}"
validate_file "src/content/data/guides.csv" "guide" "Guides"
validate_file "src/content/data/tools.csv" "tool" "Tools"
validate_file "src/content/data/quizzes.csv" "quiz" "Quizzes"

echo -e "${BLUE}=== Taxonomy ===${NC}"
validate_file "src/content/data/categories.csv" "category" "Categories"
validate_file "src/content/data/tags.csv" "tag" "Tags"

# Tổng kết
echo ""
echo "================================================"
echo "📊 Validation Summary"
echo "================================================"
echo "Total files:  $TOTAL"
echo -e "${GREEN}Passed:       $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed:       $FAILED${NC}"
else
    echo "Failed:       0"
fi
echo "================================================"

# Chi tiết về các loại lỗi thường gặp
if [ $FAILED -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}💡 Các lỗi thường gặp và cách sửa:${NC}"
    echo ""
    echo "1. Trường bắt buộc bị thiếu:"
    echo "   → Kiểm tra và điền đầy đủ các trường required"
    echo ""
    echo "2. Format không đúng:"
    echo "   → ID: số nguyên dương (1, 2, 3...)"
    echo "   → unique_key: chữ thường, số, dấu gạch ngang (my-key)"
    echo "   → Ngày: YYYY-MM-DDTHH:mm:ssZ (2024-01-20T00:00:00Z)"
    echo "   → JSON: {\"POW\":450,\"TEC\":380,\"STM\":420}"
    echo "   → Mảng: item1|item2|item3 (dùng dấu |)"
    echo ""
    echo "3. Giá trị enum không hợp lệ:"
    echo "   → status: draft, published, archived"
    echo "   → rarity: SSR, SR, R"
    echo "   → Xem MANUAL_DATASET.md để biết các giá trị hợp lệ"
    echo ""
    echo "4. ID hoặc unique_key bị trùng:"
    echo "   → Kiểm tra và đảm bảo mỗi ID/unique_key là duy nhất"
    echo ""
fi

# Exit code
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All validations passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED file(s) failed validation. Please fix the errors above.${NC}"
    exit 1
fi
