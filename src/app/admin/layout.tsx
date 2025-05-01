"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Home,
  Bell,
  DollarSign,
  Tag,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu người dùng không phải là admin thì chuyển hướng
    if (status === "authenticated" && session?.user?.isAdmin === false) {
      router.push("/");
    }

    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const menuItems = [
    { title: "Dashboard", icon: <Home className="w-5 h-5" />, href: "/admin" },
    {
      title: "Quản lý tài khoản",
      icon: <Users className="w-5 h-5" />,
      href: "/admin/accounts",
    },
    {
      title: "Quản lý sản phẩm",
      icon: <Package className="w-5 h-5" />,
      href: "/admin/products",
    },
    {
      title: "Quản lý đơn hàng",
      icon: <ShoppingCart className="w-5 h-5" />,
      href: "/admin/orders",
    },
    {
      title: "Quản lý giao dịch",
      icon: <DollarSign className="w-5 h-5" />,
      href: "/admin/transactions",
    },
    {
      title: "Quản lý khuyến mãi",
      icon: <Tag className="w-5 h-5" />,
      href: "/admin/promotions",
    },
    {
      title: "Báo cáo thống kê",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/admin/statistics",
    },
    {
      title: "Hỗ trợ khách hàng",
      icon: <MessageSquare className="w-5 h-5" />,
      href: "/admin/support",
    },
    {
      title: "Bảo mật hệ thống",
      icon: <ShieldAlert className="w-5 h-5" />,
      href: "/admin/security",
    },
    {
      title: "Cài đặt hệ thống",
      icon: <Settings className="w-5 h-5" />,
      href: "/admin/settings",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-white p-2 rounded-md"
        aria-label="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar for desktop */}
      <div
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-primary-dark">
            <h2 className="text-xl font-bold">LOL Marketplace Admin</h2>
          </div>
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors group"
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="px-4 py-4 border-t border-primary-dark">
            <button
              onClick={() => router.push("/api/auth/signout")}
              className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center">
            <button className="relative p-2 mr-4 text-gray-600 hover:text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                {session?.user?.name
                  ? session.user.name.charAt(0).toUpperCase()
                  : "A"}
              </div>
              <span className="font-medium text-gray-800">
                {session?.user?.name || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 pb-40 overflow-auto">
          <div className="admin-content-wrapper">{children}</div>
        </main>

        {/* Admin-specific footer styles to prevent overlap */}
        <style jsx global>{`
          /* Hide the default footer in admin layout */
          .admin-content-wrapper + footer {
            display: none;
          }

          /* Ensure admin content has proper spacing */
          #admin-sidebar + div {
            position: relative;
            min-height: 100vh;
          }
        `}</style>
      </div>
    </div>
  );
}
