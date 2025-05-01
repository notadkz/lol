"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho transaction
type Transaction = {
  id: string;
  type: "TOPUP" | "PURCHASE" | "REFUND" | "WITHDRAWAL";
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  reference?: string;
  description: string;
  createdAt: string;
};

export default function TransactionHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "TOPUP" | "PURCHASE" | "REFUND" | "WITHDRAWAL"
  >("ALL");

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/payment/history");
      return;
    }

    // Giả lập việc lấy dữ liệu lịch sử giao dịch từ API
    if (status === "authenticated" && session?.user) {
      // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
      // Ví dụ: fetch('/api/transactions').then(...)

      // Dữ liệu giả lập cho việc demo
      setTimeout(() => {
        const mockTransactions: Transaction[] = [
          {
            id: "1",
            type: "TOPUP",
            amount: 500000,
            status: "SUCCESS",
            reference: "PAY123456",
            description: "Nạp tiền qua PayOS",
            createdAt: "2023-07-01T10:30:00Z",
          },
          {
            id: "2",
            type: "PURCHASE",
            amount: -250000,
            status: "SUCCESS",
            reference: "ORD987654",
            description: "Mua tài khoản game #254",
            createdAt: "2023-07-02T14:15:00Z",
          },
          {
            id: "3",
            type: "REFUND",
            amount: 250000,
            status: "SUCCESS",
            reference: "REF123789",
            description: "Hoàn tiền cho đơn hàng #987",
            createdAt: "2023-07-03T16:45:00Z",
          },
          {
            id: "4",
            type: "WITHDRAWAL",
            amount: -300000,
            status: "PENDING",
            reference: "WDR456123",
            description: "Yêu cầu rút tiền về Vietcombank",
            createdAt: "2023-07-04T09:20:00Z",
          },
          {
            id: "5",
            type: "TOPUP",
            amount: 1000000,
            status: "SUCCESS",
            reference: "PAY789012",
            description: "Nạp tiền qua PayOS",
            createdAt: "2023-07-05T11:10:00Z",
          },
          {
            id: "6",
            type: "PURCHASE",
            amount: -450000,
            status: "FAILED",
            reference: "ORD345678",
            description: "Mua tài khoản game #367 (Thất bại)",
            createdAt: "2023-07-06T13:25:00Z",
          },
        ];

        setTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    }
  }, [status, session, router]);

  // Định dạng số tiền với dấu phẩy ngăn cách hàng nghìn
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN").format(Math.abs(value));
  };

  // Định dạng ngày tháng
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Lọc giao dịch theo loại
  const filteredTransactions =
    filter === "ALL"
      ? transactions
      : transactions.filter((transaction) => transaction.type === filter);

  // Render trạng thái giao dịch
  const renderStatus = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Thành công
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Đang xử lý
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Thất bại
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 md:mb-0">Lịch sử giao dịch</h1>
        <Link
          href="/payment"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Quay lại quản lý thanh toán</span>
        </Link>
      </div>

      {/* Bộ lọc */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("TOPUP")}
            className={`px-4 py-2 rounded-lg ${
              filter === "TOPUP"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Nạp tiền
          </button>
          <button
            onClick={() => setFilter("PURCHASE")}
            className={`px-4 py-2 rounded-lg ${
              filter === "PURCHASE"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mua hàng
          </button>
          <button
            onClick={() => setFilter("REFUND")}
            className={`px-4 py-2 rounded-lg ${
              filter === "REFUND"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Hoàn tiền
          </button>
          <button
            onClick={() => setFilter("WITHDRAWAL")}
            className={`px-4 py-2 rounded-lg ${
              filter === "WITHDRAWAL"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Rút tiền
          </button>
        </div>
      </div>

      {/* Dữ liệu giao dịch */}
      {filteredTransactions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thời gian
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Loại giao dịch
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mô tả
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số tiền
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.type === "TOPUP" && (
                        <span className="text-blue-600 font-medium">
                          Nạp tiền
                        </span>
                      )}
                      {transaction.type === "PURCHASE" && (
                        <span className="text-purple-600 font-medium">
                          Mua hàng
                        </span>
                      )}
                      {transaction.type === "REFUND" && (
                        <span className="text-green-600 font-medium">
                          Hoàn tiền
                        </span>
                      )}
                      {transaction.type === "WITHDRAWAL" && (
                        <span className="text-orange-600 font-medium">
                          Rút tiền
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{transaction.description}</div>
                      {transaction.reference && (
                        <div className="text-xs text-gray-500">
                          Mã tham chiếu: {transaction.reference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        className={
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {transaction.amount > 0 ? "+" : "-"}
                        {formatCurrency(transaction.amount)} VNĐ
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderStatus(transaction.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy giao dịch nào.</p>
          {filter !== "ALL" && (
            <button
              onClick={() => setFilter("ALL")}
              className="text-blue-600 hover:text-blue-800"
            >
              Xem tất cả giao dịch
            </button>
          )}
        </div>
      )}
    </div>
  );
}
