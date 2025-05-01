# Trang Đăng Nhập và Đăng Ký cho LOL Marketplace

## Tổng quan

Đã tạo các trang đăng nhập, đăng ký và quên mật khẩu cho website bán tài khoản game League of Legends (LOL Marketplace) với các tính năng:

- Đăng nhập bằng email/mật khẩu
- Đăng nhập bằng Google OAuth
- Đăng ký tài khoản mới
- Quên mật khẩu / khôi phục mật khẩu

## Cấu trúc thư mục

```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx         # Trang đăng nhập
│   │   ├── register/
│   │   │   └── page.tsx         # Trang đăng ký
│   │   └── forgot-password/
│   │       └── page.tsx         # Trang quên mật khẩu
│   └── api/
│       └── auth/
│           ├── google/
│           │   ├── route.ts     # API endpoint xử lý đăng nhập bằng Google
│           │   └── callback/
│           │       └── route.ts # API endpoint xử lý callback từ Google
```

## Cài đặt

1. Cập nhật biến môi trường trong file `.env.local`:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

2. Để lấy Google Client ID và Secret:
   - Truy cập [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo một dự án mới
   - Vào "APIs & Services" > "Credentials"
   - Tạo "OAuth client ID" mới
   - Chọn loại "Web application"
   - Thêm URI chuyển hướng: `http://localhost:3000/api/auth/google/callback`
   - Lưu lại Client ID và Client Secret

## Sử dụng

### Các trang người dùng:

- **Đăng nhập**: `/auth/login`

  - Đăng nhập bằng email/mật khẩu
  - Đăng nhập bằng Google
  - Liên kết đến trang quên mật khẩu và đăng ký

- **Đăng ký**: `/auth/register`

  - Đăng ký với email, mật khẩu và thông tin cơ bản
  - Đăng ký bằng Google
  - Xác nhận đồng ý điều khoản dịch vụ

- **Quên mật khẩu**: `/auth/forgot-password`
  - Nhập email để nhận liên kết đặt lại mật khẩu
  - Thông báo đã gửi email xác nhận

### API Endpoints:

- **Đăng nhập Google**: `/api/auth/google`

  - Chuyển hướng người dùng đến trang đăng nhập Google

- **Callback Google**: `/api/auth/google/callback`
  - Xử lý phản hồi từ Google OAuth
  - Tạo hoặc đăng nhập người dùng

## Tính năng đã hoàn thành

✅ Trang đăng nhập với form và đăng nhập bằng Google  
✅ Trang đăng ký với xác nhận mật khẩu và điều khoản  
✅ Trang quên mật khẩu với gửi email  
✅ API endpoints cho Google OAuth  
✅ Giao diện thân thiện, responsive  
✅ Xác thực dữ liệu đầu vào cơ bản  
✅ Chuyển hướng giữa các trang
✅ Theme sáng/tối tự động theo hệ thống

## Cần triển khai trong tương lai

⬜ Kết nối với cơ sở dữ liệu Prisma  
⬜ Lưu thông tin người dùng vào database  
⬜ Xử lý token và phiên đăng nhập  
⬜ Bảo mật và xác thực mật khẩu  
⬜ Tích hợp OAuth cho các nền tảng khác (Facebook, Twitter...)  
⬜ Xác minh email sau đăng ký  
⬜ Trang đổi mật khẩu
