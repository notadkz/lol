# Lưu trữ thông tin đăng nhập Google trong hệ thống

## Sơ đồ kiến trúc xác thực

Hệ thống hiện tại sử dụng NextAuth.js để xử lý xác thực Google OAuth. Cách thông tin người dùng được lưu trữ phụ thuộc vào cơ chế phiên/session và adapter được sử dụng.

## Thông tin OAuth trong cơ sở dữ liệu

### Cấu trúc lưu trữ thông tin với NextAuth

Thông tin đăng nhập bằng Google được lưu trữ theo cách sau:

1. **Thông tin người dùng** được lưu trong bảng `User` trong schema hiện tại
2. **Thông tin tài khoản OAuth** được lưu trong bảng `Account` mà NextAuth yêu cầu khi sử dụng Prisma Adapter

Tuy nhiên, trong hệ thống hiện tại:

- Chưa thấy model `Account` theo định dạng của NextAuth trong schema, chỉ thấy model `Account` đại diện cho tài khoản game
- Đang sử dụng chiến lược phiên "JWT" thay vì "database" nên thông tin người dùng và phiên có thể được lưu trữ trong cookies/JWT thay vì database

### Schema cho OAuth khi sử dụng NextAuth+Prisma

Theo tài liệu của NextAuth, để lưu trữ thông tin xác thực OAuth đầy đủ, cần có các model sau:

```prisma
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String? @db.Text
  access_token       String? @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String? @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}
```

## Cơ chế JWT trong hệ thống hiện tại

Dựa trên cấu hình hiện tại, hệ thống đang sử dụng cơ chế JWT:

```javascript
// [NextAuth].ts
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  ...
}
```

Với cơ chế JWT, thông tin chính sẽ được lưu trữ như sau:

1. **Thông tin người dùng cơ bản**: Được lưu trong JWT token và cookie

   - Tên người dùng
   - Email
   - Ảnh đại diện
   - ID người dùng

2. **Thông tin OAuth**: Một số thông tin được lưu trong JWT

   - Access token
   - Refresh token
   - Thời gian hết hạn

3. **Không lưu trữ OAuth đầy đủ**: Trừ khi triển khai đầy đủ Prisma adapter, thông tin chi tiết về tài khoản OAuth không được lưu trong database

## Luồng thông tin khi đăng nhập bằng Google

1. **Người dùng nhấp vào đăng nhập Google**
2. **Chuyển hướng đến Google để xác thực**
3. **Google trả về thông tin người dùng và token**
4. **NextAuth xử lý callback và tạo JWT**
5. **JWT được lưu trong cookie**
6. **Người dùng được chuyển hướng về ứng dụng**

## Đề xuất cải thiện

1. **Triển khai đầy đủ Prisma adapter**: Cập nhật schema để bao gồm các bảng cần thiết cho NextAuth
2. **Kết nối thông tin người dùng**: Liên kết thông tin từ Google với model User hiện có
3. **Quản lý phiên**: Xem xét sử dụng cơ chế phiên "database" thay vì "jwt" để dễ quản lý và thu hồi

## Kết luận

Hiện tại, thông tin đăng nhập Google đang được lưu trữ chủ yếu trong JWT token và cookie, không lưu trữ đầy đủ trong database. Điều này có thể gây khó khăn trong việc quản lý tài khoản, thu hồi phiên, hoặc liên kết thông tin người dùng với dữ liệu khác trong hệ thống.
