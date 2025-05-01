import api from "./api";

// Interface cho dữ liệu tổng quan
export interface OverviewStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

// Interface cho dữ liệu doanh thu
export interface RevenueData {
  month: number;
  revenue: number;
}

// Interface cho dữ liệu trạng thái đơn hàng
export interface OrderStatusData {
  status: string;
  count: number;
}

// Interface cho dữ liệu sản phẩm theo rank
export interface ProductRankData {
  rank: string;
  count: number;
}

// Interface cho hoạt động gần đây
export interface RecentActivity {
  id: number;
  type: "user" | "order";
  title: string;
  description: string;
  timestamp: string;
}

// Interface cho phản hồi API tổng quan
export interface StatsResponse {
  overview: OverviewStats;
  revenueData: RevenueData[];
  orderStatusData: OrderStatusData[];
  productRankData: ProductRankData[];
  recentActivities: RecentActivity[];
}

export const StatsService = {
  // Lấy tất cả dữ liệu thống kê cho dashboard
  getDashboardStats: async (): Promise<StatsResponse> => {
    const response = await api.get("/stats/dashboard");
    return response.data;
  },

  // Lấy riêng dữ liệu tổng quan
  getOverview: async (): Promise<OverviewStats> => {
    const response = await api.get("/stats/overview");
    return response.data;
  },

  // Lấy dữ liệu doanh thu theo tháng
  getRevenueData: async (
    year: number = new Date().getFullYear()
  ): Promise<RevenueData[]> => {
    const response = await api.get("/stats/revenue", {
      params: { year },
    });
    return response.data;
  },

  // Lấy dữ liệu trạng thái đơn hàng
  getOrderStatusData: async (): Promise<OrderStatusData[]> => {
    const response = await api.get("/stats/orders");
    return response.data;
  },

  // Lấy dữ liệu sản phẩm theo rank
  getProductRankData: async (): Promise<ProductRankData[]> => {
    const response = await api.get("/stats/products");
    return response.data;
  },

  // Lấy hoạt động gần đây
  getRecentActivities: async (limit: number = 5): Promise<RecentActivity[]> => {
    const response = await api.get("/stats/recent-activities", {
      params: { limit },
    });
    return response.data;
  },
};
