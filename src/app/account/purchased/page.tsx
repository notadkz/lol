"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PurchasedAccountsPage() {
  const { session, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div
      className="max-w-4xl mx-auto mt-[10vh] p-6 bg-white rounded-lg shadow"
      id="purchased-accounts-section"
    >
      <div className="flex items-center gap-4 mb-6">
        <Link href="/account">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold" id="purchased-accounts-title">
          Tài khoản đã mua
        </h1>
      </div>

      {/* Phần hiển thị dữ liệu sẽ được bổ sung sau */}
      <div className="text-center text-gray-500 py-10">
        Bạn chưa mua tài khoản nào.
      </div>
    </div>
  );
}
