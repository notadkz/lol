import { NextResponse } from "next/server";

export async function GET() {
  // Kiểm tra các biến môi trường cần thiết
  const envCheck = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
      ? "✅ Đã thiết lập"
      : "❌ Chưa thiết lập",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
      ? "✅ Đã thiết lập"
      : "❌ Chưa thiết lập",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
      ? "✅ Đã thiết lập"
      : "❌ Chưa thiết lập",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
      ? "✅ Đã thiết lập"
      : "❌ Chưa thiết lập",
    NODE_ENV: process.env.NODE_ENV || "development",
  };

  // Trả về kết quả kiểm tra
  return NextResponse.json({
    message: "Kiểm tra biến môi trường",
    envCheck,
    base_url: process.env.NEXTAUTH_URL?.startsWith("http")
      ? "✅ Có protocol (http/https)"
      : "❌ Thiếu protocol",
  });
}
