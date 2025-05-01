"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, useToast } from "@/components/ui/use-toast";
import { Info, Plus, X, Upload, ArrowLeft } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
}

interface GameAccount {
  username: string;
  password: string;
  email?: string;
  emailPassword?: string;
  solorank?: string;
  flexrank?: string;
  tftrank?: string;
  level?: number;
  blueEssence?: number;
  riotPoints?: number;
  championCount?: number;
  skinCount?: number;
  chromaCount?: number;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  status?: string;
  description?: string;
  images?: string;
  isFeatured?: boolean;
  featuredUntil?: Date;
  sellerId?: string;
}

const AddGameAccountPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // State cho form
  const [formData, setFormData] = useState<GameAccount>({
    username: "",
    password: "",
    email: "",
    emailPassword: "",
    solorank: "NONE",
    flexrank: "NONE",
    tftrank: "NONE",
    level: 30,
    blueEssence: 0,
    riotPoints: 0,
    championCount: 0,
    skinCount: 0,
    chromaCount: 0,
    price: 0,
    originalPrice: 0,
    salePrice: 0,
    status: "AVAILABLE",
    description: "",
    images: "[]",
    isFeatured: false,
    sellerId: "",
  });

  // State cho ảnh
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");

  // Lấy danh sách người dùng để gán là người bán
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch("/api/admin/users?limit=50");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách người dùng",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Định nghĩa các tùy chọn rank cho Select
  const rankOptions = [
    { value: "SAT", label: "Sắt (Iron)" },
    { value: "DONG", label: "Đồng (Bronze)" },
    { value: "BAC", label: "Bạc (Silver)" },
    { value: "VANG", label: "Vàng (Gold)" },
    { value: "BACH_KIM", label: "Bạch Kim (Platinum)" },
    { value: "KIM_CUONG", label: "Kim Cương (Diamond)" },
    { value: "CAO_THU", label: "Cao Thủ (Master)" },
    { value: "DAI_CAO_THU", label: "Đại Cao Thủ (Grandmaster)" },
    { value: "THACH_DAU", label: "Thách Đấu (Challenger)" },
  ];

  // Xử lý thêm URL ảnh
  const handleAddImageUrl = () => {
    if (imageInput.trim() !== "") {
      // Thêm URL vào mảng imageUrls cho UI
      const newImageUrls = [...imageUrls, imageInput.trim()];
      setImageUrls(newImageUrls);

      // Chuyển đổi mảng thành chuỗi JSON để lưu vào formData
      setFormData({
        ...formData,
        images: JSON.stringify(newImageUrls),
      });

      setImageInput("");
    }
  };

  // Xử lý xóa URL ảnh
  const handleRemoveImageUrl = (index: number) => {
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);

    // Cập nhật formData với chuỗi JSON mới
    setFormData({
      ...formData,
      images: JSON.stringify(newImageUrls),
    });
  };

  // Xử lý thay đổi input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Xử lý thay đổi input số
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === "" ? 0 : parseFloat(value),
    });
  };

  // Xử lý thay đổi checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Xử lý gửi form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate dữ liệu
      if (!formData.username || !formData.password || !formData.price) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ các thông tin bắt buộc",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Tạo mảng ranks với cấu trúc mới
      const rankObjects: Array<{ type: string; value: string }> = [];

      // Kiểm tra và thêm các rank vào mảng
      const soloRankValue = formData.solorank || "NONE";
      const flexRankValue = formData.flexrank || "NONE";
      const tftRankValue = formData.tftrank || "NONE";

      if (soloRankValue !== "NONE") {
        rankObjects.push({ type: "SOLO", value: soloRankValue });
      }
      if (flexRankValue !== "NONE") {
        rankObjects.push({ type: "FLEX", value: flexRankValue });
      }
      if (tftRankValue !== "NONE") {
        rankObjects.push({ type: "TFT", value: tftRankValue });
      }

      // Tạo mảng ranks thông thường cũng để gửi đi
      const ranksArray: string[] = rankObjects.map((r) => r.value);

      // Tạo bản sao của formData và loại bỏ các trường không cần thiết
      const { solorank, flexrank, tftrank, ...restFormData } = formData;

      // Đảm bảo images là chuỗi JSON hợp lệ
      const imagesJSON = formData.images || "[]";

      // Thêm log để debug
      console.log("Images string trước khi gửi:", imagesJSON);
      try {
        const parsedImages = JSON.parse(imagesJSON);
        console.log("Images sau khi parse:", parsedImages);
      } catch (err) {
        console.error("Lỗi khi parse images JSON:", err);
      }

      // Chuyển chuỗi JSON thành mảng JavaScript trước khi gửi đi
      const imagesArray = JSON.parse(imagesJSON);

      // Tạo dữ liệu gửi đi với nhiều định dạng rank khác nhau
      const submitData = {
        ...restFormData,
        // Đổi tên trường để khớp với backend
        images: imagesArray, // Gửi dưới dạng mảng JavaScript
        imageUrls: imagesJSON, // Thêm trường imageUrls dạng chuỗi JSON
        // Chuyển đổi các giá trị số
        level: Number(formData.level || 0),
        price: Number(formData.price || 0),
        originalPrice: formData.originalPrice
          ? Number(formData.originalPrice)
          : undefined,
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        blueEssence: Number(formData.blueEssence || 0),
        riotPoints: Number(formData.riotPoints || 0),
        championCount: Number(formData.championCount || 0),
        skinCount: Number(formData.skinCount || 0),
        chromaCount: Number(formData.chromaCount || 0),
        // Gửi rank theo nhiều định dạng khác nhau
        ranks: ranksArray.length > 0 ? ranksArray : undefined,
        ranksDetailed: rankObjects.length > 0 ? rankObjects : undefined,
        // Thử thêm một số biến thể khác
        ranksList: ranksArray.length > 0 ? ranksArray.join(",") : undefined,
        ranksObject:
          rankObjects.length > 0
            ? {
                solo: soloRankValue !== "NONE" ? soloRankValue : undefined,
                flex: flexRankValue !== "NONE" ? flexRankValue : undefined,
                tft: tftRankValue !== "NONE" ? tftRankValue : undefined,
              }
            : undefined,
      };

      console.log("Submitting data:", JSON.stringify(submitData, null, 2));

      // Gửi API request
      const response = await fetch("/api/admin/game-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      // Log response text để xem chính xác response
      const responseText = await response.text();
      console.log("API Response (raw text):", responseText);

      // Parse response
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("API Response (parsed):", responseData);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Phản hồi từ server không hợp lệ");
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Không thể tạo tài khoản game");
      }

      // Thêm log để kiểm tra dữ liệu trả về
      console.log("Created game account:", responseData.data);
      if (responseData.data && responseData.data.ranks) {
        console.log("Ranks in response:", responseData.data.ranks);
      }

      toast({
        title: "Thành công",
        description: "Tài khoản game đã được tạo thành công",
      });

      // Chuyển hướng về trang danh sách tài khoản game
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Error creating game account:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo tài khoản game",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Thêm tài khoản game mới</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thông tin đăng nhập */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đăng nhập</CardTitle>
              <CardDescription>
                Nhập thông tin đăng nhập của tài khoản game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (tùy chọn)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPassword">Mật khẩu email (tùy chọn)</Label>
                <Input
                  id="emailPassword"
                  name="emailPassword"
                  type="password"
                  placeholder="Nhập mật khẩu email"
                  value={formData.emailPassword}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Thông tin tài khoản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>
                Nhập thông tin chi tiết về tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="level">Cấp độ</Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  min="1"
                  placeholder="Nhập cấp độ"
                  value={formData.level}
                  onChange={handleNumberInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Thứ hạng đơn đấu (Solo/Duo)</Label>
                <Select
                  defaultValue={formData.solorank}
                  onValueChange={(value) =>
                    setFormData({ ...formData, solorank: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thứ hạng đơn đấu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Không có</SelectItem>
                    {rankOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Thứ hạng linh hoạt (Flex)</Label>
                <Select
                  defaultValue={formData.flexrank}
                  onValueChange={(value) =>
                    setFormData({ ...formData, flexrank: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thứ hạng linh hoạt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Không có</SelectItem>
                    {rankOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Thứ hạng Đấu Trường Chân Lý (TFT)</Label>
                <Select
                  defaultValue={formData.tftrank}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tftrank: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thứ hạng TFT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Không có</SelectItem>
                    {rankOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  defaultValue={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Có sẵn</SelectItem>
                    <SelectItem value="SOLD">Đã bán</SelectItem>
                    <SelectItem value="RESERVED">Đã đặt trước</SelectItem>
                    <SelectItem value="UNAVAILABLE">Không khả dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isFeatured: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="isFeatured">
                    Đánh dấu là tài khoản nổi bật
                  </Label>
                </div>
              </div>

              {formData.isFeatured && (
                <div className="space-y-2">
                  <Label htmlFor="featuredUntil">Nổi bật đến ngày</Label>
                  <Input
                    id="featuredUntil"
                    name="featuredUntil"
                    type="date"
                    value={
                      formData.featuredUntil
                        ? new Date(formData.featuredUntil)
                            .toISOString()
                            .slice(0, 10)
                        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .slice(0, 10)
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredUntil: new Date(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="blueEssence">Blue Essence</Label>
                <Input
                  id="blueEssence"
                  name="blueEssence"
                  type="number"
                  min="0"
                  placeholder="Nhập Blue Essence"
                  value={formData.blueEssence}
                  onChange={handleNumberInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="riotPoints">Riot Points</Label>
                <Input
                  id="riotPoints"
                  name="riotPoints"
                  type="number"
                  min="0"
                  placeholder="Nhập Riot Points"
                  value={formData.riotPoints}
                  onChange={handleNumberInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="championCount">Champion Count</Label>
                <Input
                  id="championCount"
                  name="championCount"
                  type="number"
                  min="0"
                  placeholder="Nhập Champion Count"
                  value={formData.championCount}
                  onChange={handleNumberInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skinCount">Skin Count</Label>
                <Input
                  id="skinCount"
                  name="skinCount"
                  type="number"
                  min="0"
                  placeholder="Nhập Skin Count"
                  value={formData.skinCount}
                  onChange={handleNumberInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chromaCount">Chroma Count</Label>
                <Input
                  id="chromaCount"
                  name="chromaCount"
                  type="number"
                  min="0"
                  placeholder="Nhập Chroma Count"
                  value={formData.chromaCount}
                  onChange={handleNumberInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Thông tin giá */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giá</CardTitle>
              <CardDescription>
                Nhập thông tin giá cho tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Giá bán <span className="text-red-500">*</span>
                </Label>
                <div className="flex">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    placeholder="Nhập giá bán"
                    value={formData.price || ""}
                    onChange={handleNumberInputChange}
                    required
                  />
                  <span className="ml-2 flex items-center">VNĐ</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">Giá gốc (tùy chọn)</Label>
                <div className="flex">
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    min="0"
                    placeholder="Nhập giá gốc"
                    value={formData.originalPrice || ""}
                    onChange={handleNumberInputChange}
                  />
                  <span className="ml-2 flex items-center">VNĐ</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Giá khuyến mãi (tùy chọn)</Label>
                <div className="flex">
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    min="0"
                    placeholder="Nhập giá khuyến mãi"
                    value={formData.salePrice || ""}
                    onChange={handleNumberInputChange}
                  />
                  <span className="ml-2 flex items-center">VNĐ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mô tả và hình ảnh */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả và hình ảnh</CardTitle>
              <CardDescription>
                Thêm mô tả và hình ảnh cho tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Nhập mô tả chi tiết về tài khoản"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập URL hình ảnh"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddImageUrl}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Thêm
                  </Button>
                </div>

                {imageUrls.length > 0 && (
                  <div className="mt-4">
                    <Label>Danh sách hình ảnh:</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted p-2 rounded"
                        >
                          <div className="truncate max-w-[200px]">{url}</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveImageUrl(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thông tin người bán */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Thông tin người bán</CardTitle>
              <CardDescription>
                Chọn người bán cho tài khoản này (tùy chọn)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="sellerId">Người bán</Label>
                <Select
                  value={formData.sellerId || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      sellerId: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người bán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn (Admin)</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Đang xử lý...
              </>
            ) : (
              "Thêm tài khoản game"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddGameAccountPage;
