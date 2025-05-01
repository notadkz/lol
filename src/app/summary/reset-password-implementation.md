# Triển khai tính năng đặt lại mật khẩu

## Tổng quan

Đã triển khai tính năng đặt lại mật khẩu đầy đủ, cho phép người dùng quên mật khẩu khôi phục lại quyền truy cập vào tài khoản của họ. Tính năng bao gồm:

1. Trang **Quên mật khẩu** (đã tồn tại) - Cho phép người dùng nhập email để nhận liên kết đặt lại
2. API xử lý yêu cầu quên mật khẩu (đã tồn tại) - Tạo token và gửi email với liên kết đặt lại
3. Trang **Đặt lại mật khẩu** (mới triển khai) - Cho phép người dùng tạo mật khẩu mới bằng token từ email
4. API xử lý đặt lại mật khẩu (đã tồn tại) - Xác thực token và cập nhật mật khẩu mới

## Luồng người dùng

1. Người dùng truy cập trang `/auth/forgot-password`
2. Người dùng nhập email của họ
3. Hệ thống gửi email chứa liên kết đặt lại dạng `/reset-password?token=xxx`
4. Người dùng nhấp vào liên kết trong email
5. Người dùng nhập mật khẩu mới và xác nhận
6. Hệ thống xác thực token, cập nhật mật khẩu và chuyển hướng người dùng đến trang đăng nhập

## Chi tiết triển khai

### Trang Đặt lại mật khẩu (`/src/app/reset-password/page.tsx`)

Trang đặt lại mật khẩu có các tính năng sau:

- Trích xuất token từ query parameters trong URL
- Kiểm tra tính hợp lệ của token (có tồn tại không)
- Cung cấp form với hai trường:
  - Mật khẩu mới
  - Xác nhận mật khẩu mới
- Xác thực dữ liệu nhập:
  - Mật khẩu phải có ít nhất 8 ký tự
  - Mật khẩu xác nhận phải khớp với mật khẩu mới
- Hiển thị thông báo lỗi rõ ràng cho từng trường
- Hỗ trợ hiển thị/ẩn mật khẩu
- Tương tác với API để xác thực token và cập nhật mật khẩu
- Hiển thị thông báo thành công và tự động chuyển hướng khi hoàn tất
- Hỗ trợ xử lý lỗi và hiển thị thông báo lỗi từ API
- Liên kết để quay lại trang đăng nhập hoặc trang quên mật khẩu

### Kết nối với API

Trang đặt lại mật khẩu gọi API `/api/auth/reset-password` với phương thức POST và dữ liệu:

- `token`: Token từ query parameters
- `newPassword`: Mật khẩu mới người dùng nhập

API sẽ trả về kết quả:

- Thành công: Mật khẩu đã được đặt lại thành công
- Lỗi: Token không hợp lệ, token đã hết hạn, hoặc lỗi khác

### Xử lý trạng thái và giao diện người dùng

Giao diện người dùng đã được thiết kế để xử lý các trạng thái khác nhau:

1. **Trạng thái mặc định**: Hiển thị form nhập mật khẩu mới
2. **Trạng thái lỗi token**: Hiển thị thông báo lỗi và liên kết quay lại trang quên mật khẩu
3. **Trạng thái thành công**: Hiển thị thông báo thành công và tự động chuyển hướng đến trang đăng nhập

## Bảo mật

Các biện pháp bảo mật đã được triển khai:

1. Token được tạo ngẫu nhiên bằng `crypto.randomBytes(32)` (trong API forgot-password)
2. Token được băm bằng SHA-256 trước khi lưu vào cơ sở dữ liệu
3. Token có thời hạn hết hạn (1 giờ)
4. Mật khẩu mới được băm bằng bcrypt trước khi lưu vào cơ sở dữ liệu
5. Token bị xóa sau khi sử dụng để ngăn tái sử dụng
6. Kiểm tra mật khẩu có đủ mạnh (ít nhất 8 ký tự)

## Tương lai phát triển

Các cải tiến có thể thực hiện trong tương lai:

1. Thêm yêu cầu mạnh hơn cho mật khẩu (chữ hoa, chữ thường, số, ký tự đặc biệt)
2. Thêm thời gian hiển thị độ mạnh của mật khẩu
3. Thêm CAPTCHA để ngăn ngừa tấn công brute force
4. Thêm thông báo khi email đặt lại được gửi đến thiết bị khác
5. Thêm xác thực hai yếu tố cho quá trình đặt lại mật khẩu
