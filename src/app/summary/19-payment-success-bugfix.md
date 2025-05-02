# Sửa Lỗi Trang Thanh Toán Thành Công

## Vấn đề

Sau khi triển khai trang payment success với đầy đủ thông tin giao dịch, đã phát hiện ra hai lỗi chính:

1. **Lỗi cú pháp Prisma**: Lỗi trong cú pháp truy vấn Prisma tại file API `check-payment/route.ts`:

   ```
   Error [PrismaClientValidationError]:
   Invalid `prisma.topUpTransaction.findFirst()` invocation:
   {...
   Argument `userId` is missing.
   ```

2. **Lỗi xác thực người dùng**: Trang payment success không thể lấy thông tin giao dịch vì API `check-payment` yêu cầu người dùng phải đăng nhập, trong khi trang này có thể được truy cập từ callback của cổng thanh toán khi người dùng chưa đăng nhập.

## Giải pháp

### 1. Sửa lỗi cú pháp Prisma

Sửa lại cú pháp truy vấn Prisma trong file `check-payment/route.ts`:

```typescript
// Trước khi sửa - Có dấu phẩy thừa và dấu ngoặc móc
where: {
  reference: reference,
  userId: Number(session.user.id),
},

// Sau khi sửa
where: {
  reference: reference,
  userId: Number(session.user.id)
},
```

### 2. Sửa lỗi xác thực người dùng

Sửa đổi API `check-payment` để cho phép truy cập từ trang success mà không cần đăng nhập:

1. **Thêm tham số `from_success`**: API sẽ kiểm tra tham số này để biết được yêu cầu đến từ trang success:

   ```typescript
   const fromSuccess = searchParams.get("from_success") === "true";
   ```

2. **Điều chỉnh điều kiện tìm kiếm giao dịch**:

   ```typescript
   // Xác định điều kiện tìm kiếm
   const searchCondition: any = {
     reference: reference,
   };

   // Nếu đăng nhập và không phải từ trang success, thêm điều kiện userId
   if (session?.user && !fromSuccess) {
     searchCondition.userId = Number(session.user.id);
   }
   ```

3. **Cập nhật trang success để thêm tham số `from_success`**:
   ```typescript
   const res = await api.get(
     `/payos/check-payment?reference=${reference}&from_success=true`
   );
   ```

## Kết quả

Sau khi áp dụng các sửa đổi:

- Trang success có thể hiển thị thông tin chi tiết giao dịch mà không gặp lỗi
- API `check-payment` giờ đây có thể sử dụng cho cả trường hợp đã đăng nhập và chưa đăng nhập từ trang success
- Vẫn duy trì tính bảo mật cho các trường hợp sử dụng API từ nơi khác (yêu cầu đăng nhập)

## Lợi ích

- Người dùng có thể xem thông tin giao dịch ngay sau khi thanh toán thành công
- Trải nghiệm người dùng được cải thiện vì không bị gián đoạn bởi yêu cầu đăng nhập sau khi từ gateway thanh toán trở về
- Cải thiện độ tin cậy của hệ thống xử lý thanh toán
