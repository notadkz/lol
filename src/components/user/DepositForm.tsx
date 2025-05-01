"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { usePayOS, PayOSConfig } from "payos-checkout";

type PaymentResponse = {
  success: boolean;
  paymentUrl?: string;
  qrCode?: string;
  paymentInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    amount?: number;
    description?: string;
  };
  reference?: string;
  error?: string;
};

export default function DepositForm() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [amount, setAmount] = useState<number>(100000);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<boolean>(false);
  const paymentContainerRef = useRef<HTMLDivElement>(null);

  // Thử lại session nếu status là loading
  useEffect(() => {
    if (status === "loading") {
      const timeout = setTimeout(() => {
        console.log("Làm mới session...");
        router.refresh();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  // Khởi tạo PayOS config
  const payOSConfig: PayOSConfig = {
    RETURN_URL:
      typeof window !== "undefined"
        ? `${window.location.origin}/payment/success`
        : "",
    ELEMENT_ID: "payment-container",
    CHECKOUT_URL: paymentData?.paymentUrl || "",
    embedded: false, // Sử dụng popup thay vì embedded
    onSuccess: (event: any) => {
      console.log("Thanh toán thành công:", event);
      // Chuyển hướng đến trang thành công
      router.push("/payment/success");
    },
    onCancel: (event: any) => {
      console.log("Hủy thanh toán:", event);
      setError("Thanh toán đã bị hủy");
    },
    onExit: (event: any) => {
      console.log("Đóng cửa sổ thanh toán:", event);
    },
  };

  // Khởi tạo PayOS hook
  const { open: openPayOS } = usePayOS(payOSConfig);

  // Log session data khi component mount
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);

    // Kiểm tra URL params để lấy amount nếu có
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const amountParam = urlParams.get("amount");
      if (amountParam) {
        try {
          const parsedAmount = parseInt(amountParam);
          if (!isNaN(parsedAmount) && parsedAmount >= 50000) {
            setAmount(parsedAmount);
          }
        } catch (err) {
          console.error("Lỗi khi đọc tham số amount:", err);
        }
      }
    }
  }, [session, status]);

  // Đăng xuất và đăng nhập lại để làm mới session
  const handleRelogin = () => {
    setLoading(true);
    signOut({ redirect: false }).then(() => {
      // Đưa người dùng về trang đăng nhập với callback URL
      router.push(`/login?callbackUrl=${encodeURIComponent("/user/deposit")}`);
    });
  };

  // Làm mới session mà không cần đăng nhập lại
  const handleRefreshSession = async () => {
    setLoading(true);
    setError(null);
    try {
      await update(); // Cập nhật session
      setSessionError(false);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi làm mới session:", err);
      setError("Không thể làm mới phiên đăng nhập, vui lòng đăng nhập lại.");
      setLoading(false);
    }
  };

  // Định dạng số tiền với dấu phẩy ngăn cách hàng nghìn
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // Xử lý thay đổi số tiền
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, ""), 10);
    setAmount(isNaN(value) ? 0 : value);
  };

  // Kiểm tra xem phản hồi API có hợp lệ không
  const isValidPaymentData = (data: PaymentResponse): boolean => {
    if (!data) return false;

    // Kiểm tra thành công
    if (!data.success) {
      console.error("Phản hồi API không thành công:", data);
      return false;
    }

    // Kiểm tra URL thanh toán
    if (!data.paymentUrl) {
      console.error("Phản hồi API thiếu trường paymentUrl:", data);
      return false;
    }

    return true;
  };

  // Xử lý form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Kiểm tra đã đăng nhập chưa
    if (status !== "authenticated" || !session) {
      setError("Bạn cần đăng nhập để thực hiện thao tác này");
      return;
    }

    // Kiểm tra session có đầy đủ thông tin không
    const userId = session.user?.id;
    const userEmail = session.user?.email;

    if (!userEmail) {
      setError("Thông tin email không có, vui lòng đăng nhập lại");
      setSessionError(true);
      return;
    }

    // Kiểm tra số tiền tối thiểu
    if (amount < 50000) {
      setError("Số tiền nạp tối thiểu là 50,000 VNĐ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Gửi yêu cầu tạo mã thanh toán với:", {
        amount,
        description,
        userId,
        email: userEmail,
      });

      const response = await fetch("/api/payos/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
        }),
      });

      const data = await response.json();
      console.log("Phản hồi API PayOS:", data);

      if (!response.ok) {
        console.error("Lỗi API:", data);
        // Xử lý lỗi người dùng không hợp lệ riêng
        if (
          data.error === "Thông tin người dùng không hợp lệ" ||
          data.error === "Không tìm thấy thông tin người dùng" ||
          data.error === "Thông tin người dùng không đầy đủ" ||
          data.error === "Thiếu thông tin email người dùng" ||
          data.error === "Không tìm thấy thông tin người dùng trong hệ thống"
        ) {
          setSessionError(true);
          throw new Error(
            "Có vấn đề với phiên đăng nhập của bạn. Vui lòng làm mới phiên hoặc đăng nhập lại để tiếp tục."
          );
        }
        throw new Error(data.error || "Có lỗi xảy ra khi tạo link thanh toán");
      }

      // Kiểm tra dữ liệu phản hồi
      if (!isValidPaymentData(data)) {
        throw new Error("Dữ liệu thanh toán không hợp lệ từ máy chủ");
      }

      setPaymentData(data);
      setSessionError(false);
    } catch (err: any) {
      console.error("Lỗi khi tạo mã thanh toán:", err);
      setError(err.message || "Có lỗi xảy ra khi tạo link thanh toán");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán bằng PayOS Checkout
  const handlePayment = () => {
    if (!paymentData?.paymentUrl) {
      setError("Không có thông tin thanh toán");
      return;
    }

    try {
      openPayOS();
    } catch (err) {
      console.error("Lỗi khi mở cửa sổ thanh toán:", err);
      // Fallback: mở trong tab mới nếu có lỗi
      handlePaymentInNewTab();
    }
  };

  // Xử lý thanh toán bằng cách mở tab mới (phương pháp dự phòng)
  const handlePaymentInNewTab = () => {
    if (paymentData?.paymentUrl) {
      window.open(paymentData.paymentUrl, "_blank");
    } else {
      setError("Không có URL thanh toán");
    }
  };

  // Kiểm tra xem QR code có phải là base64 không
  const isBase64 = (str: string): boolean => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  };

  // Hiển thị QR code
  const renderQRCode = () => {
    if (!paymentData?.qrCode) {
      return (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 mb-4">
          <p>
            Không có mã QR. Vui lòng sử dụng nút "Thanh toán PayOS" bên dưới.
          </p>
        </div>
      );
    }

    // Đối với QR code dạng base64
    if (isBase64(paymentData.qrCode)) {
      return (
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 rounded-lg p-4 inline-block">
            <div className="w-48 h-48 bg-white p-2 mx-auto">
              <Image
                src={`data:image/png;base64,${paymentData.qrCode}`}
                alt="QR Code thanh toán"
                width={200}
                height={200}
                className="mx-auto"
              />
            </div>
          </div>
        </div>
      );
    }

    // Đối với QR code dạng URL hoặc text
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 rounded-lg p-4 inline-block">
          <div className="w-48 h-48 bg-white p-2 mx-auto">
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                paymentData.qrCode
              )}`}
              alt="QR Code thanh toán"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    );
  };

  // Nếu chưa đăng nhập, hiển thị thông báo
  if (status === "unauthenticated") {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Bạn cần đăng nhập để sử dụng chức năng này.
        </p>
        <button
          onClick={() => router.push("/login?callbackUrl=/user/deposit")}
          className="mt-2 text-blue-600 hover:underline"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Nếu đang loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Container cho PayOS Checkout */}
      <div
        id="payment-container"
        ref={paymentContainerRef}
        style={{ display: "none" }}
      ></div>

      {/* Hiển thị thông tin phiên làm việc (chỉ khi debug) */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
        <h4 className="font-bold mb-2">Thông tin phiên đăng nhập:</h4>
        <p>ID: {session?.user?.id || "N/A"}</p>
        <p>Email: {session?.user?.email || "N/A"}</p>
        <p>Trạng thái: {status}</p>
        <p className="mt-2 text-blue-500">
          Nếu gặp lỗi, vui lòng thử làm mới phiên đăng nhập hoặc đăng nhập lại.
        </p>
      </div>

      {sessionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={handleRefreshSession}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Đang làm mới..." : "Làm mới phiên"}
            </button>
            <button
              onClick={handleRelogin}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              disabled={loading}
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      )}

      {!paymentData ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="amount"
              className="block text-gray-700 font-medium mb-2"
            >
              Số tiền nạp (VNĐ)
            </label>
            <input
              type="text"
              id="amount"
              value={formatCurrency(amount)}
              onChange={handleAmountChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {error && !sessionError && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-2"
            >
              Ghi chú (không bắt buộc)
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú cho giao dịch này"
            />
          </div>

          <button
            type="submit"
            disabled={loading || status !== "authenticated" || sessionError}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              loading || status !== "authenticated" || sessionError
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition duration-200`}
          >
            {loading ? "Đang xử lý..." : "Tạo mã thanh toán"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {renderQRCode()}

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Ngân hàng:</span>
              <span className="font-medium">
                {paymentData.paymentInfo?.bankName || "VietQR"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số tài khoản:</span>
              <span className="font-medium">
                {paymentData.paymentInfo?.accountNumber || "Xem trong QR code"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chủ tài khoản:</span>
              <span className="font-medium">
                {paymentData.paymentInfo?.accountName || "PayOS"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số tiền:</span>
              <span className="font-medium">
                {paymentData.paymentInfo?.amount
                  ? formatCurrency(paymentData.paymentInfo.amount) + " VNĐ"
                  : formatCurrency(amount) + " VNĐ"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nội dung:</span>
              <span className="font-medium">
                {paymentData.paymentInfo?.description || description || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã tham chiếu:</span>
              <span className="font-medium">
                {paymentData.reference || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            {paymentData.paymentUrl && (
              <>
                <button
                  type="button"
                  onClick={handlePayment}
                  className="w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-200"
                >
                  Thanh toán PayOS
                </button>
                <button
                  type="button"
                  onClick={handlePaymentInNewTab}
                  className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition duration-200"
                >
                  Mở trong tab mới
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setPaymentData(null);
                setError(null);
              }}
              className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-200"
            >
              Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
