import api from "@/services/api";

// Interface cho dữ liệu sản phẩm game account
export interface GameAccount {
  id: number;
  username: string;
  soloRank: string;
  flexRank: string;
  tftRank: string;
  level: number;
  blueEssence: number;
  riotPoints: number;
  championCount: number;
  skinCount: number;
  chromaCount: number;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  status: "AVAILABLE" | "SOLD" | "HIDDEN" | "RESERVED";
  createdAt: string;
  updatedAt: string;
  featuredUntil: string | null;
  viewCount: number;
  imageUrls: string[];
  description: string;
}

// Interface cho các tham số lọc và phân trang
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  ranks?: string[];
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// Interface cho response API
export interface ProductsResponse {
  data: GameAccount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ProductService = {
  // Lấy danh sách sản phẩm
  getProducts: async (
    params: ProductQueryParams = {}
  ): Promise<ProductsResponse> => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Lấy thông tin chi tiết sản phẩm
  getProductById: async (id: number): Promise<GameAccount> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Tạo sản phẩm mới
  createProduct: async (
    productData: Omit<
      GameAccount,
      "id" | "createdAt" | "updatedAt" | "viewCount"
    >
  ): Promise<GameAccount> => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (
    id: number,
    productData: Partial<GameAccount>
  ): Promise<GameAccount> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Xóa sản phẩm
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Đổi trạng thái sản phẩm
  updateProductStatus: async (
    id: number,
    status: GameAccount["status"]
  ): Promise<GameAccount> => {
    const response = await api.patch(`/products/${id}/status`, { status });
    return response.data;
  },

  // Đánh dấu sản phẩm là nổi bật
  setFeatured: async (
    id: number,
    featuredUntil: string | null
  ): Promise<GameAccount> => {
    const response = await api.patch(`/products/${id}/featured`, {
      featuredUntil,
    });
    return response.data;
  },

  // Tải lên hình ảnh cho sản phẩm
  uploadImages: async (
    id: number,
    formData: FormData
  ): Promise<{ imageUrls: string[] }> => {
    const response = await api.post(`/products/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Xóa hình ảnh của sản phẩm
  deleteImage: async (id: number, imageUrl: string): Promise<void> => {
    await api.delete(`/products/${id}/images`, {
      data: { imageUrl },
    });
  },

  // Lấy thống kê sản phẩm (theo rank, trạng thái)
  getProductStats: async (): Promise<{
    byRank: { rank: string; count: number }[];
    byStatus: { status: string; count: number }[];
  }> => {
    const response = await api.get("/products/stats");
    return response.data;
  },
};
