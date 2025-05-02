"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import ModeToggle from "./mode-toggle";
import Header from "./layout/header";
import { usePathname } from "next/navigation";

export default function SmoothWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sử dụng usePathname để kiểm tra đường dẫn hiện tại
  const pathname = usePathname();
  // Kiểm tra xem đường dẫn hiện tại có phải là trang admin không
  const isAdminPage = pathname && pathname.startsWith("/admin");
  useGSAP(() => {
    gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

    const smoother = ScrollSmoother.create({
      wrapper: ".wrapper",
      content: ".content",
      smooth: 2,
    });
  }, []);

  return (
    <div className="wrapper" style={{ height: "100%" }}>
      {!isAdminPage && <Header />}
      <div className="content min-h-screen">{children}</div>
    </div>
  );
}
