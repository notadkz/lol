"use client";

import { useState } from "react";
import { Mail, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    setLoading(false);

    if (res.ok) {
      alert("✅ Gửi tin nhắn thành công!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } else {
      alert("❌ Đã xảy ra lỗi khi gửi tin nhắn.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Liên hệ với chúng tôi</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi nếu bạn
          có bất kỳ câu hỏi nào.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <Phone className="h-10 w-10 text-primary mb-4" />
            <CardTitle>Điện thoại</CardTitle>
            <CardDescription>
              Gọi cho chúng tôi để được hỗ trợ nhanh chóng
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-primary font-medium">0783.324.234</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <Mail className="h-10 w-10 text-primary mb-4" />
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Gửi email cho chúng tôi để được hỗ trợ chi tiết
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-primary font-medium">
              phancongchau80fm@gmail.com
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <Clock className="h-10 w-10 text-primary mb-4" />
            <CardTitle>Giờ làm việc</CardTitle>
            <CardDescription>Thời gian hỗ trợ của chúng tôi</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-medium">8:00 - 22:00</p>
            <p className="text-muted-foreground">Thứ 2 - Chủ nhật</p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              Gửi tin nhắn cho chúng tôi
            </CardTitle>
            <CardDescription>
              Điền thông tin của bạn và chúng tôi sẽ liên hệ lại trong thời gian
              sớm nhất.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    placeholder="Nhập số điện thoại của bạn"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Chủ đề</Label>
                  <Input
                    id="subject"
                    placeholder="Nhập chủ đề"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Tin nhắn</Label>
                <Textarea
                  id="message"
                  placeholder="Nhập nội dung tin nhắn"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi tin nhắn"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
