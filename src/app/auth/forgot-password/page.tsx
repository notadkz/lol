"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Gọi API reset mật khẩu
      // Đây là nơi để thêm logic reset mật khẩu
      console.log("Reset mật khẩu cho email:", email);

      // Giả lập gửi email thành công
      setTimeout(() => {
        setIsSubmitted(true);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md" id="forgot-password-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Quên mật khẩu
          </CardTitle>
          <CardDescription className="text-center">
            {isSubmitted
              ? "Vui lòng kiểm tra email của bạn để lấy lại mật khẩu"
              : "Nhập email của bạn để nhận liên kết đặt lại mật khẩu"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                id="reset-password-button"
              >
                {isLoading ? "Đang xử lý..." : "Gửi liên kết đặt lại"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                <p className="text-center">
                  Chúng tôi đã gửi email với hướng dẫn đặt lại mật khẩu đến{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Gửi lại email
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            <Link href="/auth/login" className="text-sm hover:underline">
              Quay lại trang đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
