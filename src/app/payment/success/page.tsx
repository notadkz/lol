"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/services/api";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get("reference");
  const [status, setStatus] = useState<"checking" | "success" | "failed">(
    "checking"
  );

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get(`/payos/check-status?reference=${reference}`);
        if (res.data?.status === "SUCCESS") {
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

  if (status === "checking") {
    return (
      <div className="p-8 text-center text-blue-600 font-semibold">
        Đang xác minh giao dịch...
      </div>
    );
  }

  return (
    <div className="p-8 text-center mt-60">
      {status === "success" ? (
        <div className="text-green-600 text-xl font-bold">
          🎉 Giao dịch nạp tiền thành công!
        </div>
      ) : (
        <div className="text-red-600 text-xl font-bold">
          ❌ Giao dịch thất bại hoặc chưa xác nhận!
        </div>
      )}

      <button
        onClick={() => router.push("/user/deposit")}
        className="mt-6 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Quay lại trang nạp tiền
      </button>
    </div>
  );
}
