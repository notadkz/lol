"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/services/api";

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

export default function PaymentSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get("reference");
  const [status, setStatus] = useState<"checking" | "success" | "failed">(
    "checking"
  );
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  // Kiểm tra trạng thái giao dịch
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Sử dụng API check-status để kiểm tra trạng thái giao dịch
        const res = await api.get(`/payos/check-status?reference=${reference}`);
        console.log("Kết quả kiểm tra trạng thái:", res.data);

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

    // Hàm lấy thông tin chi tiết giao dịch
    const getTransactionDetails = async () => {
      try {
        setIsLoadingDetails(true);
        // Sử dụng API check-payment để lấy thông tin chi tiết về giao dịch
        const res = await api.get(
          `/payos/check-payment?reference=${reference}&from_success=true`
        );
        console.log("Thông tin chi tiết giao dịch:", res.data);

        if (res.data?.success && res.data?.transaction) {
          setTransaction(res.data.transaction);
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin chi tiết giao dịch:", err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    if (reference) checkStatus();
  }, [reference]);

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm định dạng thời gian
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

  if (status === "checking") {
    return (
      <div className="p-8 text-center text-blue-600 font-semibold min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p>Đang xác minh giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {status === "success" ? (
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-20 h-20 mx-auto flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-green-500"
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
              Giao dịch nạp tiền thành công!
            </h2>

            {isLoadingDetails ? (
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : transaction ? (
              <div className="mt-6 bg-gray-50 p-4 rounded text-left">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600 font-medium">
                      Mã tham chiếu:
                    </div>
                    <div>{transaction.reference || "N/A"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600 font-medium">Số tiền:</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>

                  {transaction.transactionCode && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600 font-medium">
                        Mã giao dịch:
                      </div>
                      <div>{transaction.transactionCode}</div>
                    </div>
                  )}

                  {transaction.description && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600 font-medium">Nội dung:</div>
                      <div>{transaction.description}</div>
                    </div>
                  )}

                  {transaction.transferTime && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600 font-medium">
                        Thời gian thanh toán:
                      </div>
                      <div>{formatDate(transaction.transferTime)}</div>
                    </div>
                  )}

                  {transaction.bankReference && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600 font-medium">
                        Mã ngân hàng:
                      </div>
                      <div>{transaction.bankReference}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600 font-medium">Ngày tạo:</div>
                    <div>{formatDate(transaction.createdAt)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-gray-600">
                Không thể tải thông tin chi tiết giao dịch.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-20 h-20 mx-auto flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-500"
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
              Giao dịch thất bại hoặc chưa xác nhận!
            </h2>
            {isLoadingDetails ? (
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : transaction ? (
              <div className="mt-6 bg-gray-50 p-4 rounded text-left">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600 font-medium">
                      Mã tham chiếu:
                    </div>
                    <div>{transaction.reference || "N/A"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600 font-medium">Trạng thái:</div>
                    <div className="font-semibold text-red-600">
                      {transaction.status}
                    </div>
                  </div>

                  {transaction.amount && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600 font-medium">Số tiền:</div>
                      <div>{formatCurrency(transaction.amount)}</div>
                    </div>
                  )}

                  {transaction.createdAt && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600 font-medium">Ngày tạo:</div>
                      <div>{formatDate(transaction.createdAt)}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            <p className="mt-4 text-gray-600">
              Vui lòng kiểm tra lại hoặc liên hệ với bộ phận hỗ trợ nếu bạn đã
              thanh toán thành công.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push("/user/deposit")}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Quay lại trang nạp tiền
          </button>
          {status === "failed" && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Kiểm tra lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
