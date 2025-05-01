# Sửa lỗi đăng nhập Google OAuth và vấn đề Prisma Schema

## Vấn đề

- Không thể đăng nhập với Google OAuth, luôn bị chuyển về trang đăng nhập
- Lỗi "Unknown argument `provider_providerAccountId`" khi gọi API Google OAuth
- Prisma Schema có nhiều lỗi về quan hệ giữa các model
- Xung đột giữa model Account trong schema và cấu trúc cần thiết cho NextAuth

## Nguyên nhân

1. **Xung đột schema**:

   - Model `Account` đang được sử dụng cho tài khoản game LoL, không phải cho OAuth
   - PrismaAdapter cần model `Account` với trường `provider` và `providerAccountId`
   - Schema thiếu các quan hệ ngược giữa các model

2. **Cấu hình NextAuth**:
   - Sử dụng strategy `database` nhưng không có cấu trúc database phù hợp
   - PrismaAdapter đang tìm kiếm các model database không tồn tại

## Giải pháp

1. **Thay đổi cấu hình NextAuth**:

   - Chuyển từ strategy `database` sang `jwt` để lưu session trong token thay vì database
   - Xóa PrismaAdapter tạm thời để không phụ thuộc vào cấu trúc database
   - Định nghĩa đúng kiểu dữ liệu cho Token và session
   - Thêm callback `jwt` để xử lý token Google OAuth

2. **Sửa Prisma Schema**:
   - Đổi tên model `Account` thành `GameAccount` để tránh xung đột
   - Tạo model mới `Account` cho NextAuth OAuth
   - Sửa tất cả các quan hệ giữa các model:
     - Thêm các trường quan hệ ngược cho `Review`, `Wishlist`, v.v.
     - Sửa xung đột quan hệ giữa `Order` và `GameAccount`
     - Thêm `relation` name cho tất cả các mối quan hệ
     - Thêm @@map để đảm bảo tên bảng database phù hợp

## Kết quả

- Đăng nhập Google OAuth hoạt động đúng thông qua JWT
- Schema Prisma không còn lỗi, các quan hệ đã được định nghĩa đúng
- Thông tin người dùng được lưu trong JWT và truyền đến session

## Lưu ý

- Vẫn cần chạy `npx prisma db push` hoặc `npx prisma migrate dev` để áp dụng schema mới
- Có thể cần thêm các bước di chuyển dữ liệu nếu schema thay đổi lớn
- Để sử dụng đầy đủ tính năng database của NextAuth, có thể cân nhắc kích hoạt lại PrismaAdapter sau khi schema đã ổn định
