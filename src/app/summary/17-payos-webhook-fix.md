# Sửa lỗi Xử lý Webhook PayOS và Hiển thị Trang Thanh Toán Thành Công

## Vấn đề

Sau khi thực hiện thanh toán thành công qua PayOS, khi chuyển hướng đến trang success, trang này vẫn hiển thị thông báo "❌ Giao dịch thất bại hoặc chưa xác nhận!" mặc dù giao dịch đã thành công. Dựa trên log hệ thống, có 2 vấn đề chính:

1. Webhook từ PayOS không được xử lý đúng, trả về mã lỗi 400 với thông báo "Dữ liệu webhook không hợp lệ".
2. Trang success không kiểm tra đúng trường `success` từ API response của endpoint `/api/payos/check-status`.

## Giải pháp

### 1. Sửa trang Success để kiểm tra đúng response từ API

Cập nhật file `src/app/payment/success/page.tsx` để kiểm tra cả trường `success` và `status` từ API:

```typescript
useEffect(() => {
  const checkStatus = async () => {
    try {
      const res = await api.get(`/payos/check-status?reference=${reference}`);
      console.log("Kết quả kiểm tra giao dịch:", res.data);

      // Kiểm tra trường success và status
      if (res.data?.success && res.data?.status === "SUCCESS") {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
      setStatus("failed");
    }
  };

  if (reference) checkStatus();
}, [reference]);
```

### 2. Sửa API Webhook để xử lý cả định dạng webhook mới và cũ từ PayOS

Cập nhật file `src/app/api/payos/webhook/route.ts` để xử lý các định dạng webhook khác nhau:

```typescript
// Xử lý dữ liệu webhook theo định dạng mới
let paymentData = data;
let orderCode = null;
let status = null;

if (data.data && typeof data.data === "object") {
  paymentData = data.data;
  // Tìm orderCode
  orderCode = paymentData.orderCode;
  // Xác định trạng thái
  status =
    data.code === "00" && data.success ? PayOSStatus.PAID : PayOSStatus.ERROR;
} else {
  // Định dạng cũ
  orderCode = data.orderCode;
  status = data.status;
}
```

### 3. Nâng cao cách tìm kiếm giao dịch

API Webhook được sửa để tìm kiếm giao dịch qua nhiều trường hơn:

```typescript
// Tìm giao dịch theo mã tham chiếu
let transactionData = await prisma.topUpTransaction.findFirst({
  where: {
    transactionCode: orderCode.toString(),
  },
  include: {
    user: true,
  },
});

if (!transactionData) {
  // Thử tìm bằng reference từ webhook
  const reference = paymentData.reference || data.reference;

  if (reference) {
    transactionData = await prisma.topUpTransaction.findFirst({
      where: { reference: reference.toString() },
      include: { user: true },
    });
  }

  if (!transactionData) {
    console.error("Không tìm thấy giao dịch:", orderCode);
    return NextResponse.json(
      { error: "Không tìm thấy giao dịch" },
      { status: 404 }
    );
  }
}
```

## Kết quả

Sau khi áp dụng các sửa đổi:

- API webhook có thể xử lý các định dạng webhook khác nhau từ PayOS
- Hệ thống có thể tìm kiếm giao dịch qua nhiều trường hợp khác nhau
- Trang success hiển thị đúng trạng thái của giao dịch
- Người dùng nhận được phản hồi chính xác về trạng thái thanh toán

## Cải thiện thêm

- Thêm log chi tiết để dễ dàng debug webhook
- Hiển thị thêm thông tin giao dịch trên trang success (số tiền, thời gian, v.v.)
- Thêm tùy chọn kiểm tra lại trạng thái giao dịch cho người dùng
