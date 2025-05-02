"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type PaymentStatus = "SUCCESS" | "PENDING" | "FAILED" | "UNKNOWN";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("UNKNOWN");
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);

  // Lấy tham số reference từ URL
  const reference = searchParams.get("reference");

  useEffect(() => {
    // Nếu không có reference, chuyển hướng về trang deposit
    if (!reference) {
      router.push("/user/deposit");
      return;
    }

    // Nếu chưa đăng nhập, chuyển hướng về trang login
    if (sessionStatus === "unauthenticated") {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          `/payment/success?reference=${reference}`
        )}`
      );
      return;
    }

    // Chỉ kiểm tra khi đã đăng nhập
    if (sessionStatus === "authenticated" && reference) {
      checkPaymentStatus();
    }
  }, [reference, sessionStatus, router]);

  // Hàm kiểm tra trạng thái thanh toán
  const checkPaymentStatus = async () => {
    try {
      setIsLoading(true);
      // Gọi API kiểm tra trạng thái giao dịch dựa vào reference
      const response = await fetch(
        `/api/payos/check-payment?reference=${reference}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setTransaction(data.transaction);
        setPaymentStatus(
          data.transaction.status === "SUCCESS" ? "SUCCESS" : "PENDING"
        );
      } else {
        setPaymentStatus("FAILED");
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
      setPaymentStatus("FAILED");
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Đang kiểm tra thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo dựa vào trạng thái
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {paymentStatus === "SUCCESS" && (
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-20 h-20 mx-auto flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mt-4 text-green-600">
              Thanh toán thành công!
            </h2>
            <p className="mt-2 text-gray-600">
              Giao dịch của bạn đã được xác nhận. Số dư tài khoản của bạn đã
              được cập nhật.
            </p>
            {transaction && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg text-left">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Mã giao dịch:</div>
                  <div className="font-medium">{transaction.reference}</div>
                  <div className="text-gray-500">Số tiền:</div>
                  <div className="font-medium">
                    {Number(transaction.amount).toLocaleString("vi-VN")} VNĐ
                  </div>
                  <div className="text-gray-500">Thời gian:</div>
                  <div className="font-medium">
                    {new Date(transaction.updatedAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {paymentStatus === "PENDING" && (
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full p-3 w-20 h-20 mx-auto flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mt-4 text-yellow-600">
              Đang xử lý thanh toán
            </h2>
            <p className="mt-2 text-gray-600">
              Giao dịch của bạn đang được xử lý. Vui lòng đợi trong giây lát.
            </p>
            <button
              onClick={checkPaymentStatus}
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Kiểm tra lại
            </button>
          </div>
        )}

        {paymentStatus === "FAILED" && (
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-20 h-20 mx-auto flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mt-4 text-red-600">
              Thanh toán thất bại
            </h2>
            <p className="mt-2 text-gray-600">
              Có lỗi xảy ra trong quá trình xử lý thanh toán của bạn. Vui lòng
              thử lại.
            </p>
          </div>
        )}

        {paymentStatus === "UNKNOWN" && (
          <div className="text-center">
            <div className="bg-gray-100 rounded-full p-3 w-20 h-20 mx-auto flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mt-4 text-gray-600">
              Không thể xác định
            </h2>
            <p className="mt-2 text-gray-600">
              Không thể xác định trạng thái thanh toán của bạn. Vui lòng kiểm
              tra lại sau.
            </p>
          </div>
        )}

        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/user/deposit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Nạp thêm tiền
          </Link>
          <Link
            href="/user/dashboard"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
