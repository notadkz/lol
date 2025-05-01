"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Eye, EyeOff, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
    token: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Kiểm tra xem có token không
    if (!token) {
      setErrors((prev) => ({
        ...prev,
        token:
          "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.",
      }));
    }
  }, [token]);

  const togglePasswordVisibility = (
    field: "newPassword" | "confirmPassword"
  ) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Kiểm tra mật khẩu mới
    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      valid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
      valid = false;
    }

    // Kiểm tra xác nhận mật khẩu
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
      valid = false;
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Token không hợp lệ hoặc đã hết hạn") {
          setErrors((prev) => ({
            ...prev,
            token:
              "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.",
          }));
        } else {
          toast.error(data.error || "Đã xảy ra lỗi khi đặt lại mật khẩu");
        }
        return;
      }

      setIsSuccess(true);
      toast.success("Mật khẩu đã được đặt lại thành công!");

      // Tự động chuyển hướng sau 3 giây
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi kết nối với máy chủ");
      console.error("Lỗi đặt lại mật khẩu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md" id="reset-password-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="text-center">
            {isSuccess
              ? "Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập sau vài giây."
              : "Tạo mật khẩu mới cho tài khoản của bạn"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.token ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p>{errors.token}</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-red-700 dark:text-red-300 underline mt-2"
                  onClick={handleBackToForgotPassword}
                >
                  Quay lại trang quên mật khẩu
                </Button>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 flex items-center gap-3">
              <Check className="h-5 w-5 flex-shrink-0" />
              <p>
                Mật khẩu của bạn đã được đặt lại thành công. Đang chuyển hướng
                đến trang đăng nhập...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.newPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={errors.newPassword ? "border-red-500" : ""}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword ? (
                  <p className="text-sm text-red-500">{errors.newPassword}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Mật khẩu phải có ít nhất 8 ký tự
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    placeholder="Xác nhận mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                id="reset-password-submit-button"
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          {!errors.token && !isSuccess && (
            <div className="flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              <Link href="/auth/login" className="text-sm hover:underline">
                Quay lại trang đăng nhập
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
