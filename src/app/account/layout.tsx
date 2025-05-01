"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  User,
  Pencil,
  KeyRound,
  History,
  ShoppingBag,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/account",
  },
  {
    title: "Hồ sơ",
    icon: <User className="w-5 h-5" />,
    href: "/account/profile",
  },
  {
    title: "Chỉnh sửa hồ sơ",
    icon: <Pencil className="w-5 h-5" />,
    href: "/account/edit-profile",
  },
  {
    title: "Đổi mật khẩu",
    icon: <KeyRound className="w-5 h-5" />,
    href: "/account/change-password",
  },
  {
    title: "Lịch sử nạp tiền",
    icon: <History className="w-5 h-5" />,
    href: "/account/topup-history",
  },
  {
    title: "Tài khoản đã mua",
    icon: <ShoppingBag className="w-5 h-5" />,
    href: "/account/purchased",
  },
  {
    title: "Yêu cầu hỗ trợ",
    icon: <LifeBuoy className="w-5 h-5" />,
    href: "/account/support",
  },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Đóng menu mobile khi đường dẫn thay đổi
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen pt-[8vh]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Quản lý tài khoản</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Sidebar */}
          <div
            className={cn(
              "md:w-64 flex-shrink-0",
              isMobileMenuOpen ? "block" : "hidden md:block"
            )}
          >
            <div className="rounded-lg shadow-lg p-4">
              <div className="hidden md:block mb-6">
                <h2 className="text-xl font-bold">Quản lý tài khoản</h2>
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : " hover:bg-gray-100 hover:text-black"
                    )}
                    id={`sidebar-${item.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                ))}
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-md transition-colors text-red-600 hover:bg-red-50"
                  id="sidebar-logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="rounded-lg shadow-sm p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
