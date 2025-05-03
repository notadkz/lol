"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GameAccount } from "@prisma/client";

interface Props {
  account: GameAccount;
}

export default function PurchasedAccountDetail({ account }: Props) {
  const images = (() => {
    try {
      return JSON.parse(account.imageUrls || "[]") as string[];
    } catch {
      return [];
    }
  })();

  return (
    <Card className="mb-6">
      <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="relative h-[300px] w-full overflow-hidden rounded-md border">
            <Image
              src={images[0] || "/placeholder.svg"}
              alt={account.username}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative w-16 h-16 border rounded-md overflow-hidden"
              >
                <Image
                  src={img}
                  alt={`image-${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <strong>Tên đăng nhập:</strong> {account.username}
          </div>
          <div>
            <strong>Mật khẩu:</strong> {account.password}
          </div>
          {account.email && (
            <div>
              <strong>Email:</strong> {account.email} <br />
              <strong>Mật khẩu email:</strong> {account.emailPassword}
            </div>
          )}
          <div>
            <strong>Rank Đơn/đôi:</strong> {account.soloRank} <br />
            <strong>Rank Linh hoạt:</strong> {account.flexRank} <br />
            <strong>Rank TFT:</strong> {account.tftRank}
          </div>
          <div>
            <strong>Level:</strong> {account.level}
          </div>
          <div>
            <strong>Trang phục:</strong> {account.skinCount} |{" "}
            <strong>Tướng:</strong> {account.championCount} |{" "}
            <strong>Đa sắc:</strong> {account.chromaCount}
          </div>
          <div>
            <strong>BE:</strong> {account.blueEssence} | <strong>RP:</strong>{" "}
            {account.riotPoints}
          </div>
          <div>
            <strong>Giá bán:</strong> {account.price.toLocaleString()} đ
          </div>
          <div>
            <strong>Trạng thái:</strong>{" "}
            <Badge variant="outline">{account.status}</Badge>
          </div>
          {account.description && (
            <div>
              <strong>Mô tả:</strong>
              <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                {account.description}
              </p>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Ngày mua: {new Date(account.createdAt).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
