"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { toast } from "sonner";

// Dữ liệu giả
const initialUserData = {
  name: "Nguyễn Văn A",
  username: "user123",
  email: "example@example.com",
  phone: "0912345678",
  address: "Hà Nội, Việt Nam",
  bio: "Người chơi LOL từ mùa 3. Thích chơi các tướng đường giữa và xạ thủ.",
};

export default function EditProfilePage() {
  const { session } = useAuth();
  const user = session?.user;

  // Sử dụng dữ liệu thật nếu có, nếu không dùng dữ liệu giả
  const defaultData = {
    ...initialUserData,
    name: user?.name || initialUserData.name,
    email: user?.email || initialUserData.email,
  };

  const [formData, setFormData] = useState(defaultData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mô phỏng gọi API để lưu thông tin
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Cập nhật thành công
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật thông tin.");
      console.error("Lỗi cập nhật:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="edit-profile-content">
      <div>
        <h1 className="text-2xl font-bold mb-2">Chỉnh sửa hồ sơ</h1>
        <p className="text-gray-500">Cập nhật thông tin cá nhân của bạn</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-24 h-24 border-2 border-gray-200">
                  <AvatarImage src={user?.image || ""} alt={formData.name} />
                  <AvatarFallback className="text-3xl">
                    {formData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Thay đổi ảnh</span>
                </Button>
              </div>

              <div className="flex-1 w-full">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên người dùng</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Giới thiệu</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(defaultData)}
            >
              Đặt lại
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              id="save-profile-button"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
