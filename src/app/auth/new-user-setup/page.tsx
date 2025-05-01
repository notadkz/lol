"use client";

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
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function NewUserSetupPage() {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username.length < 3) {
      toast.error("Tên người dùng phải có ít nhất 3 ký tự");
      return;
    }

    setIsLoading(true);

    try {
      // Trong thực tế, bạn sẽ gọi API để cập nhật thông tin người dùng
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Thiết lập tài khoản thành công!");
      router.push("/");
    } catch (error) {
      console.error("Lỗi khi thiết lập tài khoản:", error);
      toast.error("Đã xảy ra lỗi khi thiết lập tài khoản");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md" id="new-user-setup-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Hoàn tất thiết lập tài khoản
          </CardTitle>
          <CardDescription className="text-center">
            Cung cấp thêm thông tin để hoàn tất quá trình đăng ký của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.user?.email && (
            <div className="p-4 rounded-md bg-muted">
              <p className="text-sm">
                Đã đăng nhập với: <strong>{session.user.email}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên người dùng</Label>
              <Input
                id="username"
                type="text"
                placeholder="tên_người_dùng"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Tên hiển thị của bạn trên nền tảng
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại (tùy chọn)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="0123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Để bảo mật tài khoản và nhận thông báo
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              id="setup-button"
            >
              {isLoading ? "Đang xử lý..." : "Hoàn tất thiết lập"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-center">
          <p className="text-xs text-muted-foreground">
            Bằng cách hoàn thành quá trình thiết lập, bạn đồng ý với các{" "}
            <a href="/terms" className="underline">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="/privacy" className="underline">
              Chính sách bảo mật
            </a>{" "}
            của chúng tôi.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
