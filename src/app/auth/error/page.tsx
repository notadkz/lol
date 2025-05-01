"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams?.get("error");

    // Hiển thị thông báo lỗi phù hợp dựa trên mã lỗi
    if (errorParam) {
      switch (errorParam) {
        case "Configuration":
          setError("Đã xảy ra lỗi cấu hình hệ thống.");
          break;
        case "AccessDenied":
          setError("Bạn không có quyền truy cập vào trang này.");
          break;
        case "Verification":
          setError("Liên kết xác minh đã hết hạn hoặc đã được sử dụng.");
          break;
        case "OAuthSignin":
          setError("Lỗi khi bắt đầu xác thực OAuth.");
          break;
        case "OAuthCallback":
          setError("Lỗi khi xử lý xác thực OAuth.");
          break;
        case "OAuthCreateAccount":
          setError("Không thể tạo tài khoản OAuth.");
          break;
        case "EmailCreateAccount":
          setError("Không thể tạo tài khoản email.");
          break;
        case "Callback":
          setError("Lỗi xảy ra trong quá trình callback.");
          break;
        case "OAuthAccountNotLinked":
          setError("Email đã được sử dụng với một tài khoản khác.");
          break;
        case "default":
        default:
          setError("Đã xảy ra lỗi không xác định trong quá trình xác thực.");
          break;
      }
    } else {
      setError("Đã xảy ra lỗi không xác định trong quá trình xác thực.");
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md" id="error-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-red-500">
            Lỗi xác thực
          </CardTitle>
          <CardDescription className="text-center">
            Đã xảy ra lỗi trong quá trình xác thực
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-900">
            <p className="text-center text-red-700 dark:text-red-400">
              {error}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Quay lại trang đăng nhập</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
