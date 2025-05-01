import { useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  accountType: "REGULAR" | "PREMIUM" | "VIP";
  createdAt: Date;
  isVerified: boolean;
  isActive: boolean;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  accountType?: "REGULAR" | "PREMIUM" | "VIP";
  isActive?: boolean;
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  totalPages: number;
}

export const UserService = {
  /**
   * Lấy danh sách người dùng với bộ lọc và phân trang
   */
  async getUsers(params: UserQueryParams = {}): Promise<UsersResponse> {
    try {
      // Chuyển đổi params thành query string
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.set("page", params.page.toString());
      if (params.limit) queryParams.set("limit", params.limit.toString());
      if (params.search) queryParams.set("search", params.search);
      if (params.accountType)
        queryParams.set("accountType", params.accountType);
      if (params.isActive !== undefined)
        queryParams.set("isActive", params.isActive.toString());
      if (params.isVerified !== undefined)
        queryParams.set("isVerified", params.isVerified.toString());
      if (params.sortBy) queryParams.set("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";
      const response = await fetch(`/api/admin/users${queryString}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết của một người dùng
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng (ID: ${userId}):`, error);
      throw error;
    }
  },

  /**
   * Tạo người dùng mới
   */
  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi tạo người dùng mới:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Lỗi khi cập nhật người dùng (ID: ${userId}):`, error);
      throw error;
    }
  },

  /**
   * Xoá người dùng
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Lỗi khi xoá người dùng (ID: ${userId}):`, error);
      throw error;
    }
  },

  /**
   * Lấy thống kê về người dùng
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    premium: number;
    vip: number;
    newUsersToday: number;
    verifiedUsers: number;
  }> {
    try {
      const response = await fetch("/api/admin/users/stats");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy thống kê người dùng:", error);
      throw error;
    }
  },
};
