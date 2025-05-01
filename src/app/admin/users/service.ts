import api from "@/services/api";

// Interface cho dữ liệu người dùng
export interface User {
  id: number;
  name: string;
  email: string;
  accountType: "REGULAR" | "PREMIUM" | "VIP";
  balance: number;
  isAdmin: boolean;
  lastLogin: string;
  status: "active" | "locked" | "pending";
  createdAt: string;
  updatedAt: string;
  image?: string | null;
}

// Interface cho các tham số lọc và phân trang
export interface UserQueryParams {
  page?: number;
  limit?: number;
  accountType?: string;
  status?: string;
  isAdmin?: boolean;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// Interface cho response API
export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface cho dữ liệu tạo người dùng mới
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  accountType?: "REGULAR" | "PREMIUM" | "VIP";
  isAdmin?: boolean;
  status?: "active" | "locked" | "pending";
}

// Interface cho dữ liệu cập nhật người dùng
export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  accountType?: "REGULAR" | "PREMIUM" | "VIP";
  balance?: number;
  isAdmin?: boolean;
  status?: "active" | "locked" | "pending";
}

export const UserService = {
  // Lấy danh sách người dùng
  getUsers: async (params: UserQueryParams = {}): Promise<UsersResponse> => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // Lấy thông tin chi tiết người dùng
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Tạo người dùng mới
  createUser: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Cập nhật thông tin người dùng
  updateUser: async (id: number, userData: UpdateUserData): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Xóa người dùng
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Cập nhật trạng thái người dùng (khoá, mở khoá, chờ duyệt)
  updateUserStatus: async (
    id: number,
    status: User["status"]
  ): Promise<User> => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  // Cập nhật số dư người dùng
  updateUserBalance: async (
    id: number,
    amount: number,
    type: "add" | "subtract"
  ): Promise<User> => {
    const response = await api.patch(`/users/${id}/balance`, { amount, type });
    return response.data;
  },

  // Thay đổi quyền admin
  toggleAdminStatus: async (id: number, isAdmin: boolean): Promise<User> => {
    const response = await api.patch(`/users/${id}/admin`, { isAdmin });
    return response.data;
  },

  // Thay đổi loại tài khoản
  changeAccountType: async (
    id: number,
    accountType: User["accountType"]
  ): Promise<User> => {
    const response = await api.patch(`/users/${id}/account-type`, {
      accountType,
    });
    return response.data;
  },

  // Lấy thống kê người dùng (theo loại tài khoản, trạng thái)
  getUserStats: async (): Promise<{
    byAccountType: { accountType: string; count: number }[];
    byStatus: { status: string; count: number }[];
    total: number;
    admins: number;
  }> => {
    const response = await api.get("/users/stats");
    return response.data;
  },
};
