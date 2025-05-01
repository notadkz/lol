# Tóm tắt triển khai API endpoints - 2023-11-15

## API endpoints đã triển khai

Đã triển khai các API endpoints cho người dùng và tài khoản game theo yêu cầu:

### Public endpoints

1. **GET /api/users** - Lấy thông tin người dùng hiện tại (đã đăng nhập)

   - Yêu cầu đăng nhập
   - Trả về thông tin chi tiết của người dùng đang đăng nhập

2. **PATCH /api/users** - Cập nhật thông tin người dùng hiện tại

   - Yêu cầu đăng nhập
   - Cho phép cập nhật tên và ảnh đại diện
   - Không cho phép thay đổi email hoặc loại tài khoản

3. **GET /api/users/[id]** - Lấy thông tin người dùng theo ID

   - Public API
   - Chỉ hiển thị thông tin không nhạy cảm (id, tên, ảnh, loại tài khoản, ngày tạo, đã xác thực)

4. **GET /api/accounts** - Lấy danh sách game accounts

   - Public API
   - Hỗ trợ tìm kiếm, lọc theo giá, rank, trạng thái
   - Hỗ trợ phân trang
   - Hỗ trợ sắp xếp theo nhiều tiêu chí

5. **GET /api/accounts/[id]** - Lấy thông tin chi tiết game account
   - Public API
   - Hiển thị thông tin đầy đủ của game account (username, giá, mô tả, rank, level, champion, skin...)
   - Bao gồm thông tin cơ bản về người bán
   - Cung cấp danh sách các game accounts tương tự

### Admin endpoints (đã có sẵn)

1. **GET /api/admin/users** - Lấy danh sách người dùng (có phân trang, tìm kiếm, lọc)
2. **POST /api/admin/users** - Tạo người dùng mới
3. **GET /api/admin/users/[id]** - Lấy thông tin chi tiết người dùng theo ID
4. **PATCH /api/admin/users/[id]** - Cập nhật thông tin người dùng
5. **DELETE /api/admin/users/[id]** - Xóa người dùng
6. **PATCH /api/admin/users/[id]/status** - Cập nhật trạng thái người dùng
7. **GET /api/admin/users/stats** - Lấy thống kê về người dùng

## Mô hình dữ liệu

Các endpoints này sử dụng Prisma Client để tương tác với cơ sở dữ liệu. Dựa trên các models chính:

1. **User** - Thông tin người dùng
2. **GameAccount** - Thông tin tài khoản game

## Bảo mật

- Các API endpoints cho người dùng đã đăng nhập được bảo vệ bằng session từ NextAuth
- Admin endpoints nên được bảo vệ bằng middleware kiểm tra quyền admin

## Việc cần làm tiếp theo

1. Hoàn thiện API cho các chức năng khác:

   - Quản lý đơn hàng
   - Lịch sử giao dịch
   - Quản lý thông tin bank accounts

2. Cập nhật Frontend để sử dụng các API này thay vì dữ liệu mẫu.
