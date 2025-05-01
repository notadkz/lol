import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh toán bị hủy",
  description: "Thanh toán của bạn đã bị hủy",
};

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
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

          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Thanh toán bị hủy
          </h1>

          <p className="text-gray-600 text-center mb-6">
            Thanh toán của bạn đã bị hủy hoặc không hoàn thành. Không có giao
            dịch nào được thực hiện.
          </p>

          <div className="w-full bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm">
              Nếu bạn gặp vấn đề trong quá trình thanh toán hoặc có thắc mắc,
              vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link
              href="/user/deposit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
            >
              Thử lại
            </Link>
            <Link
              href="/"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
