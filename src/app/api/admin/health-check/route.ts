import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Kiểm tra kết nối đến database
    const dbStatus = await prisma.$queryRaw`SELECT 1 as connected`;

    return NextResponse.json({
      status: "ok",
      message: "API đang hoạt động",
      database: (dbStatus as any)[0]?.connected === 1 ? "connected" : "error",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Có lỗi xảy ra khi kết nối đến database",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
