"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductList from "@/components/products/product-list";
import { useLatestAccounts } from "@/hooks/useLatestAccounts";
import { useFeaturedAccounts } from "@/hooks/useFeaturedAccounts";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Skeleton } from "@/components/ui/skeleton";
import ApiDebugPanel from "@/components/debug/ApiDebugPanel";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Sử dụng hooks để lấy dữ liệu từ API
  const {
    accounts: latestAccounts,
    isLoading: isLatestLoading,
    error: latestError,
  } = useLatestAccounts(4);
  const {
    accounts: featuredAccounts,
    isLoading: isFeaturedLoading,
    error: featuredError,
  } = useFeaturedAccounts(4);

  // Hiển thị debugging panel khi nhấn Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setShowDebug(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Đảm bảo ScrollTrigger được đăng ký
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Cleanup function cho các GSAP animations
    const cleanup = () => {
      const triggers = ScrollTrigger.getAll();
      triggers.forEach((trigger) => trigger.kill(false));

      // Clear các timeline nếu cần
      gsap.killTweensOf("#hero-title");
      gsap.killTweensOf("#hero-description");
      gsap.killTweensOf("#hero-buttons");
      gsap.killTweensOf(".feature-card");
    };

    // Đảm bảo elements tồn tại trước khi thử animation
    const heroTitle = document.getElementById("hero-title");
    const heroDescription = document.getElementById("hero-description");
    const heroButtons = document.getElementById("hero-buttons");

    if (heroRef.current && heroTitle && heroDescription && heroButtons) {
      // Hero animations
      const heroTimeline = gsap.timeline();

      heroTimeline
        .fromTo(
          "#hero-title",
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        )
        .fromTo(
          "#hero-description",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.7"
        )
        .fromTo(
          "#hero-buttons",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.5"
        );
    }
    // Cleanup khi component unmount
    return cleanup;
  }, []); // Chỉ chạy một lần khi component mount

  // Hiển thị thông báo nếu không có dữ liệu
  const renderNoDataMessage = (section: string) => (
    <div className="text-center py-10">
      <p className="text-muted-foreground">
        Không có tài khoản {section} nào hiện tại
      </p>
      {section === "mới nhất" && latestError && (
        <p className="text-destructive text-sm mt-2">Lỗi: {latestError}</p>
      )}
      {section === "nổi bật" && featuredError && (
        <p className="text-destructive text-sm mt-2">Lỗi: {featuredError}</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {showDebug && <ApiDebugPanel />}

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-[92vh] mt-[8vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/50">
          <video
            src="/ahri.mp4"
            autoPlay
            muted
            loop
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="container mx-auto px-4 text-center z-10">
          <h1
            id="hero-title"
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white"
          >
            Tài Khoản Liên Minh Huyền Thoại{" "}
            <span className="text-primary">Chất Lượng Cao</span>
          </h1>
          <p
            id="hero-description"
            className="text-xl text-gray-200 mb-6 max-w-3xl mx-auto"
          >
            Mua bán tài khoản LOL uy tín, an toàn và giá tốt nhất thị trường
          </p>
          <div
            id="hero-buttons"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" asChild>
              <Link href="/products">
                Xem tài khoản
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <Link href="/contact">Liên hệ tư vấn</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 text-black dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi cung cấp dịch vụ mua bán tài khoản Liên Minh Huyền Thoại
              uy tín, chất lượng với nhiều ưu điểm vượt trội.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="feature-card border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bảo hành 100%</h3>
                <p className="text-muted-foreground">
                  Tất cả tài khoản đều được bảo hành 30 ngày, đảm bảo quyền lợi
                  tối đa cho khách hàng.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Giao dịch nhanh chóng
                </h3>
                <p className="text-muted-foreground">
                  Quy trình mua bán đơn giản, giao tài khoản ngay sau khi thanh
                  toán thành công.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tài khoản chất lượng</h3>
                <p className="text-muted-foreground">
                  Tài khoản đa dạng từ Bạch Kim đến Thách Đấu, nhiều trang phục
                  hiếm và giá trị.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Latest Products Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tài khoản mới nhất
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cập nhật những tài khoản mới nhất với giá tốt nhất thị trường.
            </p>
          </div>

          {isLatestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : latestAccounts.length > 0 ? (
            <ProductList products={latestAccounts} />
          ) : (
            renderNoDataMessage("mới nhất")
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bạn cần tư vấn thêm?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7. Liên hệ
            ngay để được tư vấn chi tiết.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">Liên hệ ngay</Link>
          </Button>
        </div>
      </section>

      {/* Debug button */}
      <div className="fixed bottom-4 left-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          className="bg-background/80 backdrop-blur-sm opacity-50 hover:opacity-100"
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? "Tắt Debug" : "Debug API"}
        </Button>
      </div>
    </div>
  );
}
