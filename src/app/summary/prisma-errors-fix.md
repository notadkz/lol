# Lỗi Prisma Client và cách khắc phục

## Lỗi hiện tại

Hiện tại, dự án đang gặp lỗi khi sử dụng model `PasswordReset` trong Prisma:

```
Property 'PasswordReset' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
```

Lỗi này xuất hiện trong hai file:

1. `src/app/api/auth/forgot-password/route.ts`
2. `src/app/api/auth/reset-password/route.ts`

## Nguyên nhân

Có một số khả năng gây ra lỗi này:

1. **Prisma Client chưa được cập nhật sau khi cập nhật schema**: Sau khi thêm hoặc sửa đổi model trong file `schema.prisma`, bạn cần chạy lệnh `npx prisma generate` để cập nhật Prisma Client.

2. **Sử dụng phiên bản Prisma Client khác với phiên bản schema**: Có thể có sự không đồng nhất giữa phiên bản schema và phiên bản client đang sử dụng.

3. **Thiếu import hoặc import sai**: TypeScript không thể tìm thấy thông tin type cho model `PasswordReset`.

## Các bước đã thực hiện

1. **Đã tạo instance Prisma được chia sẻ**:

   - Đã tạo file `src/lib/prisma.ts` để định nghĩa một instance PrismaClient được chia sẻ trong toàn bộ ứng dụng
   - Đã cập nhật các file API để sử dụng instance này thay vì tạo instance mới mỗi khi gọi API

2. **Đã chuẩn hóa cách sử dụng model**:
   - Đã đảm bảo tên model là chính xác (`PasswordReset`) trong tất cả các file

Tuy nhiên, lỗi vẫn tồn tại, có thể do Prisma Client chưa được cập nhật hoàn toàn.

## Các bước tiếp theo để khắc phục

### 1. Chạy lệnh cập nhật Prisma Client

Điều này rất quan trọng và cần được thực hiện ngay:

```bash
npx prisma generate
```

### 2. Khởi động lại server

Sau khi cập nhật Prisma Client:

```bash
npm run dev
```

### 3. Nếu vẫn còn lỗi, kiểm tra thiết lập Prisma

Xem xét các vấn đề phổ biến:

1. **Kiểm tra cấu trúc thư mục Prisma**:

   ```
   /prisma
     schema.prisma
   ```

2. **Kiểm tra phiên bản Prisma**:

   ```bash
   npm list @prisma/client
   npm list prisma
   ```

3. **Thử làm mới toàn bộ cài đặt Prisma**:
   ```bash
   npm uninstall @prisma/client prisma
   npm install @prisma/client prisma
   npx prisma generate
   ```

### 4. Giải pháp tạm thời (nếu cần)

Nếu không thể sửa lỗi ngay lập tức, có thể sử dụng giải pháp tạm thời bằng cách ép kiểu Prisma Client:

```typescript
// Sử dụng ép kiểu để tránh lỗi TypeScript
(prisma as any).PasswordReset.findUnique({...})
```

Tuy nhiên, đây chỉ là giải pháp tạm thời và không nên sử dụng lâu dài vì nó bỏ qua kiểm tra kiểu TypeScript.

## Hướng dẫn cho người dùng

Khi nhận được file này, bạn nên thực hiện các bước sau:

1. Chạy lệnh `npx prisma generate` để cập nhật Prisma Client
2. Kiểm tra loại model trong schema.prisma
3. Xác nhận rằng môi trường phát triển của bạn (Node.js, npm) phù hợp với phiên bản Prisma bạn đang sử dụng
4. Khởi động lại server và kiểm tra xem lỗi đã được khắc phục chưa

Nếu các bước trên không giải quyết được vấn đề, vui lòng xem xét việc tạo một issue trên GitHub để nhận được sự hỗ trợ từ cộng đồng.
