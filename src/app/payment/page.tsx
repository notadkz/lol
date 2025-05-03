"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/payment");
      return;
    }

    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/users"); // endpoint trả về balance
        const data = await res.json();
        if (res.ok && data?.balance !== undefined) {
          setBalance(Number(data.balance));
        } else {
          console.error("Lỗi lấy số dư:", data);
        }
      } catch (err) {
        console.error("Lỗi gọi API:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchBalance();
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
      <h1 className="text-3xl font-bold mb-8">Quản lý thanh toán</h1>

      {/* Thông tin số dư */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:justify-between">
          <div>
            <h2 className="text-lg text-gray-600 mb-2">Số dư tài khoản</h2>
            <p className="text-4xl font-bold text-blue-600">
              {balance !== null
                ? `${formatCurrency(balance)} VNĐ`
                : "Đang tải..."}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link
              href="/user/deposit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
              Nạp tiền
            </Link>
            <Link
              href="/payment/history"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Lịch sử giao dịch
            </Link>
          </div>
        </div>
      </div>

      {/* Phương thức nạp tiền */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Phương thức nạp tiền</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chuyển khoản ngân hàng */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-50 p-4 border-b">
              <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
                Chuyển khoản ngân hàng
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Nạp tiền qua tài khoản ngân hàng của bạn bằng cách quét mã QR
                thanh toán PayOS.
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Giao dịch tức thì, nhanh chóng</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Hỗ trợ hơn 40 ngân hàng tại Việt Nam</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Không mất phí giao dịch</span>
                </li>
              </ul>
              <Link
                href="/user/deposit"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Nạp tiền qua chuyển khoản
              </Link>
            </div>
          </div>

          {/* Ví điện tử */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden opacity-75">
            <div className="bg-purple-50 p-4 border-b">
              <h3 className="text-lg font-semibold text-purple-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Ví điện tử
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Nạp tiền trực tiếp từ ví điện tử của bạn.
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Tích hợp với MoMo, ZaloPay, VNPay</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Xác thực nhanh chóng</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Phí giao dịch cạnh tranh</span>
                </li>
              </ul>
              <button
                disabled
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-400 cursor-not-allowed"
              >
                Sắp ra mắt
              </button>
            </div>
          </div>

          {/* Thẻ quốc tế */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden opacity-75">
            <div className="bg-green-50 p-4 border-b">
              <h3 className="text-lg font-semibold text-green-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Thẻ quốc tế
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Nạp tiền bằng thẻ tín dụng hoặc thẻ ghi nợ quốc tế.
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Hỗ trợ VISA, MasterCard, JCB</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Thanh toán an toàn, bảo mật</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Giao dịch nhanh chóng</span>
                </li>
              </ul>
              <button
                disabled
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-400 cursor-not-allowed"
              >
                Sắp ra mắt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs về nạp tiền */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Câu hỏi thường gặp</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Tôi cần nạp tối thiểu bao nhiêu tiền?
            </h3>
            <p className="text-gray-600">
              Số tiền nạp tối thiểu là 50,000 VNĐ. Không có giới hạn về số tiền
              nạp tối đa.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Khi nào số dư của tôi được cập nhật sau khi nạp tiền?
            </h3>
            <p className="text-gray-600">
              Đối với phương thức chuyển khoản qua PayOS, số dư của bạn sẽ được
              cập nhật tự động và ngay lập tức sau khi thanh toán được xác nhận.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Tôi có thể rút tiền từ tài khoản không?
            </h3>
            <p className="text-gray-600">
              Vui lòng liên hệ với bộ phận hỗ trợ khách hàng để được hướng dẫn
              về quy trình rút tiền từ tài khoản của bạn.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Mã QR thanh toán có thời hạn sử dụng không?
            </h3>
            <p className="text-gray-600">
              Mã QR thanh toán có hiệu lực trong vòng 24 giờ kể từ khi bạn tạo
              mã. Sau thời gian này, bạn cần tạo mã mới để thực hiện giao dịch.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Tôi gặp vấn đề khi nạp tiền, tôi nên làm gì?
            </h3>
            <p className="text-gray-600">
              Nếu bạn gặp bất kỳ vấn đề nào trong quá trình nạp tiền, vui lòng
              liên hệ với bộ phận hỗ trợ khách hàng qua email
              support@lolmarketplace.com hoặc qua hỗ trợ trực tuyến trên
              website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
