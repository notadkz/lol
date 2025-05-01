"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DepositForm from "@/components/user/DepositForm";

export default function DepositPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/user/deposit");
    }

    // Giả lập việc lấy số dư từ API (trong thực tế sẽ gọi API)
    if (status === "authenticated" && session?.user) {
      // Tạm thời giả lập việc lấy balance
      // Trong thực tế sẽ gọi API endpoint để lấy thông tin người dùng
      setBalance(250000); // Giả sử số dư = 250,000 VND
      setLoading(false);
    }
  }, [status, session, router]);

  // Định dạng số tiền với dấu phẩy ngăn cách hàng nghìn
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN").format(value);
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
        <h1 className="text-2xl font-bold mb-2 md:mb-0">
          Nạp tiền vào tài khoản
        </h1>
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

      {/* Thông tin số dư */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg text-gray-600 mb-1">Số dư hiện tại</h2>
            <p className="text-3xl font-bold text-blue-600">
              {balance !== null
                ? `${formatCurrency(balance)} VNĐ`
                : "Đang tải..."}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/payment/history"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>Xem lịch sử giao dịch</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tạo mã QR thanh toán</h2>
            <DepositForm />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Mẫu nạp tiền nhanh</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[100000, 200000, 500000, 1000000, 2000000, 5000000].map(
                (amount) => (
                  <Link
                    key={amount}
                    href={`/user/deposit?amount=${amount}`}
                    className="py-3 px-4 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    {formatCurrency(amount)} VNĐ
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Hướng dẫn</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Nhập số tiền bạn muốn nạp vào tài khoản.</li>
              <li>Nhấn nút "Tạo mã thanh toán".</li>
              <li>Quét mã QR bằng ứng dụng ngân hàng của bạn.</li>
              <li>Hoàn tất thanh toán trên ứng dụng ngân hàng.</li>
              <li>
                Số dư tài khoản của bạn sẽ được cập nhật sau khi thanh toán được
                xác nhận.
              </li>
            </ol>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lưu ý</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Số tiền nạp tối thiểu là 50,000 VNĐ.</li>
              <li>
                Thời gian xử lý giao dịch có thể mất từ vài phút đến vài giờ tùy
                thuộc vào ngân hàng của bạn.
              </li>
              <li>
                Vui lòng không thay đổi nội dung chuyển khoản để hệ thống có thể
                xác nhận giao dịch của bạn.
              </li>
              <li>
                Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hỗ trợ.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Ngân hàng hỗ trợ</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                "Vietcombank",
                "Techcombank",
                "BIDV",
                "VPBank",
                "Agribank",
                "TPBank",
                "MBBank",
                "ACB",
                "VIB",
              ].map((bank) => (
                <div
                  key={bank}
                  className="text-center p-2 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <span className="text-xs font-medium">{bank}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-3">
              Và hơn 40 ngân hàng khác
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
