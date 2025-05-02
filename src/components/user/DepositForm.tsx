"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
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
  const [amount, setAmount] = useState<number>(5000);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<boolean>(false);
  const paymentContainerRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Check session
  useEffect(() => {
    if (status === "loading") {
      const timeout = setTimeout(() => {
        router.refresh();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

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

  const { open: openPayOS } = usePayOS(payOSConfig);

  // Polling to check transaction status
  useEffect(() => {
    if (!paymentData?.reference) return;

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

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentData?.reference, router]);

  // Form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated" || !session?.user?.email) {
      setError("Bạn cần đăng nhập");
      return;
    }
    if (amount < 5000) {
      setError("Số tiền tối thiểu là 5,000 VNĐ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payos/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Lỗi tạo thanh toán");
      }

      setPaymentData(data);
      setSessionError(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!paymentData?.paymentUrl) {
      setError("Không có link thanh toán");
      return;
    }

    try {
      openPayOS();
    } catch {
      window.open(paymentData.paymentUrl, "_blank");
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN").format(v);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, ""), 10);
    setAmount(isNaN(value) ? 0 : value);
  };

  const renderQRCode = () => {
    if (!paymentData?.qrCode) return null;

    const isBase64 = (str: string) => {
      try {
        return btoa(atob(str)) === str;
      } catch {
        return false;
      }
    };

    const src = isBase64(paymentData.qrCode)
      ? `data:image/png;base64,${paymentData.qrCode}`
      : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          paymentData.qrCode
        )}`;

    return (
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 rounded-lg p-4 inline-block">
          <div className="w-48 h-48 bg-white p-2 mx-auto">
            <Image
              src={src}
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

  if (status === "unauthenticated") {
    return <p>Bạn cần đăng nhập để nạp tiền.</p>;
  }

  if (status === "loading") {
    return <p>Đang tải...</p>;
  }

  return (
    <div>
      <div
        id="payment-container"
        ref={paymentContainerRef}
        style={{ display: "none" }}
      ></div>

      {!paymentData ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={formatCurrency(amount)}
            onChange={handleAmountChange}
            className="w-full border rounded px-4 py-2"
            placeholder="Số tiền nạp (VNĐ)"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-4 py-2"
            placeholder="Ghi chú"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Tạo mã thanh toán"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {renderQRCode()}
          <div className="text-center space-y-2">
            <button
              onClick={handlePayment}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Thanh toán PayOS
            </button>
            <button
              onClick={() =>
                window.open(paymentData.paymentUrl || "", "_blank")
              }
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded w-full"
            >
              Mở link thanh toán
            </button>
            <button
              onClick={() => setPaymentData(null)}
              className="bg-gray-300 text-black px-4 py-2 rounded w-full"
            >
              Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
