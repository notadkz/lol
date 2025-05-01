"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

// Interface cho dữ liệu đơn hàng
interface Order {
  id: number;
  buyerId: number;
  buyerName: string;
  buyerEmail: string;
  accountId: number;
  accountUsername: string;
  accountRank: string;
  totalAmount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  paymentMethod: string;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  refundRequested: boolean;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<
    "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED"
  >("PENDING");

  // Số đơn hàng mỗi trang
  const ordersPerPage = 10;

  // Lấy dữ liệu đơn hàng mẫu
  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
    const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => ({
      id: 100000 + i,
      buyerId: 1000 + Math.floor(Math.random() * 100),
      buyerName: `Người dùng ${1000 + Math.floor(Math.random() * 100)}`,
      buyerEmail: `user${1000 + Math.floor(Math.random() * 100)}@example.com`,
      accountId: 2000 + Math.floor(Math.random() * 100),
      accountUsername: `account_${2000 + Math.floor(Math.random() * 100)}`,
      accountRank: getRandomRank(),
      totalAmount: 100000 + Math.floor(Math.random() * 5000000),
      status: getRandomStatus(),
      paymentMethod: getRandomPaymentMethod(),
      paymentId:
        Math.random() > 0.3
          ? `PAY-${100000 + Math.floor(Math.random() * 900000)}`
          : null,
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
      updatedAt: new Date().toISOString(),
      refundRequested: Math.random() > 0.9,
    }));

    setOrders(mockOrders);
  }, []);

  function getRandomRank(): string {
    const ranks = [
      "UNRANKED",
      "SAT",
      "DONG",
      "BAC",
      "VANG",
      "BACH_KIM",
      "KIM_CUONG",
      "CAO_THU",
      "DAI_CAO_THU",
      "THACH_DAU",
    ];
    return ranks[Math.floor(Math.random() * ranks.length)];
  }

  function getRandomStatus():
    | "PENDING"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED" {
    const statuses = ["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"];
    const weights = [0.3, 0.5, 0.1, 0.1]; // Trọng số xác suất

    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < statuses.length; i++) {
      sum += weights[i];
      if (random < sum) {
        return statuses[i] as
          | "PENDING"
          | "COMPLETED"
          | "CANCELLED"
          | "REFUNDED";
      }
    }

    return "PENDING";
  }

  function getRandomPaymentMethod(): string {
    const methods = [
      "MOMO",
      "ZALOPAY",
      "VNPAY",
      "BANK_TRANSFER",
      "E_WALLET",
      "BALANCE",
    ];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  // Lọc và sắp xếp đơn hàng
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toString().includes(searchTerm) ||
        order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.accountUsername.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || order.status === filterStatus;
      const matchesPayment =
        filterPayment === "all" || order.paymentMethod === filterPayment;

      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      let valA = a[sortField as keyof Order];
      let valB = b[sortField as keyof Order];

      // Handle string comparison
      if (typeof valA === "string" && typeof valB === "string") {
        if (sortDirection === "asc") {
          return valA.localeCompare(valB);
        } else {
          return valB.localeCompare(valA);
        }
      }

      // Handle number/date comparison
      if (sortDirection === "asc") {
        return (valA as any) - (valB as any);
      } else {
        return (valB as any) - (valA as any);
      }
    });

  // Tính toán phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Xử lý thay đổi trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Xử lý thay đổi sắp xếp
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Định dạng số tiền
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Định dạng ngày giờ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Hiển thị trạng thái theo màu
  const getStatusDisplay = (status: string) => {
    let color = "";
    let icon = null;

    switch (status) {
      case "PENDING":
        color = "bg-yellow-100 text-yellow-800";
        icon = <AlertTriangle className="w-3 h-3 mr-1" />;
        break;
      case "COMPLETED":
        color = "bg-green-100 text-green-800";
        icon = <CheckCircle className="w-3 h-3 mr-1" />;
        break;
      case "CANCELLED":
        color = "bg-red-100 text-red-800";
        icon = <XCircle className="w-3 h-3 mr-1" />;
        break;
      case "REFUNDED":
        color = "bg-blue-100 text-blue-800";
        icon = <RotateCcw className="w-3 h-3 mr-1" />;
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }

    return (
      <Badge
        variant="outline"
        className={`${color} font-normal flex items-center`}
      >
        {icon}
        {status === "PENDING"
          ? "Đang xử lý"
          : status === "COMPLETED"
          ? "Hoàn thành"
          : status === "CANCELLED"
          ? "Đã hủy"
          : status === "REFUNDED"
          ? "Đã hoàn tiền"
          : status}
      </Badge>
    );
  };

  // Xử lý cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = () => {
    if (!selectedOrder || !newStatus) return;

    // Trong thực tế, bạn sẽ gọi API để cập nhật trạng thái đơn hàng
    const updatedOrders = orders.map((order) =>
      order.id === selectedOrder.id
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    );

    setOrders(updatedOrders);
    setIsStatusDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
      </div>

      {/* Tìm kiếm và lọc */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Tìm kiếm mã đơn, tên người mua..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Đang xử lý</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lọc theo phương thức thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phương thức</SelectItem>
                <SelectItem value="MOMO">MoMo</SelectItem>
                <SelectItem value="ZALOPAY">ZaloPay</SelectItem>
                <SelectItem value="VNPAY">VNPay</SelectItem>
                <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                <SelectItem value="E_WALLET">Ví điện tử</SelectItem>
                <SelectItem value="BALANCE">Số dư</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bảng đơn hàng */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    Mã đơn
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead>Người mua</TableHead>
                <TableHead>Tài khoản</TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("totalAmount")}
                  >
                    Tổng tiền
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    Ngày đặt
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={order.refundRequested ? "bg-red-50" : ""}
                  >
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <div className="bg-primary text-white w-full h-full flex items-center justify-center text-xs">
                            {order.buyerName.charAt(0).toUpperCase()}
                          </div>
                        </Avatar>
                        <div>
                          <div className="font-medium">{order.buyerName}</div>
                          <div className="text-xs text-gray-500">
                            {order.buyerEmail}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{order.accountUsername}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusDisplay(order.status)}
                        {order.refundRequested && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="destructive" className="h-5">
                                  Yêu cầu hoàn tiền
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Khách hàng đã yêu cầu hoàn tiền</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-gray-100 font-normal"
                      >
                        {order.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="sr-only">Xem</span>
                      </Button>
                      <Button
                        variant={
                          order.status === "PENDING" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setIsStatusDialogOpen(true);
                        }}
                      >
                        Trạng thái
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Không tìm thấy đơn hàng phù hợp
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Phân trang */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Hiển thị {indexOfFirstOrder + 1} -{" "}
          {Math.min(indexOfLastOrder, filteredOrders.length)} trong số{" "}
          {filteredOrders.length} đơn hàng
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Button>
          )).slice(
            Math.max(0, currentPage - 3),
            Math.min(totalPages, currentPage + 2)
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dialog xem chi tiết đơn hàng */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Thông tin đơn hàng</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Mã đơn hàng:</p>
                        <p className="font-medium">#{selectedOrder.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Trạng thái:</p>
                        <div>{getStatusDisplay(selectedOrder.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ngày đặt:</p>
                        <p className="font-medium">
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Cập nhật lần cuối:
                        </p>
                        <p className="font-medium">
                          {formatDate(selectedOrder.updatedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền:</p>
                        <p className="font-semibold text-lg">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Phương thức thanh toán:
                        </p>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="bg-gray-100 font-normal"
                          >
                            {selectedOrder.paymentMethod}
                          </Badge>
                        </div>
                      </div>
                      {selectedOrder.paymentId && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">
                            Mã thanh toán:
                          </p>
                          <p className="font-medium">
                            {selectedOrder.paymentId}
                          </p>
                        </div>
                      )}
                      {selectedOrder.refundRequested && (
                        <div className="col-span-2 pt-2">
                          <Badge variant="destructive">Yêu cầu hoàn tiền</Badge>
                          <p className="text-sm text-red-500 mt-1">
                            Khách hàng đã yêu cầu hoàn tiền đơn hàng này
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">
                      Thông tin tài khoản game
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <div>
                        <p className="text-sm text-gray-500">ID tài khoản:</p>
                        <p className="font-medium">{selectedOrder.accountId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tên tài khoản:</p>
                        <p className="font-medium">
                          {selectedOrder.accountUsername}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rank:</p>
                        <p className="font-medium">
                          {selectedOrder.accountRank}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Thông tin người mua</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <div className="bg-primary text-white w-full h-full flex items-center justify-center">
                          {selectedOrder.buyerName.charAt(0).toUpperCase()}
                        </div>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedOrder.buyerName}</p>
                        <p className="text-sm text-gray-500">
                          {selectedOrder.buyerEmail}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2">
                      <div>
                        <p className="text-sm text-gray-500">ID người mua:</p>
                        <p className="font-medium">{selectedOrder.buyerId}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Lịch sử đơn hàng</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-full w-2 h-2 bg-green-500"></div>
                        <div>
                          <p className="text-sm font-medium">
                            Đơn hàng được tạo
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(selectedOrder.createdAt)}
                          </p>
                        </div>
                      </div>
                      {selectedOrder.status !== "PENDING" && (
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 rounded-full w-2 h-2 bg-blue-500"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Đơn hàng chuyển sang{" "}
                              {selectedOrder.status === "COMPLETED"
                                ? "hoàn thành"
                                : selectedOrder.status === "CANCELLED"
                                ? "đã hủy"
                                : "đã hoàn tiền"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(selectedOrder.updatedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.refundRequested && (
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 rounded-full w-2 h-2 bg-red-500"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Khách hàng yêu cầu hoàn tiền
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(
                                new Date(Date.now() - 86400000).toISOString()
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Đóng
            </Button>
            {selectedOrder && selectedOrder.status === "PENDING" && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setNewStatus("COMPLETED");
                  setIsStatusDialogOpen(true);
                }}
              >
                Đánh dấu hoàn thành
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog cập nhật trạng thái */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Chọn trạng thái mới cho đơn hàng #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={newStatus}
                onValueChange={(
                  value: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED"
                ) => setNewStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Đang xử lý</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newStatus === "CANCELLED" || newStatus === "REFUNDED") && (
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                <p className="font-medium">Lưu ý:</p>
                <p>
                  {newStatus === "CANCELLED"
                    ? "Khi hủy đơn hàng, tài khoản game sẽ được đưa trở lại trạng thái có sẵn."
                    : "Khi hoàn tiền, số tiền sẽ được hoàn lại vào số dư tài khoản của người mua."}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="default" onClick={handleUpdateOrderStatus}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
