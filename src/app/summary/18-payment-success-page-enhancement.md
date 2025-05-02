# Cải thiện Trang Thanh Toán Thành Công

## Vấn đề

Trang thanh toán thành công (payment/success) hiện tại chỉ hiển thị thông báo đơn giản về trạng thái giao dịch thành công hoặc thất bại, không cung cấp chi tiết về giao dịch. Người dùng cần thông tin chi tiết hơn về giao dịch như số tiền, mã tham chiếu, mã giao dịch, thời gian thanh toán, v.v.

## Giải pháp

### 1. Sử dụng cả hai API để xử lý tối ưu

- **API check-status**: Kiểm tra nhanh trạng thái giao dịch
- **API check-payment**: Lấy thông tin chi tiết về giao dịch

```typescript
// Bước 1: Kiểm tra trạng thái giao dịch
const checkStatus = async () => {
  try {
    // Sử dụng API check-status để kiểm tra trạng thái giao dịch
    const res = await api.get(`/payos/check-status?reference=${reference}`);

    // Kiểm tra trường success và status
    if (res.data?.success && res.data?.status === "SUCCESS") {
      setStatus("success");
      // Sau khi biết giao dịch thành công, lấy thông tin chi tiết
      getTransactionDetails();
    } else {
      setStatus("failed");
      // Nếu thất bại, vẫn lấy thông tin để hiển thị lỗi chi tiết
      getTransactionDetails();
    }
  } catch (err) {
    console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
    setStatus("failed");
  }
};

// Bước 2: Lấy thông tin chi tiết giao dịch
const getTransactionDetails = async () => {
  try {
    setIsLoadingDetails(true);
    // Sử dụng API check-payment để lấy thông tin chi tiết về giao dịch
    const res = await api.get(`/payos/check-payment?reference=${reference}`);

    if (res.data?.success && res.data?.transaction) {
      setTransaction(res.data.transaction);
    }
  } catch (err) {
    console.error("Lỗi khi lấy thông tin chi tiết giao dịch:", err);
  } finally {
    setIsLoadingDetails(false);
  }
};
```

### 2. Cập nhật API check-payment để trả về đầy đủ thông tin

```typescript
// Trả về thông tin giao dịch đầy đủ
return NextResponse.json({
  success: true,
  transaction: {
    id: transaction.id,
    reference: transaction.reference,
    amount: transaction.amount,
    description:
      transaction.transferContent || transaction.processingNote || "",
    transactionCode: transaction.transactionCode || "",
    bankReference: transaction.bankReference || "",
    transferTime: transaction.transferTime || null,
    status: transaction.status,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  },
});
```

### 3. Thêm state và kiểu dữ liệu để lưu trữ và quản lý thông tin

```typescript
type TransactionData = {
  id: number;
  reference: string;
  amount: number;
  description?: string;
  transactionCode?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  transferTime?: string;
  bankReference?: string;
};

const [transaction, setTransaction] = useState<TransactionData | null>(null);
const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
```

### 4. Thêm hàm tiện ích để định dạng tiền tệ và thời gian

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
```

### 5. Cải thiện giao diện người dùng

1. **Hiển thị trạng thái loading cho cả quá trình kiểm tra và tải chi tiết**

   - Loading chính khi kiểm tra trạng thái
   - Loading thứ cấp khi tải thông tin chi tiết giao dịch

2. **Nâng cấp UI cho trạng thái thành công:**

   - Biểu tượng thành công
   - Hiển thị thông tin chi tiết về giao dịch
   - Định dạng số tiền và thời gian đẹp hơn

3. **Nâng cấp UI cho trạng thái thất bại:**

   - Biểu tượng thất bại
   - Hiển thị thông tin về giao dịch thất bại
   - Thông báo hữu ích và lựa chọn kiểm tra lại

4. **Xử lý các trường hợp đặc biệt:**
   - Không tìm thấy thông tin giao dịch
   - Lỗi khi tải chi tiết giao dịch

## Kết quả

Sau khi cập nhật, trang thanh toán thành công giờ đây:

- Cung cấp thông tin chi tiết về giao dịch cho người dùng
- Có hiệu suất tốt hơn bằng cách tách quá trình kiểm tra trạng thái và lấy thông tin chi tiết
- Hiển thị đúng trạng thái loading cho từng bước xử lý
- Hiển thị đúng định dạng tiền tệ và thời gian theo chuẩn Việt Nam
- Cung cấp tùy chọn kiểm tra lại trạng thái giao dịch khi thất bại

## Lợi ích

- Người dùng có thể xác nhận đầy đủ thông tin về giao dịch của họ
- Tăng tính minh bạch và độ tin cậy của hệ thống thanh toán
- Tách biệt quá trình kiểm tra nhanh và lấy thông tin chi tiết giúp tối ưu hóa hiệu suất
- Cải thiện trải nghiệm người dùng tổng thể với giao diện hiện đại và thông tin đầy đủ
