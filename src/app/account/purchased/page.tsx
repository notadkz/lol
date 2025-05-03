"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PurchasedAccountDetail from "./PurchasedAccountDetail";
import type { GameAccount } from "@prisma/client";

export default function PurchasedAccountsPage() {
  const { session, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<GameAccount[] | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/purchased");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Lỗi không xác định");

        setAccounts(data.data);
      } catch (err) {
        console.error("Lỗi tải tài khoản đã mua:", err);
      } finally {
        setLoadingAccounts(false);
      }
    };

    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated]);

  if (isLoading || loadingAccounts) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/account">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Tài khoản đã mua</h1>
      </div>

      {accounts && accounts.length > 0 ? (
        accounts.map((account) => (
          <PurchasedAccountDetail key={account.id} account={account} />
        ))
      ) : (
        <div className="text-center text-gray-500 py-10">
          Bạn chưa mua tài khoản nào.
        </div>
      )}
    </div>
  );
}
