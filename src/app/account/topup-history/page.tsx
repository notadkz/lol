"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Filter,
  Search,
  XCircle,
} from "lucide-react";

// Dữ liệu giả
const transactions = [
  {
    id: "TX-1234",
    amount: 200000,
    method: "Ví Momo",
    status: "Thành công",
    date: "24/04/2025 14:30",
    reference: "MOX12345",
  },
  {
    id: "TX-1235",
    amount: 150000,
    method: "Thẻ ngân hàng",
    status: "Thành công",
    date: "22/04/2025 10:15",
    reference: "BNK45678",
  },
  {
    id: "TX-1236",
    amount: 300000,
    method: "Ví điện tử",
    status: "Thành công",
    date: "20/04/2025 18:45",
    reference: "VNP98765",
  },
  {
    id: "TX-1237",
    amount: 100000,
    method: "Thẻ ngân hàng",
    status: "Đang xử lý",
    date: "19/04/2025 09:20",
    reference: "BNK12345",
  },
  {
    id: "TX-1238",
    amount: 500000,
    method: "Ví Momo",
    status: "Thành công",
    date: "17/04/2025 16:30",
    reference: "MOX67890",
  },
  {
    id: "TX-1239",
    amount: 250000,
    method: "Thẻ ngân hàng",
    status: "Bị từ chối",
    date: "15/04/2025 11:45",
    reference: "BNK54321",
  },
  {
    id: "TX-1240",
    amount: 350000,
    method: "Ví điện tử",
    status: "Thành công",
    date: "12/04/2025 13:25",
    reference: "VNP45678",
  },
];

export default function TopupHistoryPage() {
  const { session, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  if (!session) return null;

  // Lọc giao dịch theo các bộ lọc
  const filteredTransactions = transactions.filter((tx) => {
    // Tìm kiếm theo ID hoặc Reference
    const matchesSearch =
      searchTerm === "" ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase());

    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

    // Lọc theo phương thức
    const matchesMethod = methodFilter === "all" || tx.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Thành công":
        return "bg-green-100 text-green-800";
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800";
      case "Bị từ chối":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownloadCSV = () => {
    // Giả lập tải xuống CSV
    alert("Đang tải xuống lịch sử giao dịch dưới dạng CSV");
  };

  return (
    <div className="space-y-6" id="topup-history-content">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Lịch sử nạp tiền</h1>
          <p className="text-gray-500">
            Xem lịch sử các giao dịch nạp tiền vào tài khoản
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleDownloadCSV}
        >
          <Download className="h-4 w-4" />
          <span>Xuất CSV</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bộ lọc */}
            <div className="flex flex-col md:flex-row gap-4 pb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Tìm kiếm theo ID hoặc mã tham chiếu..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-2.5 text-gray-500"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Trạng thái</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Thành công">Thành công</SelectItem>
                    <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                    <SelectItem value="Bị từ chối">Bị từ chối</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[160px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Phương thức</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Ví Momo">Ví Momo</SelectItem>
                    <SelectItem value="Thẻ ngân hàng">Thẻ ngân hàng</SelectItem>
                    <SelectItem value="Ví điện tử">Ví điện tử</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bảng giao dịch */}
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">
                        ID giao dịch
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        Số tiền
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        Phương thức
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        Trạng thái
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        Thời gian
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        Mã tham chiếu
                      </th>
                      <th className="text-center py-3 px-2 font-medium">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-gray-100 hover:bg-gray-50 hover:text-black"
                      >
                        <td className="py-3 px-2">{tx.id}</td>
                        <td className="py-3 px-2 font-medium">
                          {tx.amount.toLocaleString()}đ
                        </td>
                        <td className="py-3 px-2">{tx.method}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                              tx.status
                            )}`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-500">{tx.date}</td>
                        <td className="py-3 px-2 text-gray-500">
                          {tx.reference}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                <span>Xem chi tiết</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                <span>Tải hóa đơn</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                {searchTerm ||
                statusFilter !== "all" ||
                methodFilter !== "all" ? (
                  <div>
                    <p className="mb-2">
                      Không tìm thấy giao dịch nào phù hợp với bộ lọc
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setMethodFilter("all");
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                ) : (
                  <p>Bạn chưa có giao dịch nạp tiền nào</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
