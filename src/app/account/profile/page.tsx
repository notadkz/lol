"use client";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Phone, MapPin, User } from "lucide-react";

// Dữ liệu giả
const userDetail = {
  name: "Nguyễn Văn A",
  username: "user123",
  email: "example@example.com",
  phone: "0912345678",
  address: "Hà Nội, Việt Nam",
  registerDate: "15/04/2025",
  lastLogin: "24/04/2025",
  accountLevel: "VIP",
  totalSpent: "750.000đ",
  totalPurchases: 5,
};

export default function ProfilePage() {
  const { session } = useAuth();
  const user = session?.user;

  // Sử dụng dữ liệu thật nếu có, nếu không dùng dữ liệu giả
  const profileData = {
    ...userDetail,
    name: user?.name || userDetail.name,
    email: user?.email || userDetail.email,
  };

  return (
    <div className="space-y-6" id="profile-content">
      <div>
        <h1 className="text-2xl font-bold mb-2">Hồ sơ cá nhân</h1>
        <p className="text-gray-500">Xem thông tin hồ sơ tài khoản của bạn</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader className="pb-3 text-center">
              <Avatar className="w-24 h-24 mx-auto border-4 border-purple-100">
                <AvatarImage src={user?.image || ""} alt={profileData.name} />
                <AvatarFallback className="text-3xl bg-purple-100 text-purple-700">
                  {profileData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{profileData.name}</CardTitle>
              <p className="text-sm text-gray-500">@{profileData.username}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{profileData.accountLevel}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{profileData.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Tham gia: {profileData.registerDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-2">
                    Thông tin cá nhân
                  </h3>
                  <Separator className="my-2" />
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Họ và tên
                      </dt>
                      <dd className="mt-1">{profileData.name}</dd>
                    </div>
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Tên người dùng
                      </dt>
                      <dd className="mt-1">@{profileData.username}</dd>
                    </div>
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="mt-1">{profileData.email}</dd>
                    </div>
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Số điện thoại
                      </dt>
                      <dd className="mt-1">{profileData.phone}</dd>
                    </div>
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Địa chỉ
                      </dt>
                      <dd className="mt-1">{profileData.address}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">
                    Thông tin tài khoản
                  </h3>
                  <Separator className="my-2" />
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Ngày đăng ký
                      </dt>
                      <dd className="mt-1">{profileData.registerDate}</dd>
                    </div>
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Đăng nhập gần nhất
                      </dt>
                      <dd className="mt-1">{profileData.lastLogin}</dd>
                    </div>
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Cấp tài khoản
                      </dt>
                      <dd className="mt-1">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {profileData.accountLevel}
                        </span>
                      </dd>
                    </div>
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Tổng chi tiêu
                      </dt>
                      <dd className="mt-1 text-purple-700 font-medium">
                        {profileData.totalSpent}
                      </dd>
                    </div>
                    <div className="flex flex-col py-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Tài khoản đã mua
                      </dt>
                      <dd className="mt-1">
                        {profileData.totalPurchases} tài khoản
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
