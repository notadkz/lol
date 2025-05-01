# Vấn đề trong Schema Prisma và Cách Khắc Phục

## Vấn đề đã phát hiện

1. **Xung đột giữa cấu trúc schema và code API**:

   - API đang cố gắng truy cập các trường `soloRank`, `flexRank`, `tftRank` trong model `GameAccount`, nhưng model đang sử dụng mảng `ranks`
   - Mảng `images` và `ranks` không được hỗ trợ trong MySQL (vì "The current connector does not support lists of primitive types")

2. **Thiếu các mối quan hệ phản chiếu**:

   - Mối quan hệ `@relation` không đầy đủ giữa `User` và `GameAccount`
   - Mối quan hệ giữa `Order` và `GameAccount` có xung đột

3. **Lỗi trong code API**:
   - Các API đang sử dụng model `GameAccount` với các trường không tồn tại trong schema hiện tại

## Giải pháp đã thực hiện

1. **Cập nhật Schema Prisma**:

   - Thay thế mảng `ranks[]` bằng 3 trường riêng biệt: `soloRank`, `flexRank`, `tftRank` thuộc enum `Rank`
   - Thay thế mảng `images[]` bằng trường `imageUrls` dạng `String?` (lưu dạng JSON)
   - Thêm các trường mới cần thiết: `blueEssence`, `riotPoints`, `championCount`, `skinCount`, `chromaCount`, v.v.
   - Sửa tất cả các mối quan hệ phản chiếu và thêm các annotations `@relation` còn thiếu

2. **Cập nhật API**:
   - Cập nhật code để xử lý `imageUrls` dưới dạng chuỗi JSON thay vì mảng
   - Xử lý việc chuyển đổi giữa mảng `ranks` trong giao diện và các trường rank riêng lẻ trong database

## Các bước tiếp theo cần thực hiện

1. **Cập nhật Prisma Client**:

   - Chạy lệnh sau để tạo lại Prisma Client cho schema mới:

   ```bash
   npx prisma generate
   ```

2. **Tạo Migration cho Database**:

   - Nếu database đã có dữ liệu thực, cần tạo migration cẩn thận:

   ```bash
   npx prisma migrate dev --name update_game_account_structure
   ```

3. **Cập nhật Code API**:

   - Cập nhật tất cả API routes liên quan đến `GameAccount`:
     - `/api/admin/game-accounts/[id]/route.ts`
     - `/api/admin/game-accounts/[id]/status/route.ts`
     - `/api/admin/game-accounts/[id]/featured/route.ts`
   - Cần cập nhật logic xử lý JSON cho hình ảnh và ranks
   - Phải bảo đảm code TypeScript phù hợp với cấu trúc Prisma Client mới

4. **Cập nhật front-end components**:
   - Cập nhật trang add-game-account để xử lý đúng cấu trúc mới
   - Giữ nguyên API trả về client để tránh phải thay đổi UI (vẫn giữ mảng `ranks` và `images` trong response)

## Lưu ý quan trọng

1. Có thể gặp lỗi TypeScript sau khi cập nhật schema và generate prisma client, cần kiểm tra kỹ các kiểu dữ liệu
2. Nếu database đã có dữ liệu, cần lưu ý việc chuyển đổi dữ liệu từ mảng chuỗi sang các enum
3. Đối với trường `imageUrls`, cần viết logic xử lý đặc biệt để chuyển đổi từ JSON sang mảng và ngược lại
4. Nên bổ sung validation cho ranks để đảm bảo giá trị hợp lệ theo enum `Rank`
