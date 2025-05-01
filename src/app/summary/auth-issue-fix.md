# Giải quyết lỗi NextAuth [CLIENT_FETCH_ERROR]

## Vấn đề

Hệ thống xác thực đang gặp lỗi:

```
[next-auth][error][CLIENT_FETCH_ERROR] "https://next-auth.js.org/errors#client_fetch_error" "Unexpected token '<', '<!DOCTYPE \'... is not valid JSON"
```

Đây là lỗi phổ biến khi NextAuth cố gắng phân tích cú pháp JSON nhưng nhận được HTML thay vì đó. Điều này thường xảy ra khi:

1. API endpoint bị chuyển hướng đến trang HTML thay vì trả về JSON
2. Có vấn đề với cấu hình môi trường hoặc URL
3. Server API trả về lỗi HTTP thay vì dữ liệu JSON hợp lệ

## Giải pháp đã triển khai

### 1. Cải thiện xử lý lỗi trong refreshToken

Trước đây, hàm refreshToken chỉ sử dụng `response.json()` trực tiếp, gây ra lỗi khi phản hồi không phải JSON. Đã sửa thành:

```typescript
const responseText = await response.text();
let refreshedTokens;
try {
  refreshedTokens = JSON.parse(responseText);
} catch (e) {
  console.error("Không thể phân tích phản hồi JSON:", responseText);
  throw new Error("Invalid JSON response from token endpoint");
}
```

### 2. Chuyển hướng callback trực tiếp đến NextAuth

Thay vì tự xử lý callback, đã cập nhật route để chuyển hướng trực tiếp đến API xử lý callback của NextAuth:

```typescript
return NextResponse.redirect(
  new URL(
    `/api/auth/callback/google?code=${code}&callbackUrl=${encodeURIComponent(
      callbackUrl
    )}`,
    req.url
  )
);
```

### 3. Bật chế độ debug và logging

Đã bật chế độ debug và thêm logging chi tiết để dễ dàng phát hiện vấn đề:

```typescript
debug: true,
logger: {
  error(code, metadata) {
    console.error("NextAuth Error:", code, metadata);
  },
  // ...
}
```

## Kiểm tra cấu hình môi trường

Để đảm bảo hệ thống hoạt động đúng, cần kiểm tra các biến môi trường:

1. `NEXTAUTH_URL`: Phải chính xác với URL của ứng dụng (bao gồm protocol và domain)
2. `NEXTAUTH_SECRET`: Chuỗi bí mật dùng để mã hóa token
3. `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`: Phải chính xác từ Google Cloud Console
4. Kiểm tra URL callback trong Google Console có đúng với URL callback của ứng dụng

## Khắc phục thêm

Nếu lỗi vẫn tiếp tục, có thể kiểm tra:

1. **Proxy/Firewall**: Đảm bảo không có firewall hoặc proxy chặn các yêu cầu API
2. **CORS**: Kiểm tra cấu hình CORS nếu gọi API từ domain khác
3. **Lưu lượng mạng**: Sử dụng DevTools để phân tích chi tiết lỗi mạng
4. **Phiên bản NextAuth**: Đảm bảo đang sử dụng phiên bản NextAuth mới nhất

## Cách khởi động lại hệ thống

Sau khi thực hiện các thay đổi, cần:

1. Dừng máy chủ phát triển
2. Xóa cache: `npm run clean` (nếu có)
3. Khởi động lại: `npm run dev`
4. Xóa cookie từ trình duyệt (hoặc mở cửa sổ ẩn danh) để đảm bảo session mới

## Kiểm tra hoạt động

Để xác nhận hệ thống đã hoạt động đúng:

1. Đăng nhập bằng Google
2. Kiểm tra console server tìm các log liên quan đến JWT
3. Kiểm tra chuyển hướng sau khi xác thực đúng chưa
