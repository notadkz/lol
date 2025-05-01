import { useState, useEffect } from "react";
import type { Product } from "@/lib/types/product";
import { fetchFeaturedAccounts } from "@/lib/api";

export function useFeaturedAccounts(limit: number = 4) {
  const [accounts, setAccounts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFeaturedAccounts = async () => {
      try {
        setIsLoading(true);

        const response = await fetchFeaturedAccounts(limit);

        // Log chi tiết cấu trúc response để debug
        console.log("Response từ API featured:", response);
        console.log(
          "Kiểu dữ liệu của response.data:",
          response.data ? typeof response.data : "undefined"
        );
        console.log(
          "response.data có phải array không:",
          Array.isArray(response.data)
        );

        // Chi tiết hơn về cấu trúc dữ liệu
        if (response.data) {
          if (
            typeof response.data === "object" &&
            !Array.isArray(response.data)
          ) {
            console.log(
              "Keys của response.data featured:",
              Object.keys(response.data)
            );
          }
        }

        // Kiểm tra cấu trúc dữ liệu
        if (!response.data) {
          console.warn("API trả về dữ liệu rỗng (response.data là nullish)");
          setAccounts([]);
          return;
        }

        // Nếu response.data là array, xử lý bình thường
        if (Array.isArray(response.data)) {
          console.log("API response data là array, đang xử lý:", response.data);
          formatAndSetAccounts(response.data);
          return;
        }

        // Kiểm tra nếu response.data có trường products (ưu tiên cao nhất)
        if (
          response.data &&
          typeof response.data === "object" &&
          "products" in response.data &&
          Array.isArray(response.data.products)
        ) {
          console.log(
            "Tìm thấy mảng products trong response.data featured, sử dụng nó"
          );
          formatAndSetAccounts(response.data.products);
          return;
        }

        // Kiểm tra xem response.data có phải array không
        console.warn(
          "Cấu trúc dữ liệu API featured không theo chuẩn, đang thử phục hồi..."
        );

        // Nếu response.data có trường items và items là array, sử dụng items
        if (
          response.data &&
          typeof response.data === "object" &&
          "items" in response.data &&
          Array.isArray(response.data.items)
        ) {
          console.log(
            "Tìm thấy mảng items trong response.data featured, sử dụng nó thay thế"
          );
          const items = response.data.items;
          formatAndSetAccounts(items);
          return;
        }

        // Nếu response.data là object và có một số key là array, thử dùng key đầu tiên là array
        if (response.data && typeof response.data === "object") {
          const keys = Object.keys(response.data);
          for (const key of keys) {
            if (Array.isArray(response.data[key])) {
              console.log(
                `Tìm thấy mảng trong response.data.${key} featured, sử dụng nó thay thế`
              );
              formatAndSetAccounts(response.data[key]);
              return;
            }
          }
        }

        // Không tìm thấy mảng nào có thể sử dụng
        console.error(
          "Không thể phục hồi dữ liệu featured, không tìm thấy mảng nào trong response"
        );
        setAccounts([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        console.error("Error fetching featured accounts:", err);
        setAccounts([]); // Reset accounts để không hiển thị dữ liệu mẫu
      } finally {
        setIsLoading(false);
      }
    };

    getFeaturedAccounts();
  }, [limit]);

  // Hàm định dạng và cập nhật tài khoản
  function formatAndSetAccounts(accountsData: any[]) {
    // Log chi tiết trạng thái của mỗi tài khoản
    accountsData.forEach((account) => {
      console.log(`Tài khoản #${account.id} - status API:`, account.status);
    });

    // Chuyển đổi dữ liệu từ API sang định dạng Product
    const formattedAccounts: Product[] = accountsData.map((account: any) => {
      // Xác định trạng thái dựa trên trường status từ API
      let productStatus: "available" | "sold" = "available";

      // Kiểm tra chính xác giá trị từ API và log để debug
      if (account.status) {
        console.log(
          `Phân tích trạng thái cho tài khoản #${account.id}:`,
          account.status
        );

        // Kiểm tra các trường hợp có thể có của trạng thái
        if (typeof account.status === "string") {
          const statusUppercase = account.status.toUpperCase();
          if (statusUppercase === "AVAILABLE") {
            productStatus = "available";
          } else if (
            statusUppercase === "SOLD" ||
            statusUppercase === "UNAVAILABLE" ||
            statusUppercase === "RESERVED"
          ) {
            productStatus = "sold";
          }

          console.log(
            `Kết quả phân tích: ${account.status} -> ${productStatus}`
          );
        } else {
          console.warn(
            `Trạng thái tài khoản #${account.id} không phải string:`,
            account.status
          );
        }
      } else {
        console.warn(
          `Tài khoản #${account.id} không có trường status, mặc định là available`
        );
      }

      return {
        id: account.id?.toString() || "",
        name: `Tài khoản #${account.id || ""}`,
        level: account.level || 30,
        skins: account.skinCount || 0,
        blueEssence: account.blueEssence || 0,
        orangeEssence: 0, // Không có trong API, mặc định là 0
        rp: account.riotPoints || 0,
        tftPets: account.tftRank === "UNRANKED" ? 0 : 5, // Giả định mỗi tài khoản có linh thú TFT
        price: account.price || 0,
        status: productStatus, // Sử dụng trạng thái đã được xác định
        images: account.images || ["/placeholder.svg?height=200&width=300"],
        description: account.description || "",
        rank: convertRankToVietnamese(
          account.ranks && account.ranks.length > 0
            ? account.ranks[0]
            : "UNRANKED"
        ),
        champions: account.championCount || 0,
        featured: true,
      };
    });

    console.log("Formatted featured accounts:", formattedAccounts);
    setAccounts(formattedAccounts);
  }

  // Hàm chuyển đổi rank tiếng Anh sang tiếng Việt
  function convertRankToVietnamese(rank: string): string {
    const rankMap: Record<string, string> = {
      UNRANKED: "Chưa xếp hạng",
      SAT: "Sắt",
      DONG: "Đồng",
      BAC: "Bạc",
      VANG: "Vàng",
      BACH_KIM: "Bạch Kim",
      KIM_CUONG: "Kim Cương",
      CAO_THU: "Cao Thủ",
      DAI_CAO_THU: "Đại Cao Thủ",
      THACH_DAU: "Thách Đấu",
    };

    return rankMap[rank] || rank;
  }

  return { accounts, isLoading, error };
}
