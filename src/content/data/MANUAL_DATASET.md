# Hướng Dẫn Chi Tiết Điều Chỉnh Dataset

Tài liệu này hướng dẫn cách thêm, sửa, xóa dữ liệu cho từng schema (page) trong hệ thống content management.

## Mục Lục

1. [Tổng Quan Cấu Trúc](#tổng-quan-cấu-trúc)
2. [Quy Tắc Chung](#quy-tắc-chung)
3. [Schema Chi Tiết](#schema-chi-tiết)
   - [Characters](#1-characters)
   - [Swimsuits](#2-swimsuits)
   - [Events](#3-events)
   - [Gachas](#4-gachas)
   - [Episodes](#5-episodes)
   - [Guides](#6-guides)
   - [Tools](#7-tools)
   - [Quizzes](#8-quizzes)
   - [Accessories](#9-accessories)
   - [Missions](#10-missions)
   - [Items](#11-items)
   - [Categories](#12-categories)
   - [Tags](#13-tags)

---

## Tổng Quan Cấu Trúc

```
src/content/data/
├── accessories.csv      # Phụ kiện
├── categories.csv       # Danh mục
├── characters.csv       # Nhân vật
├── episodes.csv         # Tập phim/Episode
├── events.csv           # Sự kiện
├── gachas.csv           # Banner gacha
├── guides.csv           # Hướng dẫn (metadata)
├── items.csv            # Vật phẩm
├── missions.csv         # Nhiệm vụ
├── quizzes.csv          # Quiz (metadata)
├── swimsuits.csv        # Trang phục bơi
├── tags.csv             # Thẻ tag
├── tools.csv            # Công cụ (metadata)
├── guides/              # Nội dung markdown cho guides
├── tools/               # Nội dung markdown cho tools
└── quizzes/             # Nội dung markdown cho quizzes
```

---

## Quy Tắc Chung

### 1. Định Dạng CSV và Cách Sử Dụng Excel

#### Cài Đặt Excel Để Mở/Lưu CSV Đúng Cách

**Mở file CSV trong Excel:**
1. Mở Excel → File → Open → Browse
2. Chọn file `.csv`
3. Trong Text Import Wizard:
   - **Step 1**: Chọn `Delimited`, File origin: `65001: Unicode (UTF-8)`
   - **Step 2**: Check `Comma` làm delimiter
   - **Step 3**: Chọn `Text` cho tất cả các cột (quan trọng!)
4. Click Finish

**Lưu file CSV từ Excel:**
1. File → Save As → Browse
2. Save as type: `CSV UTF-8 (Comma delimited) (*.csv)`
3. **QUAN TRỌNG**: Chọn đúng `CSV UTF-8`, KHÔNG chọn `CSV (Comma delimited)`

#### Quy Tắc Format Trong Excel

| Loại dữ liệu | Format trong Excel | Ví dụ |
|--------------|-------------------|-------|
| **Số nguyên** | Number, 0 decimal | `1`, `100`, `5000` |
| **Số thập phân** | Number, 1-2 decimal | `3.3`, `15.0`, `0.35` |
| **Văn bản** | Text | `misaki`, `WikiTeam` |
| **Ngày giờ** | Text (KHÔNG dùng Date) | `2024-01-20T00:00:00Z` |
| **Boolean** | Text | `true`, `false` |
| **JSON** | Text | `{"POW":450,"TEC":380}` |
| **Mảng** | Text | `tag1\|tag2\|tag3` |

#### Cách Nhập Dữ Liệu Đặc Biệt Trong Excel

**1. Trường JSON (stats):**
```
Nhập trực tiếp: {"POW":450,"TEC":380,"STM":420,"APL":48}
```
> ⚠️ KHÔNG cần escape dấu ngoặc kép khi nhập trong Excel. Excel tự động xử lý khi lưu CSV.

**2. Trường Mảng (tags, related_ids):**
```
Nhập: tag1|tag2|tag3
```
> Dùng dấu `|` (pipe) để phân cách, KHÔNG có khoảng trắng.

**3. Trường Ngày Giờ:**
```
Nhập dạng TEXT: 2024-01-20T00:00:00Z
```
> ⚠️ Format ô thành Text TRƯỚC khi nhập để Excel không tự động chuyển đổi.

**4. Trường Boolean:**
```
Nhập: true hoặc false (chữ thường)
```

**5. Ô trống:**
```
Để trống hoàn toàn, KHÔNG nhập gì
```

#### Các Lỗi Thường Gặp Khi Dùng Excel

| Lỗi | Nguyên nhân | Cách khắc phục |
|-----|-------------|----------------|
| Ngày bị đổi format | Excel tự động format | Format ô thành Text trước khi nhập |
| Số bị mất số 0 đầu | Excel coi là số | Format ô thành Text |
| Ký tự đặc biệt bị lỗi | Sai encoding | Lưu với UTF-8 BOM |
| JSON bị lỗi | Dấu ngoặc kép bị escape sai | Kiểm tra lại format khi lưu |
| Dấu phẩy trong text | Excel tách thành cột mới | Đặt trong dấu ngoặc kép |

#### Template Excel Mẫu

Để tránh lỗi, hãy:
1. Mở file CSV gốc bằng Excel với cài đặt đúng
2. Sao chép dòng mẫu có sẵn
3. Sửa dữ liệu trong dòng mới
4. Lưu với format `CSV UTF-8`

### 2. Quy Tắc ID và Unique Key

| Trường | Quy tắc |
|--------|---------|
| `id` | Số nguyên dương, tự động tăng, không trùng lặp |
| `unique_key` | Chuỗi lowercase, dùng dấu gạch ngang `-`, không dấu, không trùng lặp |

### 3. Trường Hình Ảnh (Image)

Hệ thống hỗ trợ nhiều định dạng đường dẫn hình ảnh:

| Loại | Ví dụ | Mô tả |
|------|-------|-------|
| **Web URL** | `https://example.com/image.jpg` | URL từ internet |
| **Windows Path** | `C:\Users\data\images\kasumi.png` | Đường dẫn tuyệt đối Windows |
| **Windows UNC** | `\\server\share\images\image.jpg` | Đường dẫn mạng Windows |
| **Unix Path** | `/home/user/images/image.jpg` | Đường dẫn tuyệt đối Unix/Mac |
| **Relative Path** | `images/kasumi.png` | Đường dẫn tương đối |
| **Data URL** | `data:image/png;base64,...` | Hình ảnh nhúng base64 |

**Lưu ý quan trọng cho Windows Path:**
- Sử dụng backslash `\` như bình thường: `C:\Images\character.png`
- Hệ thống tự động chuyển đổi sang `file:///` URL
- Đảm bảo file tồn tại và có quyền truy cập

**Ví dụ trong CSV:**
```csv
# Web URL
https://images.unsplash.com/photo-xxx?q=80&w=800

# Windows Path (escape backslash trong CSV nếu cần)
C:\GameData\DOAXVV\Images\characters\misaki.png

# Relative Path
images/characters/misaki.png
```

### 4. Trường Đa Ngôn Ngữ (Localized)

Các trường hỗ trợ đa ngôn ngữ có suffix:
- `_en` - Tiếng Anh (bắt buộc)
- `_jp` - Tiếng Nhật (bắt buộc)
- `_cn` - Tiếng Trung giản thể
- `_tw` - Tiếng Trung phồn thể
- `_kr` - Tiếng Hàn

### 5. Trường JSON

**Format trong Excel:**
```
{"POW":450,"TEC":380,"STM":420,"APL":48}
```

**Format khi lưu CSV (tự động):**
```csv
"{""POW"":450,""TEC"":380,""STM"":420,""APL"":48}"
```

> 📝 Khi nhập trong Excel, chỉ cần gõ JSON bình thường. Excel sẽ tự động escape khi lưu CSV.

**Các trường JSON trong hệ thống:**
| Schema | Trường | Ví dụ |
|--------|--------|-------|
| Characters | `stats` | `{"POW":850,"TEC":920,"STM":880,"APL":95}` |
| Swimsuits | `stats` | `{"POW":450,"TEC":380,"STM":420,"APL":48}` |
| Accessories | `stats` | `{"POW":50,"TEC":30,"STM":20,"APL":10}` |

### 6. Trường Mảng (Array)

**Format:** Dùng dấu `|` (pipe) để phân cách, KHÔNG có khoảng trắng

**Trong Excel:**
```
tag1|tag2|tag3
misaki|honoka|kasumi
SSR Ticket x1|5000 V-Stones|Limited Title
```

**Các trường mảng trong hệ thống:**
| Schema | Trường | Ví dụ |
|--------|--------|-------|
| Tất cả | `tags` | `accessory\|ssr\|head` |
| Tất cả | `related_ids` | `event-1\|gacha-1` |
| Events | `rewards_en/jp` | `SSR Ticket x1\|5000 V-Stones` |
| Events | `how_to_participate_en/jp` | `Complete missions\|Collect tokens` |
| Events | `tips_en/jp` | `Use boosted characters\|Save stamina` |
| Missions | `objectives` | `Win 5 matches\|Collect 100 tokens` |
| Missions | `rewards` | `1000 V-Stones\|SSR Ticket` |
| Missions | `requirements` | `Level 10\|Complete tutorial` |
| Guides | `topics` | `Basics\|Currency\|Gacha` |
| Gachas | `featured_swimsuits` | `swimsuit-1\|swimsuit-2` |
| Gachas | `featured_characters` | `misaki\|honoka` |
| Accessories | `character_ids` | `misaki\|honoka\|kasumi` |
| Episodes | `character_ids` | `misaki\|marie-rose` |

### 7. Trường Ngày Tháng

**Format ISO 8601:** `YYYY-MM-DDTHH:mm:ssZ`

**Trong Excel (format ô thành Text):**
```
2024-01-20T00:00:00Z
2024-02-05T14:00:00Z
2025-01-01T00:00:00Z
```

**Cách nhập trong Excel:**
1. Chọn ô/cột cần nhập ngày
2. Right-click → Format Cells → Number tab → Text
3. Nhập ngày theo format: `YYYY-MM-DDTHH:mm:ssZ`

**Ví dụ chuyển đổi:**
| Ngày thường | Format ISO 8601 |
|-------------|-----------------|
| 20/01/2024 00:00 | `2024-01-20T00:00:00Z` |
| 05/02/2024 14:00 | `2024-02-05T14:00:00Z` |
| 31/12/2024 23:59 | `2024-12-31T23:59:00Z` |

**Các trường ngày trong hệ thống:**
| Schema | Trường | Mô tả |
|--------|--------|-------|
| Events | `start_date` | Ngày bắt đầu sự kiện |
| Events | `end_date` | Ngày kết thúc sự kiện |
| Gachas | `start_date` | Ngày bắt đầu banner |
| Gachas | `end_date` | Ngày kết thúc banner |
| Episodes | `release_date` | Ngày phát hành |

> ⚠️ **QUAN TRỌNG**: Luôn format ô thành Text trước khi nhập ngày để Excel không tự động chuyển đổi!

### 8. Trạng Thái (Status)

**Trong Excel:** Nhập chính xác một trong các giá trị sau (chữ thường)

| Giá trị | Mô tả |
|---------|-------|
| `draft` | Bản nháp, chưa hiển thị |
| `published` | Đã xuất bản, hiển thị công khai |
| `archived` | Đã lưu trữ, ẩn khỏi danh sách |

### 9. Trường Enum (Giá Trị Cố Định)

Các trường enum phải nhập chính xác giá trị cho phép:

| Schema | Trường | Giá trị hợp lệ |
|--------|--------|----------------|
| Swimsuits | `rarity` | `SSR`, `SR`, `R` |
| Accessories | `rarity` | `SSR`, `SR`, `R` |
| Accessories | `obtain_method` | `Event`, `Gacha`, `Shop`, `Quest`, `Login` |
| Events | `type` | `Main`, `Daily`, `Event` |
| Events | `event_status` | `Active`, `Upcoming`, `Ended` |
| Gachas | `gacha_status` | `Active`, `Coming Soon`, `Ended` |
| Episodes | `type` | `Character`, `Gravure`, `Event`, `Extra`, `Bromide` |
| Episodes | `episode_status` | `Available`, `Coming Soon`, `Limited` |
| Missions | `type` | `Daily`, `Weekly`, `Event` |
| Quizzes | `difficulty` | `Easy`, `Medium`, `Hard` |
| Items | `type` | `Decoration`, `Consumable`, `Material` |
| Tất cả | `status` | `draft`, `published`, `archived` |

> ⚠️ Phân biệt chữ hoa/thường! `SSR` ≠ `ssr`, `Active` ≠ `active`

### 10. Trường Số

**Số nguyên (Integer):**
```
Trong Excel: 1, 100, 5000
Format ô: Number, 0 decimal places
```

**Số thập phân (Decimal):**
```
Trong Excel: 3.3, 15.0, 0.35
Format ô: Number, 1-2 decimal places
```

**Các trường số trong hệ thống:**
| Schema | Trường | Kiểu | Ví dụ |
|--------|--------|------|-------|
| Tất cả | `id` | Integer | `1`, `25`, `100` |
| Gachas | `rates_ssr` | Decimal | `3.3`, `4.0`, `5.0` |
| Gachas | `rates_sr` | Decimal | `15.0`, `18.0` |
| Gachas | `rates_r` | Decimal | `81.7`, `78.0` |
| Gachas | `pity_at` | Integer | `100`, `200` |
| Swimsuits | `max_level` | Integer | `70`, `80`, `90` |
| Swimsuits | `base_pow`, `max_pow` | Integer | `150`, `450` |
| Swimsuits | `pow_growth` | Decimal | `3.3`, `2.8` |
| Quizzes | `time_limit` | Integer (giây) | `300`, `600` |
| Quizzes | `question_count` | Integer | `5`, `10` |
| Tags | `usage_count` | Integer | `0`, `5`, `12` |
| Categories | `order` | Integer | `1`, `2`, `3` |

---

## Schema Chi Tiết


### 1. Characters

**File**: `src/content/data/characters.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Ví dụ |
|--------|------|-------|-------|
| `id` | number | ID duy nhất | `1` |
| `unique_key` | string | Key duy nhất | `misaki` |
| `image` | string | URL hình ảnh | `https://...` |
| `stats` | JSON | Chỉ số nhân vật | `"{""POW"":850,""TEC"":920,""STM"":880,""APL"":95}"` |
| `updated_at` | string | Ngày cập nhật | `2024-01-15` |
| `author` | string | Tác giả | `WikiTeam` |
| `status` | enum | Trạng thái | `published` |
| `name_en` | string | Tên tiếng Anh | `Misaki` |
| `name_jp` | string | Tên tiếng Nhật | `みさき` |
| `birthday_en` | string | Sinh nhật (EN) | `July 7` |
| `birthday_jp` | string | Sinh nhật (JP) | `7月7日` |
| `height_en` | string | Chiều cao (EN) | `158cm` |
| `height_jp` | string | Chiều cao (JP) | `158cm` |
| `hobby_en` | string | Sở thích (EN) | `Surfing` |
| `hobby_jp` | string | Sở thích (JP) | `サーフィン` |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `related_ids` | string | ID liên quan (phân cách bằng `\|`) |
| `name_cn`, `name_tw`, `name_kr` | string | Tên đa ngôn ngữ |
| `age_en`, `age_jp` | string | Tuổi |
| `measurements_en`, `measurements_jp` | string | Số đo |
| `blood_type_en`, `blood_type_jp` | string | Nhóm máu |
| `job_en`, `job_jp` | string | Nghề nghiệp |
| `food_en`, `food_jp` | string | Món ăn yêu thích |
| `color_en`, `color_jp` | string | Màu yêu thích |
| `cast_en`, `cast_jp`, `cast_cn`, `cast_tw`, `cast_kr` | string | Diễn viên lồng tiếng |

#### Ví Dụ Thêm Bản Ghi Mới

```csv
31,new-character,https://images.unsplash.com/photo-xxx,"{""POW"":800,""TEC"":850,""STM"":820,""APL"":90}",2024-12-15,WikiTeam,published,related-swimsuit-1|related-swimsuit-2,New Character,新キャラクター,新角色,新角色,새 캐릭터,20,20歳,January 1,1月1日,165cm,165cm,B88/W56/H86,B88/W56/H86,A,A型,Student,学生,Reading,読書,Cake,ケーキ,Blue,青,Voice Actor EN,声優JP,,,
```

---

### 2. Swimsuits

**File**: `src/content/data/swimsuits.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Ví dụ |
|--------|------|-------|-------|
| `id` | number | ID duy nhất | `1` |
| `unique_key` | string | Key duy nhất | `venus-dream-misaki` |
| `rarity` | enum | Độ hiếm | `SSR`, `SR`, `R` |
| `character_id` | string | ID nhân vật | `misaki` |
| `image` | string | URL hình ảnh | `https://...` |
| `stats` | JSON | Chỉ số | `"{""POW"":450,""TEC"":380,""STM"":420,""APL"":48}"` |
| `updated_at` | string | Ngày cập nhật | `2024-01-15` |
| `author` | string | Tác giả | `WikiTeam` |
| `status` | enum | Trạng thái | `published` |
| `name_en` | string | Tên tiếng Anh | `Venus Dream` |
| `name_jp` | string | Tên tiếng Nhật | `ヴィーナスドリーム` |

#### Các Trường Chỉ Số Chi Tiết

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `max_level` | number | Level tối đa (70/80/90) |
| `base_pow`, `max_pow` | number | POW cơ bản và tối đa |
| `base_tec`, `max_tec` | number | TEC cơ bản và tối đa |
| `base_stm`, `max_stm` | number | STM cơ bản và tối đa |
| `base_apl`, `max_apl` | number | APL cơ bản và tối đa |
| `pow_growth`, `tec_growth`, `stm_growth`, `apl_growth` | number | Hệ số tăng trưởng |

#### Các Trường Kỹ Năng (Skills)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `skill1_name_en`, `skill1_name_jp` | string | Tên skill 1 |
| `skill1_desc_en`, `skill1_desc_jp` | string | Mô tả skill 1 |
| `skill2_name_en`, `skill2_name_jp` | string | Tên skill 2 |
| `skill2_desc_en`, `skill2_desc_jp` | string | Mô tả skill 2 |
| `skill3_name_en`, `skill3_name_jp` | string | Tên skill 3 |
| `skill3_desc_en`, `skill3_desc_jp` | string | Mô tả skill 3 |

#### Ví Dụ Thêm Bản Ghi Mới

```csv
31,new-swimsuit-ssr,SSR,misaki,https://images.unsplash.com/photo-xxx,"{""POW"":470,""TEC"":400,""STM"":430,""APL"":49}",2024-12-15,WikiTeam,published,misaki,90,155,470,135,400,145,430,16,49,3.5,2.9,3.2,0.36,New Swimsuit,新水着,新泳装,新泳裝,새 수영복,Power Boost,パワーブースト,Increases POW by 20%,POWを20%上昇,Defense Up,ディフェンスアップ,Defense +15%,防御+15%,,,,
```

---

### 3. Events

**File**: `src/content/data/events.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Giá trị hợp lệ |
|--------|------|-------|----------------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | |
| `type` | enum | Loại sự kiện | `Main`, `Daily`, `Event` |
| `event_status` | enum | Trạng thái sự kiện | `Active`, `Upcoming`, `Ended` |
| `start_date` | datetime | Ngày bắt đầu | `2024-01-20T00:00:00Z` |
| `end_date` | datetime | Ngày kết thúc | `2024-02-05T14:00:00Z` |
| `image` | string | URL hình ảnh | |
| `updated_at` | string | Ngày cập nhật | |
| `author` | string | Tác giả | |
| `status` | enum | Trạng thái | `draft`, `published`, `archived` |
| `name_en`, `name_jp` | string | Tên sự kiện | |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `related_ids` | string | ID liên quan (phân cách `\|`) |
| `gacha_ids` | string | Gacha liên quan (unique_key, phân cách `\|`) |
| `episode_ids` | string | Episode liên quan (unique_key, phân cách `\|`) |
| `mission_ids` | string | Mission liên quan (unique_key, phân cách `\|`) |
| `name_cn`, `name_tw`, `name_kr` | string | Tên đa ngôn ngữ |
| `description_en`, `description_jp` | string | Mô tả |
| `rewards_en`, `rewards_jp` | string | Phần thưởng (phân cách `\|`) |
| `how_to_participate_en`, `how_to_participate_jp` | string | Cách tham gia (phân cách `\|`) |
| `tips_en`, `tips_jp` | string | Mẹo (phân cách `\|`) |

#### Liên Kết Với Các Dataset Khác

Event có thể liên kết với các dataset khác thông qua các trường:
- `gacha_ids`: Liên kết với các banner gacha liên quan đến event
- `episode_ids`: Liên kết với các episode/story liên quan đến event
- `mission_ids`: Liên kết với các mission đặc biệt của event

Ví dụ: Event "Summer Splash Festival" có thể liên kết với:
- Gacha: `summer-paradise-nostalgia` (banner gacha của event)
- Episode: `summer-festival-event` (story của event)
- Mission: `ocean-adventure-event` (mission đặc biệt)

#### Ví Dụ Thêm Bản Ghi Mới

```csv
30,new-festival-event,Main,Upcoming,2025-01-01T00:00:00Z,2025-01-15T23:59:00Z,https://images.unsplash.com/photo-xxx,2024-12-15,WikiTeam,published,related-gacha|related-swimsuit,new-year-gacha,new-year-episode,new-year-mission,New Festival,新フェスティバル,新节日,新節日,새 페스티벌,A brand new festival event,新しいフェスティバルイベント,SSR Ticket x1|5000 V-Stones,SSRチケット×1|5000 Vストーン,Complete missions|Collect tokens,ミッションクリア|トークン集め,Use boosted characters,ブーストキャラを使用
```

---

### 4. Gachas

**File**: `src/content/data/gachas.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Giá trị hợp lệ |
|--------|------|-------|----------------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | |
| `slug` | string | URL slug | |
| `image` | string | URL hình ảnh | |
| `start_date` | datetime | Ngày bắt đầu | |
| `end_date` | datetime | Ngày kết thúc | |
| `gacha_status` | enum | Trạng thái | `Active`, `Coming Soon`, `Ended` |
| `rates_ssr` | number | Tỷ lệ SSR (%) | `3.3` |
| `rates_sr` | number | Tỷ lệ SR (%) | `15.0` |
| `rates_r` | number | Tỷ lệ R (%) | `81.7` |
| `pity_at` | number | Số lần đảm bảo | `100`, `200` |
| `step_up` | boolean | Có step-up không | `true`, `false` |
| `updated_at` | string | Ngày cập nhật | |
| `author` | string | Tác giả | |
| `status` | enum | Trạng thái | |
| `name_en`, `name_jp` | string | Tên gacha | |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `featured_swimsuits` | string | Swimsuit nổi bật (phân cách `\|`) |
| `featured_characters` | string | Nhân vật nổi bật (phân cách `\|`) |
| `name_cn`, `name_tw`, `name_kr` | string | Tên đa ngôn ngữ |
| `description_en`, `description_jp` | string | Mô tả |

#### Ví Dụ Thêm Bản Ghi Mới

```csv
30,new-premium-gacha,new-premium-gacha,https://images.unsplash.com/photo-xxx,2025-01-01T00:00:00Z,2025-01-15T23:59:00Z,Coming Soon,4.0,18.0,78.0,100,true,new-swimsuit-ssr,misaki|honoka,2024-12-15,WikiTeam,published,New Premium Gacha,新プレミアムガチャ,新高级扭蛋,新高級扭蛋,새 프리미엄 가챠,Premium gacha with new SSR swimsuits,新SSR水着が登場するプレミアムガチャ
```

---


### 5. Episodes

**File**: `src/content/data/episodes.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Giá trị hợp lệ |
|--------|------|-------|----------------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | |
| `type` | enum | Loại episode | `Character`, `Gravure`, `Event`, `Extra`, `Bromide` |
| `episode_status` | enum | Trạng thái | `Available`, `Coming Soon`, `Limited` |
| `image` | string | URL hình ảnh | |
| `tags` | string | Thẻ tag (phân cách `\|`) | |
| `updated_at` | string | Ngày cập nhật | |
| `author` | string | Tác giả | |
| `status` | enum | Trạng thái | `draft`, `published`, `archived` |
| `name_en`, `name_jp` | string | Tên episode | |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `release_version` | string | Phiên bản phát hành |
| `release_date` | date | Ngày phát hành |
| `character_ids` | string | ID nhân vật (phân cách `\|`) |
| `name_cn`, `name_tw`, `name_kr` | string | Tên đa ngôn ngữ |
| `description_en`, `description_jp` | string | Mô tả |

#### Ví Dụ Thêm Bản Ghi Mới

```csv
31,new-character-episode,New Character Episode,新キャラクターエピソード,新角色剧情,新角色劇情,새 캐릭터 에피소드,Character,Available,6.5.0,2024-12-15,https://images.unsplash.com/photo-xxx,misaki|honoka,A new exciting character episode,新しいエキサイティングなキャラクターエピソード,Character|New|Story,2024-12-15,WikiTeam,published
```

---

### 6. Guides

**File CSV**: `src/content/data/guides.csv`  
**File Markdown**: `src/content/data/guides/<content_ref>.md`

#### Các Trường CSV Bắt Buộc

| Trường | Kiểu | Mô tả | Ví dụ |
|--------|------|-------|-------|
| `id` | number | ID duy nhất | `1` |
| `unique_key` | string | Key duy nhất | `complete-beginners-guide` |
| `content_ref` | string | Tên file markdown | `beginner-guide.md` |
| `read_time` | string | Thời gian đọc | `10 min` |
| `image` | string | URL hình ảnh | |
| `topics` | string | Chủ đề (phân cách `\|`) | `Basics\|Currency\|Gacha` |
| `updated_at` | string | Ngày cập nhật | |
| `author` | string | Tác giả | |
| `status` | enum | Trạng thái | |
| `title_en`, `title_jp` | string | Tiêu đề | |
| `summary_en`, `summary_jp` | string | Tóm tắt | |
| `category_id` | string | ID danh mục | `beginner` |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `related_ids` | string | ID liên quan (phân cách `\|`) |
| `title_cn`, `title_tw`, `title_kr` | string | Tiêu đề đa ngôn ngữ |

#### Cấu Trúc File Markdown

```markdown
# Tiêu Đề Guide

Mô tả ngắn về guide.

## Phần 1

Nội dung phần 1...

### Phần con 1.1

Nội dung chi tiết...

## Phần 2

Nội dung phần 2...

### Bảng Dữ Liệu

| Cột 1 | Cột 2 | Cột 3 |
|-------|-------|-------|
| Data  | Data  | Data  |

### Code Block

```javascript
const example = "code";
```

### Danh Sách

1. Mục 1
   - Mục con 1.1
   - Mục con 1.2
2. Mục 2

> **Tip:** Ghi chú quan trọng
```

#### Ví Dụ Thêm Guide Mới

**1. Thêm vào CSV:**
```csv
22,new-guide,new-guide.md,15 min,https://images.unsplash.com/photo-xxx,Strategy|Tips,2024-12-15,WikiTeam,published,related-guide-1,New Guide Title,新ガイドタイトル,新指南标题,新指南標題,새 가이드 제목,A comprehensive new guide,新しい包括的なガイド,advanced
```

**2. Tạo file markdown:** `src/content/data/guides/new-guide.md`

---

### 7. Tools

**File CSV**: `src/content/data/tools.csv`  
**File Markdown**: `src/content/data/tools/<content_ref>.md`

#### Các Trường CSV Bắt Buộc

| Trường | Kiểu | Mô tả | Ví dụ |
|--------|------|-------|-------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | `screenshot-tool` |
| `content_ref` | string | Tên file markdown | `screenshot-tool.md` |
| `image` | string | URL hình ảnh | |
| `updated_at` | string | Ngày cập nhật | |
| `author` | string | Tác giả | |
| `status` | enum | Trạng thái | |
| `category_id` | string | ID danh mục | `utilities` |
| `tags` | string | Thẻ tag (phân cách `\|`) | |
| `title_en`, `title_jp` | string | Tiêu đề | |
| `summary_en`, `summary_jp` | string | Tóm tắt | |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `windows_path` | string | Đường dẫn Windows |
| `version` | string | Phiên bản |
| `related_ids` | string | ID liên quan |
| `title_cn`, `title_tw`, `title_kr` | string | Tiêu đề đa ngôn ngữ |
| `summary_cn`, `summary_tw`, `summary_kr` | string | Tóm tắt đa ngôn ngữ |

#### Ví Dụ Thêm Tool Mới

**1. Thêm vào CSV:**
```csv
6,new-tool,new-tool.md,https://images.unsplash.com/photo-xxx,C:\Tools\NewTool,1.0.0,2024-12-15,WikiTeam,published,utilities,Tool|Utility,,New Tool,新ツール,新工具,新工具,새 도구,A useful new tool,便利な新しいツール,一个有用的新工具,一個有用的新工具,유용한 새 도구
```

**2. Tạo file markdown:** `src/content/data/tools/new-tool.md`

---

### 8. Quizzes

**File CSV**: `src/content/data/quizzes.csv`  
**File Markdown**: `src/content/data/quizzes/<questions_ref>.md`

#### Các Trường CSV Bắt Buộc

| Trường | Kiểu | Mô tả | Giá trị hợp lệ |
|--------|------|-------|----------------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | |
| `name_en`, `name_jp` | string | Tên quiz | |
| `description_en`, `description_jp` | string | Mô tả | |
| `image` | string | URL hình ảnh | |
| `category` | string | Danh mục | `beginner`, `characters`, `economy` |
| `difficulty` | enum | Độ khó | `Easy`, `Medium`, `Hard` |
| `time_limit` | number | Giới hạn thời gian (giây) | `300`, `600` |
| `question_count` | number | Số câu hỏi | |
| `questions_ref` | string | Đường dẫn file câu hỏi | `quizzes/quiz-name.md` |
| `status` | enum | Trạng thái | |
| `updated_at` | string | Ngày cập nhật | |
| `author` | string | Tác giả | |
| `tags` | string | Thẻ tag (phân cách `\|`) | |

#### Cấu Trúc File Câu Hỏi Markdown

```markdown
# Question 1
type: single_choice
points: 10
time_limit: 30

Nội dung câu hỏi?

- [ ] Đáp án sai 1
- [x] Đáp án đúng
- [ ] Đáp án sai 2
- [ ] Đáp án sai 3

## Explanation
Giải thích đáp án đúng.

---

# Question 2
type: multiple_choice
points: 15

Câu hỏi nhiều đáp án đúng? (Chọn tất cả đáp án đúng)

- [x] Đáp án đúng 1
- [x] Đáp án đúng 2
- [ ] Đáp án sai
- [x] Đáp án đúng 3

## Explanation
Giải thích các đáp án đúng.

---

# Question 3
type: text_input
points: 20
answer: Đáp án chính xác

Câu hỏi nhập văn bản?

## Explanation
Giải thích đáp án.
```

#### Loại Câu Hỏi

| Type | Mô tả |
|------|-------|
| `single_choice` | Chọn một đáp án đúng |
| `multiple_choice` | Chọn nhiều đáp án đúng |
| `text_input` | Nhập văn bản |

#### Ví Dụ Thêm Quiz Mới

**1. Thêm vào CSV:**
```csv
6,new-quiz,New Quiz,新クイズ,新测验,新測驗,새 퀴즈,Test your knowledge,知識をテスト,测试你的知识,測試你的知識,지식을 테스트하세요,https://images.unsplash.com/photo-xxx,advanced,Medium,480,10,quizzes/new-quiz.md,published,2024-12-15,WikiTeam,advanced|strategy
```

**2. Tạo file markdown:** `src/content/data/quizzes/new-quiz.md`

---


### 9. Accessories

**File**: `src/content/data/accessories.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Giá trị hợp lệ |
|--------|------|-------|----------------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | `crystal-tiara-ssr` |
| `title` | string | Tiêu đề | |
| `summary` | string | Tóm tắt | |
| `category` | string | Danh mục | `Accessory` |
| `tags` | string | Thẻ tag (phân cách `\|`) | `accessory\|ssr\|head` |
| `rarity` | enum | Độ hiếm | `SSR`, `SR`, `R` |
| `character_ids` | string | ID nhân vật có thể trang bị (phân cách `\|`) | `misaki\|honoka` |
| `image` | string | URL hình ảnh | |
| `stats` | JSON | Chỉ số | `"{""POW"":50,""TEC"":30}"` |
| `obtain_method` | enum | Cách nhận | `Event`, `Gacha`, `Shop`, `Quest`, `Login` |
| `updated_at` | string | Ngày cập nhật | |
| `author` | string | Tác giả | |
| `status` | enum | Trạng thái | |
| `name_en`, `name_jp` | string | Tên phụ kiện | |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `obtain_source` | string | Nguồn cụ thể (unique_key của event/gacha) |
| `related_ids` | string | ID liên quan |
| `name_cn`, `name_tw`, `name_kr` | string | Tên đa ngôn ngữ |
| `description_en`, `description_jp` | string | Mô tả chi tiết |
| `effect_en`, `effect_jp` | string | Hiệu ứng |

#### Ví Dụ Thêm Bản Ghi Mới

```csv
25,new-accessory-ssr,New Accessory,A powerful new accessory,Accessory,accessory|ssr|neck,SSR,misaki|honoka|kasumi,https://images.unsplash.com/photo-xxx,"{""POW"":45,""TEC"":40,""STM"":35,""APL"":12}",Gacha,new-gacha-banner,2024-12-15,WikiTeam,published,new-gacha-banner,New Accessory,新アクセサリー,新饰品,新飾品,새 액세서리,A powerful accessory with special effects,特殊効果を持つ強力なアクセサリー,All stats +10%,全ステータス+10%
```

---

### 10. Missions

**File**: `src/content/data/missions.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Giá trị hợp lệ |
|--------|------|-------|----------------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | |
| `title` | string | Tiêu đề | |
| `summary` | string | Tóm tắt | |
| `category` | string | Danh mục | `Mission` |
| `tags` | string | Thẻ tag (phân cách `\|`) | |
| `type` | enum | Loại nhiệm vụ | `Daily`, `Weekly`, `Event` |
| `objectives` | string | Mục tiêu (phân cách `\|`) | |
| `rewards` | string | Phần thưởng (phân cách `\|`) | |
| `updated_at` | string | Ngày cập nhật | |
| `author` | string | Tác giả | |
| `status` | enum | Trạng thái | |
| `name_en`, `name_jp` | string | Tên nhiệm vụ | |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `event_id` | string | ID sự kiện liên quan |
| `image` | string | URL hình ảnh |
| `requirements` | string | Yêu cầu (phân cách `\|`) |
| `related_ids` | string | ID liên quan |
| `name_cn`, `name_tw`, `name_kr` | string | Tên đa ngôn ngữ |
| `description_en`, `description_jp` | string | Mô tả |

#### Ví Dụ Thêm Bản Ghi Mới

```csv
25,new-daily-mission,New Daily Mission,Complete new daily tasks,Mission,mission|daily|new,Daily,,https://images.unsplash.com/photo-xxx,Complete 3 matches|Win 1 match,100 V-Stones|500 EXP,,2024-12-15,WikiTeam,published,,New Daily Mission,新デイリーミッション,新每日任务,新每日任務,새 데일리 미션,Complete new daily tasks for rewards,新しいデイリータスクをクリアして報酬を獲得
```

---

### 11. Items

**File**: `src/content/data/items.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Giá trị hợp lệ |
|--------|------|-------|----------------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | |
| `type` | enum | Loại vật phẩm | `Decoration`, `Consumable`, `Material` |
| `image` | string | URL hình ảnh | |
| `updated_at` | string | Ngày cập nhật | |
| `author` | string | Tác giả | |
| `status` | enum | Trạng thái | |
| `name_en`, `name_jp` | string | Tên vật phẩm | |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `related_ids` | string | ID liên quan |
| `name_cn`, `name_tw`, `name_kr` | string | Tên đa ngôn ngữ |
| `description_en`, `description_jp` | string | Mô tả |

#### Ví Dụ Thêm Bản Ghi Mới

```csv
30,new-decoration-item,Decoration,https://images.unsplash.com/photo-xxx,2024-12-15,WikiTeam,published,related-event,New Decoration,新デコレーション,新装饰,新裝飾,새 장식,A beautiful new decoration for your room,部屋用の美しい新しいデコレーション
```

---

### 12. Categories

**File**: `src/content/data/categories.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Ví dụ |
|--------|------|-------|-------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | `beginner` |
| `order` | number | Thứ tự hiển thị | `1`, `2`, `3` |
| `name_en`, `name_jp` | string | Tên danh mục | |
| `description_en`, `description_jp` | string | Mô tả | |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `parent_id` | string | ID danh mục cha (cho danh mục con) |

#### Ví Dụ Thêm Bản Ghi Mới

```csv
31,new-category,parent-category,31,New Category,新カテゴリー,New category description,新しいカテゴリーの説明
```

---

### 13. Tags

**File**: `src/content/data/tags.csv`

#### Các Trường Bắt Buộc

| Trường | Kiểu | Mô tả | Ví dụ |
|--------|------|-------|-------|
| `id` | number | ID duy nhất | |
| `unique_key` | string | Key duy nhất | `game-basics` |
| `usage_count` | number | Số lần sử dụng | `5` |
| `name_en`, `name_jp` | string | Tên tag | |

#### Các Trường Tùy Chọn

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `description_en`, `description_jp` | string | Mô tả |

#### Ví Dụ Thêm Bản Ghi Mới

```csv
30,new-tag,0,New Tag,新タグ,Description of new tag,新しいタグの説明
```

---

## Quy Trình Thêm/Sửa/Xóa Dữ Liệu

### Thêm Bản Ghi Mới

1. **Xác định ID mới**: Lấy ID lớn nhất hiện tại + 1
2. **Tạo unique_key**: Đặt tên lowercase, dùng dấu gạch ngang
3. **Điền đầy đủ các trường bắt buộc**
4. **Điền các trường tùy chọn nếu cần**
5. **Nếu có file markdown liên quan**: Tạo file trong thư mục tương ứng
6. **Validate**: Kiểm tra format CSV và JSON

### Sửa Bản Ghi

1. **Tìm bản ghi theo ID hoặc unique_key**
2. **Sửa các trường cần thiết**
3. **Cập nhật `updated_at`**
4. **Nếu sửa file markdown**: Cập nhật nội dung file

### Xóa Bản Ghi

1. **Xóa dòng trong file CSV**
2. **Xóa file markdown liên quan (nếu có)**
3. **Cập nhật các bản ghi có `related_ids` tham chiếu đến bản ghi bị xóa**

---

## Validate Dữ Liệu

### Kiểm Tra Thủ Công

1. **ID không trùng lặp**
2. **unique_key không trùng lặp**
3. **Các trường enum có giá trị hợp lệ**
4. **JSON format đúng**
5. **Ngày tháng đúng format ISO 8601**
6. **File markdown tồn tại (nếu có content_ref)**

### Sử Dụng Script Validate

```bash
# Chạy script validate
./docs/validate-all-csv.sh
```

---

## Lưu Ý Quan Trọng

1. **Backup trước khi sửa**: Luôn backup file CSV trước khi thực hiện thay đổi lớn
2. **Encoding UTF-8**: Đảm bảo file được lưu với encoding UTF-8
3. **Không để trống trường bắt buộc**: Các trường bắt buộc phải có giá trị
4. **Kiểm tra liên kết**: Đảm bảo các `related_ids`, `character_id`, `event_id` tham chiếu đến bản ghi tồn tại
5. **Cập nhật usage_count**: Khi thêm/xóa tag, cập nhật `usage_count` trong tags.csv
6. **Đồng bộ đa ngôn ngữ**: Khi thêm nội dung mới, cố gắng điền đầy đủ các ngôn ngữ

---

## Ví Dụ Workflow Hoàn Chỉnh

### Thêm Nhân Vật Mới + Swimsuit + Event

**Bước 1: Thêm nhân vật vào characters.csv**
```csv
31,new-girl,https://example.com/image.jpg,"{""POW"":850,""TEC"":900,""STM"":870,""APL"":92}",2024-12-15,WikiTeam,published,,New Girl,新ガール,...
```

**Bước 2: Thêm swimsuit vào swimsuits.csv**
```csv
31,new-girl-debut-ssr,SSR,new-girl,https://example.com/swimsuit.jpg,"{""POW"":450,""TEC"":420,""STM"":430,""APL"":47}",2024-12-15,WikiTeam,published,new-girl,...
```

**Bước 3: Thêm event vào events.csv**
```csv
30,new-girl-debut-event,Main,Upcoming,2025-01-01T00:00:00Z,2025-01-15T23:59:00Z,https://example.com/event.jpg,2024-12-15,WikiTeam,published,new-girl-debut-ssr,...
```

**Bước 4: Thêm gacha vào gachas.csv**
```csv
30,new-girl-debut-gacha,new-girl-debut-gacha,https://example.com/gacha.jpg,2025-01-01T00:00:00Z,2025-01-15T23:59:00Z,Coming Soon,4.0,18.0,78.0,100,true,new-girl-debut-ssr,new-girl,...
```

**Bước 5: Cập nhật related_ids**
- Cập nhật `related_ids` của nhân vật: `new-girl-debut-ssr|new-girl-debut-event`
- Cập nhật `related_ids` của swimsuit: `new-girl|new-girl-debut-event`
- Cập nhật `related_ids` của event: `new-girl-debut-ssr|new-girl-debut-gacha`

---

---

## Phụ Lục: Sử Dụng Đường Dẫn Windows Cho Hình Ảnh

### Tổng Quan

Hệ thống hỗ trợ đầy đủ đường dẫn Windows cho trường `image` trong tất cả các schema. Bạn có thể sử dụng hình ảnh từ ổ đĩa cục bộ thay vì URL internet.

### Các Định Dạng Được Hỗ Trợ

```
# Đường dẫn ổ đĩa cục bộ
C:\GameData\DOAXVV\Images\characters\misaki.png
D:\Projects\Wiki\assets\swimsuits\venus-dream.jpg

# Đường dẫn mạng (UNC)
\\server\share\images\events\summer-festival.png
\\NAS\media\doaxvv\gachas\starry-night.jpg

# URL internet (vẫn hỗ trợ)
https://images.unsplash.com/photo-xxx?q=80&w=800
```

### Ví Dụ CSV Với Đường Dẫn Windows

#### Characters
```csv
id,unique_key,image,...
1,misaki,C:\GameData\DOAXVV\Characters\misaki.png,...
2,honoka,D:\Wiki\Images\characters\honoka.jpg,...
```

#### Swimsuits
```csv
id,unique_key,rarity,character_id,image,...
1,venus-dream-misaki,SSR,misaki,C:\GameData\DOAXVV\Swimsuits\venus-dream-misaki.png,...
```

#### Events
```csv
id,unique_key,type,event_status,start_date,end_date,image,...
1,summer-splash-festival,Main,Active,2024-01-20T00:00:00Z,2024-02-05T14:00:00Z,C:\GameData\DOAXVV\Events\summer-splash.jpg,...
```

#### Gachas
```csv
id,unique_key,slug,image,...
1,starry-night-premium,starry-night-premium,C:\GameData\DOAXVV\Gachas\starry-night.png,...
```

#### Accessories
```csv
id,unique_key,...,image,...
1,crystal-tiara-ssr,...,C:\GameData\DOAXVV\Accessories\crystal-tiara.png,...
```

#### Items
```csv
id,unique_key,type,image,...
1,sunset-beach-painting,Decoration,C:\GameData\DOAXVV\Items\sunset-painting.jpg,...
```

### Cấu Trúc Thư Mục Đề Xuất

```
C:\GameData\DOAXVV\
├── Characters\
│   ├── misaki.png
│   ├── honoka.png
│   └── ...
├── Swimsuits\
│   ├── venus-dream-misaki.png
│   ├── starry-night-honoka.png
│   └── ...
├── Events\
│   ├── summer-splash.jpg
│   ├── tengu-festival.jpg
│   └── ...
├── Gachas\
│   ├── starry-night.png
│   ├── championship.png
│   └── ...
├── Accessories\
│   ├── crystal-tiara.png
│   ├── ocean-pearl.png
│   └── ...
├── Items\
│   ├── decorations\
│   ├── consumables\
│   └── materials\
├── Episodes\
├── Guides\
├── Tools\
└── Quizzes\
```

### Lưu Ý Quan Trọng

1. **Quyền truy cập**: Đảm bảo ứng dụng có quyền đọc file từ đường dẫn được chỉ định
2. **Tồn tại file**: Kiểm tra file tồn tại trước khi thêm vào CSV
3. **Định dạng hỗ trợ**: PNG, JPG, JPEG, GIF, WebP, SVG
4. **Kích thước**: Khuyến nghị tối ưu hóa hình ảnh (800-1200px width)
5. **Backup**: Sao lưu thư mục hình ảnh định kỳ

### Chuyển Đổi Từ URL Sang Windows Path

Nếu bạn muốn chuyển từ URL sang đường dẫn Windows:

1. Tải hình ảnh về máy
2. Đặt vào thư mục phù hợp
3. Cập nhật trường `image` trong CSV

**Trước:**
```csv
image
https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400
```

**Sau:**
```csv
image
C:\GameData\DOAXVV\Characters\misaki.png
```

### Kết Hợp Cả Hai Loại

Bạn có thể kết hợp cả URL và đường dẫn Windows trong cùng một file CSV:

```csv
id,unique_key,image
1,misaki,C:\GameData\DOAXVV\Characters\misaki.png
2,honoka,https://example.com/honoka.jpg
3,marie-rose,D:\Images\marie-rose.png
```

---

## Phụ Lục: Bảng Tóm Tắt Format Excel

### Bảng Tra Cứu Nhanh

| Loại Dữ Liệu | Format Ô Excel | Cách Nhập | Ví Dụ |
|--------------|----------------|-----------|-------|
| ID | Number (0 decimal) | Số nguyên | `1`, `25` |
| unique_key | Text | Chữ thường, gạch ngang | `misaki`, `venus-dream-misaki` |
| Văn bản thường | Text | Nhập trực tiếp | `WikiTeam`, `Misaki` |
| Văn bản có dấu phẩy | Text | Nhập trực tiếp | `Hello, World` |
| JSON | Text | `{"key":value}` | `{"POW":450,"TEC":380}` |
| Mảng | Text | Phân cách bằng `\|` | `tag1\|tag2\|tag3` |
| Ngày giờ | Text | ISO 8601 | `2024-01-20T00:00:00Z` |
| Boolean | Text | Chữ thường | `true`, `false` |
| Enum | Text | Chính xác giá trị | `SSR`, `Active`, `published` |
| Số thập phân | Number (1-2 decimal) | Dùng dấu chấm | `3.3`, `15.0` |
| URL | Text | Đầy đủ URL | `https://example.com/img.jpg` |
| Windows Path | Text | Đường dẫn đầy đủ | `C:\Images\img.png` |
| Ô trống | - | Để trống | |

### Checklist Trước Khi Lưu CSV

- [ ] Tất cả ô ngày đã format thành Text
- [ ] JSON không có lỗi cú pháp
- [ ] Enum đúng giá trị cho phép (phân biệt hoa/thường)
- [ ] ID không trùng lặp
- [ ] unique_key không trùng lặp
- [ ] Các trường bắt buộc đã điền đầy đủ
- [ ] Lưu với format `CSV UTF-8 (Comma delimited)`

### Phím Tắt Hữu Ích Trong Excel

| Phím tắt | Chức năng |
|----------|-----------|
| `Ctrl + 1` | Mở Format Cells |
| `Ctrl + Shift + ~` | Format thành General |
| `Ctrl + '` | Copy giá trị từ ô trên |
| `Ctrl + D` | Fill Down (copy xuống) |
| `Ctrl + ;` | Nhập ngày hiện tại |
| `F2` | Edit ô hiện tại |

### Công Thức Excel Hữu Ích

**Tạo unique_key từ tên:**
```excel
=LOWER(SUBSTITUTE(A2," ","-"))
```

**Tạo ngày ISO 8601:**
```excel
=TEXT(A2,"yyyy-mm-dd")&"T00:00:00Z"
```

**Nối mảng:**
```excel
=A2&"|"&B2&"|"&C2
```

**Kiểm tra trùng ID:**
```excel
=IF(COUNTIF(A:A,A2)>1,"TRÙNG","OK")
```

---

*Tài liệu được tạo: 2024-12-15*  
*Phiên bản: 1.2 - Thêm hướng dẫn chi tiết format Excel*
