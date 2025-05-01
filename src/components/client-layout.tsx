"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ModeToggle from "@/components/mode-toggle";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sử dụng usePathname để kiểm tra đường dẫn hiện tại
  const pathname = usePathname();
  // Kiểm tra xem đường dẫn hiện tại có phải là trang admin không
  const isAdminPage = pathname && pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdminPage && <Footer />}
      <div className="fixed bottom-4 right-4">
        <ModeToggle />
      </div>
    </>
  );
}
