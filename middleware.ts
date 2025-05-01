import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Lấy token từ cookie (xử lý bởi NextAuth)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Lấy đường dẫn hiện tại
  const { pathname } = req.nextUrl;

  // Nếu không có token và đường dẫn nằm trong danh sách cần bảo vệ
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các routes cần bảo vệ
export const config = {
  matcher: [
    "/products/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    // Thêm các đường dẫn khác cần bảo vệ tại đây
  ],
};
