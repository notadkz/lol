import { notFound } from "next/navigation";
import ProductDetail from "@/components/products/product-detail";
import type { Product } from "@/lib/types/product";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  try {
    // Sử dụng fetch để gọi API chi tiết sản phẩm theo ID
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/products/${id}`,
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

    if (!data.product) {
      console.error("Dữ liệu không tìm thấy:", data);
      return null;
    }

    return data.product;
  } catch (error) {
    console.error("Error in getProduct:", error);
    throw error;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const product = await getProduct(params.id);

    if (!product) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-24 mt-10">
        <ProductDetail product={product} />
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
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}
