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
  Plus,
  Edit,
  Trash,
  ImagePlus,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCcw,
  Loader2,
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
// Interface cho dữ liệu sản phẩm (tài khoản game)
interface GameAccount {
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
  ranks?: string[];
  isFeatured?: boolean;
  seller?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  buyer?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<GameAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRank, setFilterRank] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<GameAccount | null>(
    null
  );
  const router = useRouter();
  const [newProduct, setNewProduct] = useState({
    username: "",
    password: "",
    soloRank: "UNRANKED",
    flexRank: "UNRANKED",
    tftRank: "UNRANKED",
    level: 30,
    blueEssence: 0,
    riotPoints: 0,
    championCount: 0,
    skinCount: 0,
    chromaCount: 0,
    price: 0,
    originalPrice: null as number | null,
    status: "AVAILABLE" as "AVAILABLE" | "SOLD" | "HIDDEN" | "RESERVED",
    description: "",
    imageUrls: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  // Số sản phẩm mỗi trang
  const productsPerPage = 10;

  // Lấy dữ liệu sản phẩm từ API
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Tạo URL với các tham số truy vấn
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString(),
      });

      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      if (filterStatus && filterStatus !== "all") {
        queryParams.append("status", filterStatus);
      }

      if (filterRank && filterRank !== "all") {
        queryParams.append("rank", filterRank);
      }

      const response = await fetch(
        `/api/admin/game-accounts?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu tài khoản game");
      }

      const data = await response.json();

      setProducts(data.data || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
      console.error("Error fetching game accounts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterRank, filterStatus]);

  // Xử lý thay đổi trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Xử lý thay đổi sắp xếp - áp dụng trên client do server không hỗ trợ
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    // Sắp xếp mảng sản phẩm trên client
    const sortedProducts = [...products].sort((a, b) => {
      let valA = a[field as keyof GameAccount];
      let valB = b[field as keyof GameAccount];

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

    setProducts(sortedProducts);
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
    }).format(date);
  };

  // Hiển thị Rank theo màu
  const getRankDisplay = (rank: string) => {
    let color = "";
    let rankText = "";

    switch (rank) {
      case "UNRANKED":
        color = "bg-gray-100 text-gray-800";
        rankText = "Chưa Rank";
        break;
      case "SAT":
        color = "bg-gray-200 text-gray-800";
        rankText = "Sắt";
        break;
      case "DONG":
        color = "bg-amber-100 text-amber-800";
        rankText = "Đồng";
        break;
      case "BAC":
        color = "bg-slate-200 text-slate-800";
        rankText = "Bạc";
        break;
      case "VANG":
        color = "bg-yellow-100 text-yellow-800";
        rankText = "Vàng";
        break;
      case "BACH_KIM":
        color = "bg-cyan-100 text-cyan-800";
        rankText = "Bạch Kim";
        break;
      case "KIM_CUONG":
        color = "bg-blue-100 text-blue-800";
        rankText = "Kim Cương";
        break;
      case "CAO_THU":
        color = "bg-purple-100 text-purple-800";
        rankText = "Cao Thủ";
        break;
      case "DAI_CAO_THU":
        color = "bg-indigo-100 text-indigo-800";
        rankText = "Đại Cao Thủ";
        break;
      case "THACH_DAU":
        color = "bg-red-100 text-red-800";
        rankText = "Thách Đấu";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
        rankText = rank;
    }

    return (
      <Badge variant="outline" className={`${color} font-normal`}>
        {rankText}
      </Badge>
    );
  };

  // Hiển thị trạng thái theo màu
  const getStatusDisplay = (status: string) => {
    let color = "";
    let statusText = "";

    switch (status) {
      case "AVAILABLE":
        color = "bg-green-100 text-green-800";
        statusText = "Có sẵn";
        break;
      case "SOLD":
        color = "bg-red-100 text-red-800";
        statusText = "Đã bán";
        break;
      case "HIDDEN":
        color = "bg-gray-100 text-gray-800";
        statusText = "Ẩn";
        break;
      case "RESERVED":
        color = "bg-yellow-100 text-yellow-800";
        statusText = "Đã đặt";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
        statusText = status;
    }

    return (
      <Badge variant="outline" className={`${color} font-normal`}>
        {statusText}
      </Badge>
    );
  };

  // Xử lý thêm sản phẩm mới
  const handleAddProduct = () => {
    // Trong thực tế, bạn sẽ gọi API để thêm sản phẩm
    const newProductId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    const productToAdd: GameAccount = {
      id: newProductId,
      username: newProduct.username,
      soloRank: newProduct.soloRank,
      flexRank: newProduct.flexRank,
      tftRank: newProduct.tftRank,
      level: newProduct.level,
      blueEssence: newProduct.blueEssence,
      riotPoints: newProduct.riotPoints,
      championCount: newProduct.championCount,
      skinCount: newProduct.skinCount,
      chromaCount: newProduct.chromaCount,
      price: newProduct.price,
      originalPrice: newProduct.originalPrice,
      discount: newProduct.originalPrice
        ? Math.round(
            ((newProduct.originalPrice - newProduct.price) /
              newProduct.originalPrice) *
              100
          )
        : null,
      status: newProduct.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featuredUntil: null,
      viewCount: 0,
      imageUrls: newProduct.imageUrls,
      description: newProduct.description,
    };

    setProducts([...products, productToAdd]);
    setIsAddDialogOpen(false);
    // Reset new product state
    setNewProduct({
      username: "",
      password: "",
      soloRank: "UNRANKED",
      flexRank: "UNRANKED",
      tftRank: "UNRANKED",
      level: 30,
      blueEssence: 0,
      riotPoints: 0,
      championCount: 0,
      skinCount: 0,
      chromaCount: 0,
      price: 0,
      originalPrice: null,
      status: "AVAILABLE",
      description: "",
      imageUrls: [],
    });
  };

  // Xử lý cập nhật sản phẩm
  const handleUpdateProduct = () => {
    if (!selectedProduct) return;

    // Trong thực tế, bạn sẽ gọi API để cập nhật sản phẩm
    const updatedProducts = products.map((product) =>
      product.id === selectedProduct.id ? selectedProduct : product
    );

    setProducts(updatedProducts);
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);

      // Gọi API để xóa sản phẩm
      const response = await fetch(
        `/api/admin/game-accounts/${selectedProduct.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể xóa tài khoản game");
      }

      // Cập nhật danh sách sản phẩm
      fetchProducts();

      // Hiển thị thông báo thành công
      toast({
        title: "Thành công",
        description: "Tài khoản game đã được xóa",
      });
    } catch (error: any) {
      console.error("Error deleting game account:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa tài khoản game",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      setLoading(false);
    }
  };

  // Xử lý xem chi tiết sản phẩm - thêm vào trước handleDeleteProduct
  const handleViewProduct = async (product: GameAccount) => {
    try {
      setIsLoading(true);
      setSelectedProduct(product);

      // Lấy thêm thông tin chi tiết từ API
      const response = await fetch(`/api/admin/game-accounts/${product.id}`);

      if (!response.ok) {
        throw new Error("Không thể tải chi tiết tài khoản game");
      }

      const data = await response.json();
      setSelectedProduct(data);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      console.error("Error fetching game account details:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải chi tiết tài khoản game",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý tài khoản game</h1>
        <Button
          id="admin-add-product-btn"
          onClick={() => router.push("/admin/add-game-account")}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm tài khoản game
        </Button>
      </div>

      {/* Tìm kiếm và lọc */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchProducts();
              }}
            >
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Tìm kiếm tên tài khoản..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="ghost" className="ml-2">
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="ml-1"
                  onClick={fetchProducts}
                  disabled={isLoading}
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={filterRank}
              onValueChange={(value) => {
                setFilterRank(value);
                setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lọc theo rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Rank</SelectItem>
                <SelectItem value="UNRANKED">Chưa Rank</SelectItem>
                <SelectItem value="SAT">Sắt</SelectItem>
                <SelectItem value="DONG">Đồng</SelectItem>
                <SelectItem value="BAC">Bạc</SelectItem>
                <SelectItem value="VANG">Vàng</SelectItem>
                <SelectItem value="BACH_KIM">Bạch Kim</SelectItem>
                <SelectItem value="KIM_CUONG">Kim Cương</SelectItem>
                <SelectItem value="CAO_THU">Cao Thủ</SelectItem>
                <SelectItem value="DAI_CAO_THU">Đại Cao Thủ</SelectItem>
                <SelectItem value="THACH_DAU">Thách Đấu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="AVAILABLE">Có sẵn</SelectItem>
                <SelectItem value="SOLD">Đã bán</SelectItem>
                <SelectItem value="HIDDEN">Ẩn</SelectItem>
                <SelectItem value="RESERVED">Đã đặt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bảng sản phẩm */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("username")}
                  >
                    Tên tài khoản
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead>Solo Rank</TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("level")}
                  >
                    Level
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("skinCount")}
                  >
                    Skins
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    Giá
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    Ngày tạo
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-red-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span>{error}</span>
                      <Button
                        variant="outline"
                        onClick={fetchProducts}
                        className="mt-2"
                      >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Thử lại
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>{product.username}</TableCell>
                    <TableCell>
                      <div className="flex">
                        {getRankDisplay(product.soloRank)}
                      </div>
                    </TableCell>
                    <TableCell>{product.level}</TableCell>
                    <TableCell>{product.skinCount}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatCurrency(product.price)}
                        </div>
                        {product.originalPrice && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatCurrency(product.originalPrice)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        {getStatusDisplay(product.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(product.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                        disabled={isLoading}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="sr-only">Xem</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">Sửa</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="w-4 h-4" />
                        <span className="sr-only">Xóa</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Không tìm thấy sản phẩm phù hợp
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
          Hiển thị{" "}
          {totalItems > 0 ? (currentPage - 1) * productsPerPage + 1 : 0} -{" "}
          {Math.min(currentPage * productsPerPage, totalItems)} trong số{" "}
          {totalItems} sản phẩm
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(i + 1)}
              disabled={isLoading}
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
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dialog xem chi tiết sản phẩm */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết tài khoản game</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  {selectedProduct.imageUrls &&
                  selectedProduct.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProduct.imageUrls.map((url, index) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`Game account ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 bg-gray-100 flex items-center justify-center rounded-lg">
                      <p className="text-gray-500">Không có hình ảnh</p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between">
                    <div>
                      <p className="text-lg font-semibold">
                        {formatCurrency(Number(selectedProduct.price))}
                      </p>
                      {selectedProduct.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatCurrency(
                            Number(selectedProduct.originalPrice)
                          )}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Trạng thái:</p>
                      <div className="mt-1">
                        {getStatusDisplay(selectedProduct.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-1/2">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                      <TabsTrigger value="details">
                        Thông tin chi tiết
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic" className="pt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">ID:</p>
                          <p className="font-medium">{selectedProduct.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Tên tài khoản:
                          </p>
                          <p className="font-medium">
                            {selectedProduct.username}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ngày tạo:</p>
                          <p className="font-medium">
                            {selectedProduct.createdAt
                              ? formatDate(selectedProduct.createdAt)
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Lượt xem:</p>
                          <p className="font-medium">
                            {selectedProduct.viewCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Solo Rank:</p>
                          <div className="font-medium">
                            {getRankDisplay(
                              selectedProduct.soloRank || "UNRANKED"
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Flex Rank:</p>
                          <div className="font-medium">
                            {getRankDisplay(
                              selectedProduct.flexRank || "UNRANKED"
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">TFT Rank:</p>
                          <div className="font-medium">
                            {getRankDisplay(
                              selectedProduct.tftRank || "UNRANKED"
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Level:</p>
                          <p className="font-medium">
                            {selectedProduct.level || 0}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="details" className="pt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Số tướng:</p>
                          <p className="font-medium">
                            {selectedProduct.championCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Số trang phục:
                          </p>
                          <p className="font-medium">
                            {selectedProduct.skinCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Số chroma:</p>
                          <p className="font-medium">
                            {selectedProduct.chromaCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Blue Essence:</p>
                          <p className="font-medium">
                            {selectedProduct.blueEssence || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Riot Points:</p>
                          <p className="font-medium">
                            {selectedProduct.riotPoints || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Đặc trưng đến:
                          </p>
                          <p className="font-medium">
                            {selectedProduct.featuredUntil
                              ? formatDate(selectedProduct.featuredUntil)
                              : "Không"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Mô tả</h3>
                <div className="bg-gray-50 p-3 rounded">
                  {selectedProduct.description || "Không có mô tả"}
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
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                setIsEditDialogOpen(true);
              }}
            >
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm/sửa sản phẩm sẽ thêm sau vì quá dài */}
      {/* Dialog xóa sản phẩm */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa tài khoản game</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản game này không? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="py-4">
              <p>
                <strong>ID:</strong> {selectedProduct.id}
              </p>
              <p>
                <strong>Tên tài khoản:</strong> {selectedProduct.username}
              </p>
              <p>
                <strong>Rank:</strong> {selectedProduct.soloRank}
              </p>
              <p>
                <strong>Giá:</strong> {formatCurrency(selectedProduct.price)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang xóa...
                </>
              ) : (
                "Xóa tài khoản game"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
