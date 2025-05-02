# Sửa lỗi hiển thị trang Payment Success

## Vấn đề

Sau khi tạo mã thanh toán ở `DepositForm.tsx` và thực hiện thanh toán thành công, khi ấn vào "Thanh toán PayOS" thì có chuyển hướng qua trang success nhưng không hiển thị thông tin giao dịch. Nguyên nhân là do:

1. API `check-status` không trả về trường `success` trong response, dẫn đến lỗi khi kiểm tra điều kiện `result.success && result.status === "SUCCESS"`.
2. Khi chuyển hướng đến trang success, reference không được truyền trong URL, khiến trang success không thể lấy thông tin giao dịch.

## Giải pháp

### 1. Sửa API check-status

Cập nhật API để thêm trường `success` vào response:

```typescript
// src/app/api/payos/check-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "Thiếu mã tham chiếu", success: false },
      { status: 400 }
    );
  }

  const transaction = await prisma.topUpTransaction.findFirst({
    where: { reference },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Không tìm thấy giao dịch", success: false },
      { status: 404 }
    );
  }

  return NextResponse.json({ status: transaction.status, success: true });
}
```

### 2. Sửa hàm polling trong DepositForm

Cập nhật hàm polling để truyền reference vào URL khi chuyển hướng đến trang success:

```typescript
pollingRef.current = setInterval(async () => {
  try {
    const res = await fetch(
      `/api/payos/check-status?reference=${paymentData.reference}`
    );
    const result = await res.json();

    if (result.success && result.status === "SUCCESS") {
      clearInterval(pollingRef.current!);
      router.push(`/payment/success?reference=${paymentData.reference}`);
    }
  } catch (err) {
    console.error("Lỗi kiểm tra trạng thái giao dịch:", err);
  }
}, 5000);
```

### 3. Sửa PayOS config

Cập nhật cấu hình PayOS để truyền reference vào URL khi thanh toán thành công:

```typescript
// PayOS config
const payOSConfig: PayOSConfig = {
  RETURN_URL: `${window.location.origin}/payment/success?reference=${
    paymentData?.reference || ""
  }`,
  ELEMENT_ID: "payment-container",
  CHECKOUT_URL: paymentData?.paymentUrl || "",
  embedded: true,
  onSuccess: () => {
    console.log("Thanh toán thành công qua iframe");
    router.push(`/payment/success?reference=${paymentData?.reference || ""}`);
  },
  onCancel: () => {
    console.log("Hủy thanh toán");
    setError("Thanh toán đã bị hủy");
  },
  onExit: () => {},
};
```

## Kết quả

Sau khi áp dụng các sửa đổi trên:

- API check-status trả về đúng định dạng với trường `success`
- Khi chuyển hướng đến trang success, reference được truyền trong URL
- Trang success có thể lấy reference từ URL để hiển thị thông tin giao dịch
- Người dùng có thể xem thông tin giao dịch sau khi thanh toán thành công
