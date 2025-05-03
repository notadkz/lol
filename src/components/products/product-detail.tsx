"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/lib/types/product";
import { gsap } from "gsap";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    // GSAP animations for page elements
    const timeline = gsap.timeline();

    if (imageRef.current && contentRef.current && buttonRef.current) {
      timeline
        .fromTo(
          imageRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        )
        .fromTo(
          contentRef.current,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        )
        .fromTo(
          buttonRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
          "-=0.4"
        );

      // Button hover animation
      buttonRef.current.addEventListener("mouseenter", () => {
        gsap.to(buttonRef.current, {
          scale: 1.05,
          backgroundColor: "var(--accent)",
          duration: 0.2,
        });
      });

      buttonRef.current.addEventListener("mouseleave", () => {
        gsap.to(buttonRef.current, {
          scale: 1,
          backgroundColor: "var(--primary)",
          duration: 0.2,
        });
      });
    }
  }, []);

  const handleBuyNow = async () => {
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: product.id }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Mua hàng thất bại");
        return;
      }

      toast.success("Mua hàng thành công!");

      // Redirect đến trang đơn hàng, tài khoản đã mua, hoặc profile
      router.push("/account/purchased"); // hoặc /orders hoặc /profile
    } catch (err) {
      console.error("Lỗi mua hàng:", err);
      toast.error("Đã xảy ra lỗi khi xử lý đơn hàng");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div ref={imageRef} className="space-y-4">
        <div className="relative h-[400px] rounded-lg overflow-hidden border border-border">
          <Image
            src={product.images[0] || "/placeholder.svg?height=400&width=600"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.status === "sold" && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-6 py-3">
                Đã bán
              </Badge>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {product.images.map((image, index) => (
            <div
              key={index}
              className="relative w-20 h-20 rounded-md overflow-hidden border border-border cursor-pointer hover:border-primary"
            >
              <Image
                src={image || "/placeholder.svg?height=80&width=80"}
                alt={`${product.name} - Ảnh ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div ref={contentRef} className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <Badge
              variant={product.status === "available" ? "outline" : "secondary"}
              className="text-sm"
            >
              {product.status === "available" ? "Còn hàng" : "Hết hàng"}
            </Badge>
          </div>
          <p className="text-xl font-bold text-primary mt-2">
            {formatPrice(product.price)}
          </p>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="description" className="flex-1">
              Mô tả
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rank:</span>
                      <span className="font-medium">{product.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cấp độ:</span>
                      <span className="font-medium">{product.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trang phục:</span>
                      <span className="font-medium">{product.skins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tướng:</span>
                      <span className="font-medium">{product.champions}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tinh hoa lam:
                      </span>
                      <span className="font-medium">{product.blueEssence}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tinh hoa cam:
                      </span>
                      <span className="font-medium">
                        {product.orangeEssence}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RP:</span>
                      <span className="font-medium">{product.rp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Linh thú TFT:
                      </span>
                      <span className="font-medium">{product.tftPets}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="description" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="pt-4">
          <Button
            size="lg"
            className="w-full text-lg py-6 buy-button"
            disabled={product.status !== "available"}
            onClick={handleBuyNow}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Mua ngay
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <h3 className="font-medium mb-2">Chính sách bảo hành:</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Bảo hành tài khoản 100% trong 30 ngày</li>
            <li>Hỗ trợ thay đổi thông tin email, mật khẩu</li>
            <li>Cam kết tài khoản đúng như mô tả</li>
            <li>Hoàn tiền 100% nếu tài khoản không đúng như mô tả</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
