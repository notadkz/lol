import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  checkRateLimit,
  loginRateLimit,
  forgotPasswordRateLimit,
} from "./src/lib/rate-limit";
import csrf from "edge-csrf";

// Thiết lập CSRF middleware với các tùy chọn
const csrfProtect = csrf({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  },
});

export async function middleware(req: NextRequest) {
  // Tạo response ban đầu
  const response = NextResponse.next();

  // Kiểm tra CSRF token
  const csrfError = await csrfProtect(req, response);

  // Nếu lỗi CSRF và không phải là phương thức GET, HEAD, OPTIONS
  if (csrfError && !["GET", "HEAD", "OPTIONS"].includes(req.method || "")) {
    return new NextResponse(
      JSON.stringify({
        error: "Invalid CSRF token",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Lấy token từ cookie (xử lý bởi NextAuth)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Lấy đường dẫn hiện tại
  const { pathname } = req.nextUrl;

  // Rate limiting cho các endpoints xác thực
  if (pathname === "/api/auth/callback/credentials" && req.method === "POST") {
    const result = checkRateLimit(
      req,
      "login",
      loginRateLimit.maxRequests,
      loginRateLimit.windowMs
    );

    if (result.limited) {
      return new NextResponse(
        JSON.stringify({
          error: `Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${result.timeRemaining} giây.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.timeRemaining),
          },
        }
      );
    }
  }

  if (pathname === "/api/auth/forgot-password" && req.method === "POST") {
    const result = checkRateLimit(
      req,
      "forgot-password",
      forgotPasswordRateLimit.maxRequests,
      forgotPasswordRateLimit.windowMs
    );

    if (result.limited) {
      return new NextResponse(
        JSON.stringify({
          error: `Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau ${result.timeRemaining} giây.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.timeRemaining),
          },
        }
      );
    }
  }

  // Nếu không có token và đường dẫn nằm trong danh sách cần bảo vệ
  if (!token) {
    const protectedRoutes = [
      "/products",
      "/profile",
      "/admin",
      "/dashboard",
      "/account",
    ];

    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// Chỉ áp dụng middleware cho các routes cần bảo vệ và API endpoints quan trọng
export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/user/:path*",
    "/api/products/:path*",
    "/api/admin/:path*",
    "/products/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/account/:path*",
  ],
};
