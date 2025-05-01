"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Product } from "@/lib/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden border border-border/50 bg-card/50 hover:scale-105 backdrop-blur-sm transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder.svg?height=200&width=300"}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.featured && (
          <Badge className="absolute top-2 right-2 bg-primary">Nổi bật</Badge>
        )}
        {product.status === "sold" && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Đã bán
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-lg truncate">
            Tài khoản #{product.id}
          </h3>
          <p className="text-muted-foreground text-sm">Rank: {product.rank}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Cấp độ:</span>
            <span className="font-medium">{product.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Trang phục:</span>
            <span className="font-medium">{product.skins}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tinh hoa lam:</span>
            <span className="font-medium">{product.blueEssence}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tinh hoa cam:</span>
            <span className="font-medium">{product.orangeEssence}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">RP:</span>
            <span className="font-medium">{product.rp}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Linh thú TFT:</span>
            <span className="font-medium">{product.tftPets}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="w-full flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <Badge
            variant={product.status === "available" ? "outline" : "secondary"}
          >
            {product.status === "available" ? "Còn hàng" : "Hết hàng"}
          </Badge>
        </div>
        <div className="w-full flex gap-2">
          <Button
            className="w-full buy-button"
            disabled={product.status !== "available"}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Mua ngay
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/products/${product.id}`}>Chi tiết</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
