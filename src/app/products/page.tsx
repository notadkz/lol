import ProductList from "@/components/products/product-list";
import type { Product } from "@/lib/types/product";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

async function getProducts() {
  try {
    // Sử dụng fetch để gọi API danh sách sản phẩm
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/products`,
      {
        cache: "no-store", // Luôn lấy dữ liệu mới nhất
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("API Error:", await res.text());
      throw new Error(
        `Không thể lấy dữ liệu tài khoản - Status: ${res.status}`
      );
    }

    const data = await res.json();

    if (!data.products || !Array.isArray(data.products)) {
      console.error("Dữ liệu không đúng định dạng:", data);
      throw new Error("Dữ liệu API không đúng định dạng");
    }

    return data.products;
  } catch (error) {
    console.error("Error in getProducts:", error);
    throw error;
  }
}

export default async function ProductsPage() {
  try {
    // Lấy dữ liệu từ API
    const products = await getProducts();

    return (
      <div className="container mx-auto px-4 py-24 mt-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Tài khoản Liên Minh Huyền Thoại
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá bộ sưu tập tài khoản Liên Minh Huyền Thoại đa dạng từ Bạch
            Kim đến Thách Đấu.
          </p>
        </div>

        {products.length > 0 ? (
          <ProductList products={products} />
        ) : (
          <div className="text-center py-8">
            <Alert className="max-w-md mx-auto">
              <AlertTitle>Không có sản phẩm</AlertTitle>
              <AlertDescription>
                Hiện tại không có tài khoản nào đang được bán.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-24 mt-10">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Lỗi khi tải dữ liệu</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Không thể kết nối đến máy chủ"}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md"
          >
            <RefreshCw className="h-4 w-4" /> Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}
