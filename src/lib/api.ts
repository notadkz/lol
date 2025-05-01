/**
 * Tiện ích hỗ trợ gọi API và xử lý dữ liệu theo chuẩn
 */

// Kiểu dữ liệu response API tiêu chuẩn
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
  page?: number;
  total?: number;
  totalPages?: number;
}

// Hàm gọi API với xử lý lỗi và kiểm tra cấu trúc
export async function fetchApi<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    console.log("Gọi API:", url);

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    console.log("API trả về dữ liệu gốc:", rawData);

    // Kiểm tra response rỗng
    if (!rawData) {
      console.error("API trả về dữ liệu rỗng hoặc null");
      return { data: [] as unknown as T };
    }

    // Kiểm tra cấu trúc response có trường data là array không
    if ("data" in rawData && Array.isArray(rawData.data)) {
      console.log("API trả về cấu trúc chuẩn với data là array");
      return rawData as ApiResponse<T>;
    }

    // Kiểm tra nếu chính rawData là array
    if (Array.isArray(rawData)) {
      console.log("API trả về trực tiếp một array, đang wrap vào trường data");
      return {
        data: rawData as unknown as T,
      };
    }

    // Nếu rawData.data tồn tại nhưng không phải array
    if ("data" in rawData) {
      console.warn(
        "API trả về trường data nhưng không phải array:",
        typeof rawData.data
      );

      // Nếu data là object rỗng hoặc giá trị vô nghĩa, trả về array rỗng
      if (
        !rawData.data ||
        typeof rawData.data !== "object" ||
        Object.keys(rawData.data).length === 0
      ) {
        console.warn("Trường data trống hoặc không hợp lệ, trả về array rỗng");
        return { data: [] as unknown as T };
      }

      // Trả về nguyên trạng, hooks sẽ phải xử lý thêm
      return rawData as ApiResponse<T>;
    }

    // Trường hợp khác: wrap rawData vào trường data
    console.warn("API không trả về cấu trúc chuẩn, đang wrap vào trường data");
    return {
      data: rawData as unknown as T,
    };
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return { data: [] as unknown as T };
  }
}

// Hàm lấy dữ liệu tài khoản mới nhất
export async function fetchLatestAccounts(limit: number = 4) {
  const url = `/api/products?limit=${limit}&sortBy=createdAt&sortOrder=desc&status=AVAILABLE`;
  console.log("Đang gọi API tài khoản mới nhất:", url);
  return fetchApi(url);
}

// Hàm lấy dữ liệu tài khoản nổi bật
export async function fetchFeaturedAccounts(limit: number = 4) {
  // Thêm cờ debug=true để hiển thị thông tin chi tiết hơn từ API endpoint
  const url = `/api/products?limit=${limit}&featured=true&status=AVAILABLE&debug=true`;
  console.log("Đang gọi API tài khoản nổi bật:", url);

  try {
    const result = await fetchApi(url);

    // Log thông tin chi tiết về tài khoản nổi bật nhận được
    console.log("=== CHI TIẾT TÀI KHOẢN NỔI BẬT ===");
    console.log(
      "Đã nhận:",
      result.data
        ? Array.isArray(result.data)
          ? result.data.length
          : "không phải array"
        : "không có data"
    );

    // Kiểm tra cấu trúc dữ liệu
    if (result.data && Array.isArray(result.data)) {
      // Log trạng thái của từng tài khoản để debug
      result.data.forEach((account: any, index: number) => {
        console.log(`Tài khoản #${index + 1}:`, {
          id: account.id,
          status: account.status,
          featured: account.featured || account.isFeatured,
        });
      });
    }

    return result;
  } catch (error) {
    console.error("Lỗi khi lấy tài khoản nổi bật:", error);
    throw error;
  }
}

// Hàm lấy chi tiết tài khoản
export async function fetchAccountDetail(id: string | number) {
  const url = `/api/products/${id}`;
  console.log("Đang gọi API chi tiết tài khoản:", url);
  return fetchApi(url);
}

// Hàm lấy danh sách tài khoản với các tùy chọn tìm kiếm
export interface AccountsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  ranks?: string[];
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  featured?: boolean;
}

export async function fetchAccounts(params: AccountsQueryParams = {}) {
  const queryParams = new URLSearchParams();

  // Thêm các tham số vào URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const url = `/api/products?${queryParams.toString()}`;
  console.log("Đang gọi API danh sách tài khoản:", url);
  return fetchApi(url);
}
