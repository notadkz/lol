# Triển khai NextAuth với Database Sessions

## Tổng quan

Đã triển khai đầy đủ NextAuth.js với Prisma Adapter để lưu trữ thông tin đăng nhập OAuth (Google) vào cơ sở dữ liệu. Điều này mang lại nhiều lợi ích:

1. **Quản lý phiên tốt hơn**: Lưu phiên trong database giúp dễ dàng theo dõi và thu hồi phiên khi cần
2. **Liên kết tài khoản OAuth**: Lưu trữ thông tin từ provider vào database để có thể liên kết với dữ liệu khác
3. **Quản lý người dùng đầy đủ**: Truy vấn được thông tin người dùng đăng nhập qua OAuth

## Các thay đổi đã thực hiện

### 1. Cập nhật schema Prisma

Đã thêm các model mới vào schema Prisma:

- **OAuthAccount**: Lưu thông tin tài khoản OAuth (Google, Facebook, ...)

  - Lưu provider (google, facebook, ...)
  - Lưu providerAccountId (ID từ nhà cung cấp)
  - Lưu token và thông tin xác thực

- **Session**: Lưu thông tin phiên đăng nhập

  - Lưu sessionToken để xác thực phiên
  - Lưu thời gian hết hạn phiên
  - Lưu thông tin người dùng liên quan

- **Cập nhật User**: Bổ sung các trường cần thiết
  - Thêm trường emailVerified
  - Thêm trường image (ảnh đại diện từ OAuth)
  - Thêm mối quan hệ với OAuthAccount và Session

### 2. Cập nhật cấu hình NextAuth

Đã cập nhật file `src/app/api/auth/[...nextauth]/route.ts`:

- Thêm Prisma Adapter: `adapter: PrismaAdapter(prisma)`
- Chuyển sang phiên database: `strategy: "database"`
- Cập nhật callback session để phù hợp với cơ chế database
- Giữ lại logic refresh token khi cần

### 3. Cập nhật kiểu TypeScript

Đã cập nhật file `types/next-auth.d.ts` để hỗ trợ các trường mới:

- Cập nhật interface Session với các trường từ model User
- Cập nhật interface User với các trường từ model User
- Giữ nguyên interface JWT cho trường hợp sử dụng callback

## Luồng dữ liệu mới

1. **Người dùng đăng nhập bằng Google**:

   - Chuyển hướng đến Google OAuth
   - Google trả về thông tin người dùng và token

2. **NextAuth xử lý callback**:

   - Lưu thông tin OAuth vào bảng OAuthAccount
   - Lưu hoặc cập nhật thông tin người dùng vào bảng User
   - Tạo phiên mới trong bảng Session

3. **Quản lý phiên**:
   - Phiên được lưu trong database thay vì chỉ trong cookie
   - Phiên có thể được thu hồi từ server-side
   - Hỗ trợ đăng xuất ở tất cả thiết bị

## Sử dụng trong ứng dụng

1. **Kiểm tra đăng nhập**: Tiếp tục sử dụng useSession như trước:

   ```javascript
   import { useSession } from "next-auth/react";

   function Component() {
     const { data: session } = useSession();
     if (session) {
       return <p>Signed in as {session.user.email}</p>;
     }
     return <p>Not signed in</p>;
   }
   ```

2. **Truy vấn thông tin người dùng**: Có thể truy vấn thông tin đầy đủ từ database:
   ```javascript
   const user = await prisma.user.findUnique({
     where: { email: session.user.email },
     include: { oauthAccounts: true },
   });
   ```

## Lưu ý cải tiến tiếp theo

- **Thêm các provider khác**: Có thể thêm các provider khác như Facebook, GitHub, ...
- **Cải thiện UX**: Thêm trang quản lý tài khoản cho phép người dùng xem và quản lý các liên kết OAuth
- **Xử lý hợp nhất tài khoản**: Xử lý trường hợp một email được sử dụng bởi nhiều provider

## Kiểm tra

Đã chạy các lệnh sau để cập nhật cơ sở dữ liệu:

- `npx prisma migrate reset --force`: Reset cơ sở dữ liệu (chỉ trong môi trường phát triển)
- `npx prisma migrate dev --name add_nextauth_models`: Tạo migration mới và áp dụng vào cơ sở dữ liệu
- `npx prisma generate`: Cập nhật Prisma Client
