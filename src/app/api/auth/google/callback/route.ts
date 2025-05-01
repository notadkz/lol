import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Lấy authorization code từ URL
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Nếu có lỗi từ Google
    if (error) {
      console.error("Lỗi Google OAuth:", error);
      return NextResponse.redirect(
        new URL("/login?error=oauth_error", req.url)
      );
    }

    // Nếu không có code
    if (!code) {
      console.error("Không nhận được authorization code");
      return NextResponse.redirect(new URL("/login?error=no_code", req.url));
    }

    // Thay vì kiểm tra session, hãy chuyển hướng người dùng đến NextAuth API
    // với code từ Google
    const callbackUrl = "/dashboard"; // URL để chuyển hướng sau khi đăng nhập thành công
    return NextResponse.redirect(
      new URL(
        `/api/auth/callback/google?code=${code}&callbackUrl=${encodeURIComponent(
          callbackUrl
        )}`,
        req.url
      )
    );
  } catch (error) {
    console.error("Lỗi xử lý callback:", error);
    return NextResponse.redirect(
      new URL("/login?error=callback_error", req.url)
    );
  }
}
