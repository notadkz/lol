"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, Users, Wallet, Clock } from "lucide-react";

// Dữ liệu giả
const recentTransactions = [
  {
    id: "TX-1234",
    amount: "200.000đ",
    status: "Thành công",
    date: "24/04/2025",
  },
  {
    id: "TX-1235",
    amount: "150.000đ",
    status: "Thành công",
    date: "22/04/2025",
  },
  {
    id: "TX-1236",
    amount: "300.000đ",
    status: "Thành công",
    date: "20/04/2025",
  },
];

const purchasedItems = [
  {
    id: "ACC-123",
    name: "Tài khoản LOL Thách Đấu",
    price: "200.000đ",
    date: "24/04/2025",
  },
  {
    id: "ACC-124",
    name: "Tài khoản LOL Kim Cương",
    price: "150.000đ",
    date: "22/04/2025",
  },
];

export default function AccountDashboard() {
  const { session } = useAuth();
  const user = session?.user;

  return (
    <div className="space-y-6" id="dashboard-content">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border border-gray-200">
            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
            <AvatarFallback className="text-xl">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold" id="dashboard-welcome">
              Xin chào, {user?.name || "người dùng"}
            </h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Card className="w-full md:w-auto bg-purple-50 border-purple-100">
          <CardContent className="p-4 flex items-center gap-4">
            <Wallet className="text-purple-600 h-10 w-10" />
            <div>
              <p className="text-sm text-gray-600">Số dư tài khoản</p>
              <p className="text-2xl font-bold text-purple-700">750.000đ</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-500" />
              Giao dịch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-500">Tổng số giao dịch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Tài khoản đã mua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500">Tổng tài khoản mua</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/04/2025</div>
            <p className="text-xs text-gray-500">Hoạt động gần nhất</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Mã GD</th>
                        <th className="text-left py-2 font-medium">Số tiền</th>
                        <th className="text-left py-2 font-medium">
                          Trạng thái
                        </th>
                        <th className="text-left py-2 font-medium">Ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-100">
                          <td className="py-2">{tx.id}</td>
                          <td className="py-2 text-green-600">{tx.amount}</td>
                          <td className="py-2">
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-2 text-gray-500">{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  Không có giao dịch nào gần đây
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tài khoản đã mua gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchasedItems.length > 0 ? (
                <div className="space-y-3">
                  {purchasedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.date}</div>
                      </div>
                      <div className="text-purple-600 font-medium">
                        {item.price}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  Bạn chưa mua tài khoản nào
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
