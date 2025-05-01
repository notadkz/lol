"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AlertCircle as LucideAlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Search } from "lucide-react";

// Cập nhật interface User để đảm bảo id luôn có giá trị
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  accountType: "REGULAR" | "PREMIUM" | "VIP";
  createdAt: Date;
  isVerified: boolean;
  isActive: boolean;
  isAdmin?: boolean;
}

// Khai báo interface UserQueryParams
interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  accountType?: "REGULAR" | "PREMIUM" | "VIP";
  isActive?: boolean;
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  totalPages: number;
}

// Dùng const cho UserService thay vì export (xử lý lỗi merged declaration)
const UserService = {
  getUsers: async (params?: UserQueryParams): Promise<UsersResponse> => {
    try {
      // Chuyển đổi params thành query string
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.search) queryParams.set("search", params.search);
      if (params?.accountType)
        queryParams.set("accountType", params.accountType);
      if (params?.isActive !== undefined)
        queryParams.set("isActive", params.isActive.toString());
      if (params?.isVerified !== undefined)
        queryParams.set("isVerified", params.isVerified.toString());
      if (params?.sortBy) queryParams.set("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.set("sortOrder", params.sortOrder);

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
  getUserById: async (userId: string): Promise<User> => {
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
  createUser: async (
    userData: Omit<User, "id" | "createdAt">
  ): Promise<User> => {
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
  updateUser: async (
    userId: string,
    userData: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<User> => {
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
  deleteUser: async (userId: string): Promise<void> => {
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
  updateUserStatus: async (
    userId: string,
    isActive: boolean
  ): Promise<User> => {
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user status");
    }

    return response.json();
  },
  getUserStats: async () => {
    // ... existing code ...
    return {
      total: 0,
      active: 0,
      premium: 0,
      vip: 0,
      newUsersToday: 0,
      verifiedUsers: 0,
    };
  },
};

export default function AccountsPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountType, setAccountType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 10;

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state for new/edit user
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    accountType: "REGULAR" as "REGULAR" | "PREMIUM" | "VIP",
    isVerified: false,
    isActive: true,
  });

  const emptyUser: User = {
    id: "",
    email: "",
    name: "",
    image: "",
    accountType: "REGULAR",
    createdAt: new Date(),
    isVerified: false,
    isActive: true,
    isAdmin: false,
  };

  const getQueryParams = (): UserQueryParams => {
    const params: UserQueryParams = {
      page: currentPage,
      limit: pageSize,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    if (accountType !== "all") {
      params.accountType = accountType as "REGULAR" | "PREMIUM" | "VIP";
    }

    return params;
  };

  // Sắp xếp người dùng với admin lên đầu danh sách
  const sortUsersByAdminStatus = (users: User[]): User[] => {
    return [...users].sort((a, b) => {
      // Nếu a là admin và b không phải, a nên lên trước
      if (a.isAdmin && !b.isAdmin) return -1;
      // Nếu b là admin và a không phải, b nên lên trước
      if (!a.isAdmin && b.isAdmin) return 1;
      // Nếu cả hai đều là admin hoặc đều không phải, giữ nguyên thứ tự
      return 0;
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);

    try {
      const params = getQueryParams();
      const response = await UserService.getUsers(params);

      // Sắp xếp tài khoản admin lên đầu danh sách
      const sortedUsers = sortUsersByAdminStatus(response.data);

      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
      setTotalPages(Math.ceil(response.total / pageSize));
      setTotalUsers(response.total);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể kết nối đến API. Đang hiển thị dữ liệu mẫu.");
      setUsingMockData(true);

      // Generate mock data as fallback
      const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
        image: `https://ui-avatars.com/api/?name=User+${i + 1}`,
        accountType: ["REGULAR", "PREMIUM", "VIP"][
          Math.floor(Math.random() * 3)
        ] as "REGULAR" | "PREMIUM" | "VIP",
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 10000000000)
        ),
        isVerified: Math.random() > 0.3,
        isActive: Math.random() > 0.2,
        isAdmin: i === 0, // Chỉ user đầu tiên là admin
      }));

      // Apply filters to mock data
      let filtered = [...mockUsers];

      if (searchTerm) {
        filtered = filtered.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (accountType !== "all") {
        filtered = filtered.filter((user) => user.accountType === accountType);
      }

      // Sắp xếp tài khoản admin lên đầu danh sách
      filtered = sortUsersByAdminStatus(filtered);

      // Apply pagination to mock data
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedUsers = filtered.slice(startIndex, startIndex + pageSize);

      setUsers(paginatedUsers);
      setFilteredUsers(paginatedUsers);
      setTotalPages(Math.ceil(filtered.length / pageSize));
      setTotalUsers(filtered.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, accountType]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: string) => {
    setAccountType(type);
    setCurrentPage(1);
  };

  const handleAddUser = async (userData: Omit<User, "id" | "createdAt">) => {
    try {
      setLoading(true);

      if (usingMockData) {
        // Add to mock data with mock ID
        const newUser: User = {
          id: `mock-${Date.now()}`,
          ...userData,
          createdAt: new Date(),
          isAdmin: userData.isAdmin || false,
        };

        // Thêm người dùng mới và sắp xếp lại với admin ở trên đầu
        setUsers((prev) => sortUsersByAdminStatus([...prev, newUser]));

        toast({
          title: "Tài khoản đã được tạo",
          description: "Tài khoản mới đã được tạo thành công (dữ liệu mẫu).",
        });
      } else {
        // Create user using actual API
        await UserService.createUser(userData);

        toast({
          title: "Tài khoản đã được tạo",
          description: "Tài khoản mới đã được tạo thành công.",
        });

        // Refresh user list
        await fetchUsers();
      }

      setAddDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi tạo tài khoản:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo tài khoản. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser?.id) return;

    try {
      setLoading(true);

      if (usingMockData) {
        // Update user in mock data
        const updatedUsers = users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                ...data,
              }
            : user
        );

        // Sắp xếp lại với admin ở trên đầu
        setUsers(sortUsersByAdminStatus(updatedUsers));

        toast({
          title: "Tài khoản đã được cập nhật",
          description:
            "Thông tin tài khoản đã được cập nhật thành công (dữ liệu mẫu).",
        });
      } else {
        // Update using actual API
        await UserService.updateUser(selectedUser.id, data);

        toast({
          title: "Tài khoản đã được cập nhật",
          description: "Thông tin tài khoản đã được cập nhật thành công.",
        });

        // Refresh user list
        await fetchUsers();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật tài khoản:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tài khoản. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleDeleteUser = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      if (usingMockData) {
        // Simulate deleting a user with mock data
        const updatedUsers = users.filter((user) => user.id !== currentUser.id);
        setUsers(updatedUsers);
        toast({
          title: "Tài khoản đã được xoá",
          description:
            "Tài khoản người dùng đã được xoá thành công (dữ liệu mẫu).",
        });
      } else {
        // Use actual API
        await UserService.deleteUser(currentUser.id);
        toast({
          title: "Tài khoản đã được xoá",
          description: "Tài khoản người dùng đã được xoá thành công.",
        });

        // Refresh user list
        await fetchUsers();
      }
    } catch (error) {
      console.error("Lỗi khi xoá tài khoản:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xoá tài khoản. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCurrentUser(null);
    }
  };

  // Open edit dialog and populate form data
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      accountType: user.accountType,
      isVerified: user.isVerified,
      isActive: user.isActive,
    });
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Fix remaining success variant issues
  const handleChangeStatus = async (userId: string, isActive: boolean) => {
    try {
      setLoading(true);

      if (usingMockData) {
        // Update user status in mock data
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, isActive } : user
          )
        );

        toast({
          title: isActive
            ? "Tài khoản đã được kích hoạt"
            : "Tài khoản đã bị vô hiệu hóa",
          description: `Trạng thái tài khoản đã được cập nhật thành ${
            isActive ? "kích hoạt" : "vô hiệu hóa"
          } (dữ liệu mẫu).`,
        });
      } else {
        // Update using actual API
        await UserService.updateUserStatus(userId, isActive);

        toast({
          title: isActive
            ? "Tài khoản đã được kích hoạt"
            : "Tài khoản đã bị vô hiệu hóa",
          description: `Trạng thái tài khoản đã được cập nhật thành ${
            isActive ? "kích hoạt" : "vô hiệu hóa"
          }.`,
        });

        // Refresh user list
        await fetchUsers();
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái tài khoản:", error);
      toast({
        title: "Lỗi",
        description:
          "Không thể thay đổi trạng thái tài khoản. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý tài khoản người dùng</h1>
        <Button
          onClick={() => {
            setSelectedUser(emptyUser);
            setAddDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm người dùng mới
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <LucideAlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-full sm:w-1/3">
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-1/4">
          <Select value={accountType} onValueChange={handleFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Loại tài khoản" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="REGULAR">Regular</SelectItem>
              <SelectItem value="PREMIUM">Premium</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Rows per page could be added here */}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Tên
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Email
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Loại tài khoản</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Đã xác thực</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Ngày tạo
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={
                          user.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name
                          )}`
                        }
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.accountType === "VIP"
                          ? "destructive"
                          : user.accountType === "PREMIUM"
                          ? "default"
                          : "outline"
                      }
                    >
                      {user.accountType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isAdmin ? "destructive" : "default"}
                      className={
                        user.isAdmin ? "bg-purple-600 hover:bg-purple-700" : ""
                      }
                    >
                      {user.isAdmin ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Badge
                        variant="default"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Đã xác thực
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Chưa xác thực</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-600 border-green-200"
                      >
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-600 border-red-200"
                      >
                        Đã vô hiệu
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.createdAt &&
                      format(new Date(user.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            // Đảm bảo user.id luôn tồn tại
                            setCurrentUser({
                              id: user.id,
                              name: user.name || "",
                              email: user.email || "",
                              image: user.image || "",
                              accountType: user.accountType || "REGULAR",
                              createdAt: user.createdAt || new Date(),
                              isVerified: user.isVerified || false,
                              isActive: user.isActive || false,
                              isAdmin: user.isAdmin || false,
                            });
                            setEditDialogOpen(true);
                          }}
                        >
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            handleChangeStatus(user.id, !user.isActive);
                          }}
                        >
                          {user.isActive ? "Vô hiệu hoá" : "Kích hoạt"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(user)}
                        >
                          Xoá tài khoản
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination control */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị {users.length} / {totalUsers} người dùng
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            Trước
          </Button>
          <div className="text-sm">
            Trang {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || loading}
          >
            Tiếp
          </Button>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo tài khoản người dùng mới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên người dùng</Label>
              <Input
                id="name"
                value={selectedUser?.name || ""}
                onChange={(e) =>
                  setSelectedUser((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                placeholder="Nhập tên người dùng"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={selectedUser?.email || ""}
                onChange={(e) =>
                  setSelectedUser((prev) =>
                    prev ? { ...prev, email: e.target.value } : null
                  )
                }
                placeholder="example@domain.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountType">Loại tài khoản</Label>
              <Select
                value={selectedUser?.accountType || "REGULAR"}
                onValueChange={(value: string) => {
                  if (selectedUser) {
                    setSelectedUser({
                      ...selectedUser,
                      accountType: value as "REGULAR" | "PREMIUM" | "VIP",
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Đường dẫn ảnh đại diện (tuỳ chọn)</Label>
              <Input
                id="image"
                value={selectedUser?.image || ""}
                onChange={(e) =>
                  setSelectedUser((prev) =>
                    prev ? { ...prev, image: e.target.value } : null
                  )
                }
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="add-isAdmin"
                checked={selectedUser?.isAdmin || false}
                onChange={(e) =>
                  setSelectedUser((prev) =>
                    prev ? { ...prev, isAdmin: e.target.checked } : null
                  )
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="add-isAdmin">Tài khoản admin</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Huỷ</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (selectedUser) {
                  handleAddUser({
                    email: selectedUser.email,
                    name: selectedUser.name,
                    image: selectedUser.image,
                    accountType: selectedUser.accountType,
                    isVerified: false,
                    isActive: true,
                    isAdmin: selectedUser.isAdmin || false,
                  });
                  setAddDialogOpen(false);
                }
              }}
              disabled={!selectedUser?.email || !selectedUser?.name}
            >
              Thêm người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên người dùng</Label>
              <Input
                id="edit-name"
                value={selectedUser?.name || ""}
                onChange={(e) =>
                  setSelectedUser((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                placeholder="Nhập tên người dùng"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={selectedUser?.email || ""}
                onChange={(e) =>
                  setSelectedUser((prev) =>
                    prev ? { ...prev, email: e.target.value } : null
                  )
                }
                placeholder="example@domain.com"
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-accountType">Loại tài khoản</Label>
              <Select
                value={selectedUser?.accountType}
                onValueChange={(value: string) => {
                  if (selectedUser) {
                    setSelectedUser({
                      ...selectedUser,
                      accountType: value as "REGULAR" | "PREMIUM" | "VIP",
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Đường dẫn ảnh đại diện</Label>
              <Input
                id="edit-image"
                value={selectedUser?.image || ""}
                onChange={(e) =>
                  setSelectedUser((prev) =>
                    prev ? { ...prev, image: e.target.value } : null
                  )
                }
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isVerified"
                  checked={selectedUser?.isVerified || false}
                  onChange={(e) =>
                    setSelectedUser((prev) =>
                      prev ? { ...prev, isVerified: e.target.checked } : null
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-isVerified">Đã xác thực</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={selectedUser?.isActive || false}
                  onChange={(e) =>
                    setSelectedUser((prev) =>
                      prev ? { ...prev, isActive: e.target.checked } : null
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-isActive">Đang hoạt động</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isAdmin"
                  checked={selectedUser?.isAdmin || false}
                  onChange={(e) =>
                    setSelectedUser((prev) =>
                      prev ? { ...prev, isAdmin: e.target.checked } : null
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-isAdmin">Tài khoản admin</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Huỷ</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (selectedUser) {
                  handleUpdateUser({
                    name: selectedUser.name,
                    image: selectedUser.image,
                    accountType: selectedUser.accountType,
                    isVerified: selectedUser.isVerified,
                    isActive: selectedUser.isActive,
                    isAdmin: selectedUser.isAdmin,
                  });
                  setEditDialogOpen(false);
                }
              }}
              disabled={!selectedUser?.id}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá tài khoản của {selectedUser?.name}{" "}
              không? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedUser) {
                  handleDeleteUser();
                }
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
