# Tóm tắt lỗi API Route Parameters và các vấn đề cần giải quyết

## Vấn đề hiện tại

1. **Lỗi API Route với Dynamic Params**

   - Phát hiện lỗi khi truy cập `params.id` trong các route động mà không sử dụng `await`
   - Lỗi hiển thị: `Route "/api/admin/game-accounts/[id]" used params.id. params should be awaited before using its properties`
   - Các file bị ảnh hưởng:
     - `src/app/api/admin/game-accounts/[id]/route.ts`
     - `src/app/api/admin/game-accounts/[id]/status/route.ts`
     - `src/app/api/admin/game-accounts/[id]/featured/route.ts`

2. **Lỗi JWT Token hết hạn**

   - Log hiển thị: `JWT callback - Token expired and no refresh token`
   - Người dùng phải đăng nhập lại liên tục
   - Không có cơ chế refresh token tự động

3. **Lỗi 404 cho các file hình ảnh**

   - Các file hình ảnh `/images/account-*.jpg` không tồn tại trong thư mục public
   - Lỗi 404 khi tải trang sản phẩm

4. **Lỗi cấu trúc HTML trong hiển thị sản phẩm**
   - Lỗi cấu trúc HTML khi lồng `<div>` trong `<p>` ở component hiển thị Rank và Status
   - Các component bị ảnh hưởng: `getRankDisplay` và `getStatusDisplay`

## Đã hoàn thành

1. **Sửa lỗi API Route Parameters**

   - Đã thêm `await` trước mọi truy cập `params.id` trong các API route
   - Đã cập nhật xử lý lỗi để cũng sử dụng `await params.id` trong các thông báo lỗi

2. **Sửa lỗi HTML trong trang admin sản phẩm**
   - Đã cải thiện cấu trúc HTML trong component `getRankDisplay` và `getStatusDisplay`
   - Đã thay thế các tham số trong hàm bằng biến để dễ bảo trì
   - Đã bọc mọi Badge trong `<div>` thay vì `<p>` để tránh lỗi HTML

## Cần triển khai ngày mai

1. **Giải quyết vấn đề JWT Token hết hạn**

   - Cấu hình refresh token trong NextAuth
   - Tăng thời gian hết hạn của token (hiện tại quá ngắn)
   - Xem xét việc lưu trữ refresh token trong cookie hoặc local storage
   - File cần sửa: `src/app/api/auth/[...nextauth]/route.ts`

2. **Xử lý vấn đề file hình ảnh**

   - Tạo thư mục `/public/images` và thêm các hình ảnh mẫu
   - Hoặc cập nhật đường dẫn trong code để trỏ đến nơi chứa hình ảnh thực tế
   - Xem xét sử dụng dịch vụ lưu trữ hình ảnh như Cloudinary

3. **Cải thiện UX/UI cho trang quản lý sản phẩm**

   - Thêm skeleton loading khi đang tải dữ liệu
   - Cải thiện hiển thị lỗi và thông báo
   - Bổ sung validation cho form thêm/sửa sản phẩm
   - Cải thiện trải nghiệm upload hình ảnh

4. **Hoàn thiện API Route**

   - Kiểm tra các route còn lại có lỗi tương tự với params
   - Bổ sung validation cho các API endpoint
   - Chuẩn hóa các response format

5. **Khắc phục vấn đề linter trong PATCH method**
   - Sửa lỗi không tìm thấy thuộc tính `seller` trong updatedGameAccount
   - Cập nhật Prisma schema nếu cần, hoặc chỉnh sửa khóa ngoại

## Kế hoạch triển khai

1. Ưu tiên cao: Giải quyết vấn đề JWT Token và file hình ảnh vì ảnh hưởng trực tiếp đến trải nghiệm người dùng
2. Ưu tiên trung bình: Hoàn thiện API route và khắc phục lỗi linter
3. Ưu tiên thấp: Cải thiện UX/UI

## Ghi chú bổ sung

- Các file được sửa đã được commit vào git repo
- Nên tạo branch riêng cho mỗi nhóm tính năng để dễ quản lý
- Cần kiểm tra kỹ các route API trước khi deploy lên production
