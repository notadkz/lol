# Tích hợp PayOS cho Thanh Toán Online

## Tóm tắt

Đã hoàn thành tích hợp PayOS vào hệ thống để cung cấp chức năng thanh toán online thông qua mã QR. Hệ thống cho phép người dùng nạp tiền vào tài khoản và tự động cập nhật số dư sau khi thanh toán thành công.

## Luồng hoạt động

1. Người dùng truy cập trang nạp tiền (`/user/deposit`)
2. Người dùng nhập số tiền cần nạp và nhấn "Tạo mã thanh toán"
3. Hệ thống gọi API PayOS để tạo link thanh toán và trả về mã QR
4. Người dùng quét mã QR bằng ứng dụng ngân hàng để thanh toán
5. PayOS xử lý giao dịch và gửi thông báo kết quả qua webhook
6. Hệ thống cập nhật trạng thái giao dịch và số dư của người dùng
7. Người dùng được chuyển hướng đến trang xác nhận thanh toán thành công

## Các phần đã triển khai

### 1. API Routes

- `/api/payos/create-payment`: Tạo giao dịch thanh toán mới và liên kết với PayOS
- `/api/payos/webhook`: Xử lý webhook từ PayOS khi trạng thái thanh toán thay đổi
- `/api/payos/check-payment`: Kiểm tra trạng thái giao dịch hiện tại

### 2. Trang UI/UX

- Cập nhật component `DepositForm.tsx` để hỗ trợ tạo và hiển thị mã QR thanh toán
- Tạo trang xác nhận thanh toán thành công (`/payment/success`)

### 3. Xử lý giao dịch

- Tạo bản ghi giao dịch nạp tiền (`TopUpTransaction`)
- Cập nhật trạng thái giao dịch khi nhận webhook
- Tự động cập nhật số dư người dùng khi thanh toán thành công
- Tạo bản ghi lịch sử giao dịch (`TransactionHistory`)
- Tạo thông báo cho người dùng

### 4. Bảo mật

- Xác thực chữ ký webhook từ PayOS
- Kiểm tra session người dùng trước khi thực hiện các hoạt động thanh toán
- Xử lý các tình huống lỗi và ngoại lệ

## Cấu hình cần thiết

Để sử dụng PayOS, cần cài đặt các biến môi trường sau:

```
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
PAYOS_API_URL=https://api-sandbox.payos.vn (hoặc URL production)
NEXT_PUBLIC_APP_URL=your_app_url
```

## Đăng ký webhook

Sau khi triển khai, bạn cần đăng ký webhook với PayOS tại https://my.payos.vn:

- URL webhook: `https://your-domain.com/api/payos/webhook`
- Đảm bảo kích hoạt webhook cho các sự kiện thanh toán

## Lưu ý quan trọng

1. Mã webhook hiện tại đã xử lý các trạng thái chính của giao dịch:

   - `PAID`: Thanh toán thành công
   - `CANCELLED`: Hủy thanh toán
   - `ERROR`: Lỗi thanh toán
   - `EXPIRED`: Hết hạn thanh toán

2. Cần thiết lập một cronjob để kiểm tra các giao dịch quá hạn và cập nhật trạng thái

3. Để kiểm thử trong môi trường phát triển, có thể sử dụng NGrok hoặc công cụ tương tự để mở endpoint webhook ra internet

## Phát triển trong tương lai

- Thêm trang quản lý lịch sử giao dịch nạp tiền
- Cải thiện trải nghiệm người dùng bằng cách thêm thông báo realtime
- Tích hợp thêm các phương thức thanh toán khác
- Bổ sung báo cáo và thống kê cho admin
