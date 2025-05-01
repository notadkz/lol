# Triển khai NextAuth.js cho hệ thống xác thực

## Tóm tắt triển khai

Đã triển khai NextAuth.js thay thế cho phương thức OAuth tự triển khai trước đó. Điều này mang lại nhiều lợi ích:

1. **Bảo mật tốt hơn** - Sử dụng HttpOnly cookie thay vì lưu token qua URL query params
2. **Nhất quán trong quản lý xác thực** - Một cách tiếp cận duy nhất cho việc xác thực
3. **Dễ bảo trì và mở rộng** - Dễ dàng thêm các provider xác thực khác

## Các file đã thay đổi

### File cấu hình NextAuth

- `src/app/api/auth/[nextauth].ts` - Cấu hình NextAuth với Google provider, JWT và callback

### Type Definitions

- `types/next-auth.d.ts` - Mở rộng các kiểu cho NextAuth để hỗ trợ thêm các trường tùy chỉnh

### Middleware

- `middleware.ts` - Bảo vệ các route cần xác thực

### Hooks

- `src/hooks/useAuth.ts` - Custom hook để dễ dàng xử lý đăng nhập/đăng xuất

### Pages UI

- `src/app/auth/login/page.tsx` - Trang đăng nhập sử dụng NextAuth
- `src/app/auth/register/page.tsx` - Trang đăng ký sử dụng NextAuth
- `src/app/auth/error/page.tsx` - Trang hiển thị lỗi xác thực
- `src/app/auth/new-user-setup/page.tsx` - Trang cài đặt ban đầu cho người dùng mới

### Providers

- `src/app/providers.tsx` - Cung cấp SessionProvider cho toàn bộ ứng dụng
- `src/app/layout.tsx` - Cập nhật để bọc ứng dụng với SessionProvider

### API Routes

- `src/app/api/auth/register/route.ts` - Endpoint đăng ký người dùng mới

## Các file đã xóa

- `src/app/api/auth/google/route.ts` - File cũ xử lý xác thực Google OAuth
- `src/app/api/auth/google/callback/route.ts` - File cũ xử lý callback từ Google

## Cách sử dụng

### Cấu hình môi trường

Sao chép `.env.example` thành `.env.local` và cập nhật các giá trị:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Đăng nhập với Google

```jsx
import { useAuth } from "@/hooks/useAuth";

export default function LoginButton() {
  const { login } = useAuth();

  return <button onClick={() => login("google")}>Đăng nhập với Google</button>;
}
```

### Kiểm tra trạng thái đăng nhập

```jsx
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { session, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Đang tải...</div>;

  if (!isAuthenticated) return <div>Vui lòng đăng nhập để xem trang này</div>;

  return (
    <div>
      <h1>Xin chào, {session?.user?.name}</h1>
      <p>Email: {session?.user?.email}</p>
    </div>
  );
}
```

### Đăng xuất

```jsx
import { useAuth } from "@/hooks/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();

  return <button onClick={() => logout()}>Đăng xuất</button>;
}
```

## Các phần còn thiếu và cần triển khai thêm

1. **Adapter cho cơ sở dữ liệu** - Cần thêm adapter để lưu trữ phiên người dùng trong database
2. **Email Provider** - Xác thực bằng email/mật khẩu
3. **Xử lý refresh token** - Cần triển khai logic refresh token khi token hết hạn
4. **Phân quyền người dùng** - Phân quyền chi tiết hơn cho các vai trò khác nhau
5. **Đồng bộ hóa thông tin người dùng** - Đồng bộ hóa thông tin người dùng giữa Google và database
