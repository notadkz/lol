"use client";

import { Card } from "@/components/ui/card";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import {
  StatsService,
  OverviewStats,
  RevenueData,
  OrderStatusData,
  ProductRankData,
  RecentActivity,
} from "@/services/statsService";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Dữ liệu mẫu để sử dụng khi API gặp lỗi
const fallbackData = {
  overview: {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  },
  revenueData: Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    revenue: 0,
  })),
  orderStatusData: [
    { status: "COMPLETED", count: 0 },
    { status: "PENDING", count: 0 },
    { status: "CANCELLED", count: 0 },
  ],
  productRankData: [
    { rank: "UNRANKED", count: 0 },
    { rank: "DONG", count: 0 },
    { rank: "BAC", count: 0 },
    { rank: "VANG", count: 0 },
  ],
  recentActivities: [],
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<[string, string | number][]>([
    ["Tháng", "Doanh thu (triệu VND)"],
  ]);
  const [orderData, setOrderData] = useState<[string, string | number][]>([
    ["Trạng thái", "Số lượng"],
  ]);
  const [productData, setProductData] = useState<[string, string | number][]>([
    ["Rank", "Số lượng"],
  ]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const { toast } = useToast();

  // Hàm chuyển đổi dữ liệu doanh thu từ API sang định dạng cho biểu đồ
  const transformRevenueData = (
    data: RevenueData[]
  ): [string, string | number][] => {
    const chartData: [string, string | number][] = [
      ["Tháng", "Doanh thu (triệu VND)"],
    ];

    const monthNames = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];

    data.forEach((item) => {
      // Chuyển đổi doanh thu từ VND sang triệu VND để hiển thị trên biểu đồ
      const revenueInMillions = Math.round(item.revenue / 1000000);
      chartData.push([monthNames[item.month - 1], revenueInMillions]);
    });

    return chartData;
  };

  // Hàm chuyển đổi dữ liệu trạng thái đơn hàng từ API sang định dạng cho biểu đồ
  const transformOrderStatusData = (
    data: OrderStatusData[]
  ): [string, string | number][] => {
    const chartData: [string, string | number][] = [["Trạng thái", "Số lượng"]];

    const statusMap: Record<string, string> = {
      COMPLETED: "Hoàn thành",
      PENDING: "Đang xử lý",
      CANCELLED: "Đã hủy",
      REFUNDED: "Đã hoàn tiền",
    };

    data.forEach((item) => {
      chartData.push([statusMap[item.status] || item.status, item.count]);
    });

    return chartData;
  };

  // Hàm chuyển đổi dữ liệu sản phẩm theo rank từ API sang định dạng cho biểu đồ
  const transformProductRankData = (
    data: ProductRankData[]
  ): [string, string | number][] => {
    const chartData: [string, string | number][] = [["Rank", "Số lượng"]];

    const rankMap: Record<string, string> = {
      UNRANKED: "Unranked",
      DONG: "Đồng",
      BAC: "Bạc",
      VANG: "Vàng",
      BACH_KIM: "Bạch Kim",
      KIM_CUONG: "Kim Cương",
      CAO_THU: "Cao Thủ",
      DAI_CAO_THU: "Đại Cao Thủ",
      THACH_DAU: "Thách Đấu",
    };

    data.forEach((item) => {
      chartData.push([rankMap[item.rank] || item.rank, item.count]);
    });

    return chartData;
  };

  // Hàm để tải dữ liệu từ API
  const fetchData = async (useFallback = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (useFallback) {
        setIsUsingFallback(true);
        setStats(fallbackData.overview);
        setRevenueData(transformRevenueData(fallbackData.revenueData));
        setOrderData(transformOrderStatusData(fallbackData.orderStatusData));
        setProductData(transformProductRankData(fallbackData.productRankData));
        setRecentActivities(fallbackData.recentActivities);

        toast({
          title: "Đang sử dụng dữ liệu mẫu",
          description:
            "Hiện đang hiển thị dữ liệu mẫu do kết nối cơ sở dữ liệu gặp vấn đề.",
        });
        return;
      }

      // Lấy tất cả dữ liệu dashboard trong một lần gọi API
      const allStats = await StatsService.getDashboardStats();

      setIsUsingFallback(false);
      setStats(allStats.overview);
      setRevenueData(transformRevenueData(allStats.revenueData));
      setOrderData(transformOrderStatusData(allStats.orderStatusData));
      setProductData(transformProductRankData(allStats.productRankData));
      setRecentActivities(allStats.recentActivities);
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);

      // Hiển thị thông báo lỗi cụ thể hơn
      const errorMessage =
        err.response?.status === 500
          ? "Lỗi máy chủ nội bộ. Có thể cơ sở dữ liệu chưa được thiết lập đúng."
          : "Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.";

      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Lỗi khi tải dữ liệu",
        description: errorMessage,
      });

      // Nếu API gặp lỗi, sử dụng dữ liệu mẫu thay thế
      setStats(fallbackData.overview);
      setRevenueData(transformRevenueData(fallbackData.revenueData));
      setOrderData(transformOrderStatusData(fallbackData.orderStatusData));
      setProductData(transformProductRankData(fallbackData.productRankData));
      setRecentActivities(fallbackData.recentActivities);
      setIsUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Tải dữ liệu khi component được tạo
  useEffect(() => {
    fetchData();
  }, []);

  // Format số tiền thành VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format thời gian hoạt động gần đây
  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {isUsingFallback && (
          <Button
            onClick={() => fetchData(false)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Thử lại kết nối
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
          <p className="text-sm">
            Vui lòng kiểm tra kết nối cơ sở dữ liệu và đảm bảo các bảng đã được
            tạo đúng. Hiện tại đang hiển thị dữ liệu mẫu.
          </p>
        </div>
      )}

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card id="dashboard-total-users" className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Tổng người dùng
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-semibold">
                  {stats?.totalUsers || 0}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card id="dashboard-total-products" className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng sản phẩm</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-semibold">
                  {stats?.totalProducts || 0}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card id="dashboard-total-orders" className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-semibold">
                  {stats?.totalOrders || 0}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card id="dashboard-revenue" className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Doanh thu</p>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p className="text-2xl font-semibold">
                  {stats ? formatCurrency(stats.revenue) : "0 ₫"}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card id="dashboard-pending-orders" className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Đơn hàng chờ xử lý
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-semibold">
                  {stats?.pendingOrders || 0}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card id="dashboard-low-stock" className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Sản phẩm sắp hết
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-semibold">
                  {stats?.lowStockProducts || 0}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Biểu đồ thống kê */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h2>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <Chart
              chartType="LineChart"
              width="100%"
              height="300px"
              data={revenueData}
              options={{
                legend: { position: "none" },
                colors: ["#4f46e5"],
                hAxis: { title: "Tháng" },
                vAxis: { title: "Doanh thu (triệu VND)" },
              }}
            />
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Trạng thái đơn hàng</h2>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <Chart
              chartType="PieChart"
              width="100%"
              height="300px"
              data={orderData}
              options={{
                colors: ["#4f46e5", "#f59e0b", "#ef4444", "#3b82f6"],
                legend: { position: "bottom" },
              }}
            />
          )}
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm theo rank</h2>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="300px"
              data={productData}
              options={{
                legend: { position: "none" },
                colors: ["#4f46e5"],
                hAxis: { title: "Rank" },
                vAxis: { title: "Số lượng" },
              }}
            />
          )}
        </Card>
      </div>

      {/* Hoạt động gần đây */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Hoạt động gần đây</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div
                key={index}
                className="flex items-center border-b border-gray-200 pb-3"
              >
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="ml-3 flex-grow">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center border-b border-gray-200 pb-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                    {activity.type === "user" ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      <ShoppingCart className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">
                    {formatActivityTime(activity.timestamp)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">
                {isUsingFallback
                  ? "Không có dữ liệu hoạt động (đang sử dụng dữ liệu mẫu)"
                  : "Không có hoạt động gần đây"}
              </p>
            )}
          </div>
        )}
      </Card>

      {isUsingFallback && (
        <div className="border border-yellow-300 bg-yellow-50 rounded-md p-4 text-sm text-yellow-800">
          <p className="font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Đang sử dụng dữ liệu mẫu
          </p>
          <p className="mt-1">
            Dashboard hiện đang hiển thị dữ liệu mẫu do kết nối tới API gặp lỗi.
            Vui lòng kiểm tra kết nối cơ sở dữ liệu và cấu hình API.
          </p>
          <div className="mt-3">
            <Button size="sm" onClick={() => fetchData(false)}>
              Thử kết nối lại
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
