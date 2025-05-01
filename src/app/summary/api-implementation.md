# Tổng hợp triển khai API Endpoints

## 1. API Quản lý người dùng (Admin)

### 1.1 Lấy danh sách người dùng

- **URL**: `/api/admin/users`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng người dùng mỗi trang (mặc định: 10)
  - `search`: Tìm kiếm theo tên hoặc email
  - `accountType`: Lọc theo loại tài khoản (REGULAR, PREMIUM, VIP)
  - `isActive`: Lọc theo trạng thái hoạt động (true/false)
  - `isVerified`: Lọc theo trạng thái xác thực (true/false)
  - `sortBy`: Sắp xếp theo trường (mặc định: createdAt)
  - `sortOrder`: Thứ tự sắp xếp (asc/desc, mặc định: desc)
- **Response**: Danh sách người dùng với thông tin phân trang

### 1.2 Tạo người dùng mới

- **URL**: `/api/admin/users`
- **Method**: `POST`
- **Body**:
  - `email`: Email người dùng (bắt buộc)
  - `name`: Tên người dùng (bắt buộc)
  - `image`: Đường dẫn hình ảnh
  - `accountType`: Loại tài khoản (REGULAR, PREMIUM, VIP)
  - `isVerified`: Trạng thái xác thực
  - `isActive`: Trạng thái hoạt động
- **Response**: Thông tin người dùng đã tạo

### 1.3 Lấy thông tin chi tiết người dùng

- **URL**: `/api/admin/users/:id`
- **Method**: `GET`
- **Response**: Thông tin chi tiết của người dùng

### 1.4 Cập nhật thông tin người dùng

- **URL**: `/api/admin/users/:id`
- **Method**: `PATCH`
- **Body**: Các trường cần cập nhật
  - `name`: Tên người dùng
  - `image`: Đường dẫn hình ảnh
  - `accountType`: Loại tài khoản
  - `isVerified`: Trạng thái xác thực
  - `isActive`: Trạng thái hoạt động
- **Response**: Thông tin người dùng đã cập nhật

### 1.5 Xóa người dùng

- **URL**: `/api/admin/users/:id`
- **Method**: `DELETE`
- **Response**: Thông báo xóa thành công

### 1.6 Cập nhật trạng thái người dùng

- **URL**: `/api/admin/users/:id/status`
- **Method**: `PATCH`
- **Body**:
  - `isActive`: Trạng thái hoạt động (true/false)
- **Response**: Thông tin người dùng đã cập nhật

### 1.7 Lấy thống kê người dùng

- **URL**: `/api/admin/users/stats`
- **Method**: `GET`
- **Response**:
  - `total`: Tổng số người dùng
  - `active`: Số người dùng đang hoạt động
  - `premium`: Số người dùng Premium
  - `vip`: Số người dùng VIP
  - `newUsersToday`: Số người dùng mới đăng ký trong ngày
  - `verifiedUsers`: Số người dùng đã xác thực

## 2. API Quản lý tài khoản người dùng

### 2.1 Lấy thông tin tài khoản

- **URL**: `/api/accounts`
- **Method**: `GET`
- **Authentication**: Yêu cầu đăng nhập
- **Response**: Thông tin tài khoản của người dùng đăng nhập

### 2.2 Cập nhật thông tin tài khoản

- **URL**: `/api/accounts`
- **Method**: `PATCH`
- **Authentication**: Yêu cầu đăng nhập
- **Body**:
  - `name`: Tên người dùng
  - `image`: Đường dẫn hình ảnh
- **Response**: Thông tin tài khoản đã cập nhật

### 2.3 Thay đổi mật khẩu

- **URL**: `/api/accounts/change-password`
- **Method**: `POST`
- **Authentication**: Yêu cầu đăng nhập
- **Body**:
  - `currentPassword`: Mật khẩu hiện tại
  - `newPassword`: Mật khẩu mới (tối thiểu 8 ký tự)
- **Response**: Thông báo thay đổi mật khẩu thành công

## Ghi chú triển khai

1. **Authentication và Authorization**:

   - Đã chuẩn bị logic xác thực và phân quyền thông qua NextAuth
   - Middleware hoặc các hàm kiểm tra phiên đăng nhập được sử dụng để bảo vệ API

2. **Xử lý lỗi và validation**:

   - Kiểm tra đầu vào cho tất cả các request
   - Trả về mã lỗi HTTP phù hợp và thông báo rõ ràng
   - Try-catch để xử lý các lỗi không mong muốn

3. **Các thư viện đã sử dụng**:

   - NextAuth cho xác thực
   - Prisma cho tương tác với cơ sở dữ liệu
   - bcrypt cho mã hóa mật khẩu

4. **Lưu ý**:
   - Đã triển khai đầy đủ các API theo service đã có
   - Một số endpoint có thể cần thêm quyền admin (hiện đang bị comment)
   - Tất cả API đều trả về dữ liệu dạng JSON
