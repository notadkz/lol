import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/admin/users/stats - Lấy thống kê về người dùng
export async function GET(req: NextRequest) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Bạn không có quyền truy cập" },
        { status: 401 }
      );
    }

    // Tổng số người dùng
    const total = await prisma.user.count({
      where: {
        isAdmin: false, // Chỉ đếm người dùng thường, không đếm admin
      },
    });

    // Số người dùng đang hoạt động (đã xác thực email)
    const active = await prisma.user.count({
      where: {
        emailVerified: { not: null },
        isAdmin: false,
      },
    });

    // Số người dùng premium
    const premium = await prisma.user.count({
      where: {
        accountType: "PREMIUM",
        isAdmin: false,
      },
    });

    // Số người dùng VIP
    const vip = await prisma.user.count({
      where: {
        accountType: "VIP",
        isAdmin: false,
      },
    });

    // Số người dùng đã xác thực
    const verifiedUsers = await prisma.user.count({
      where: {
        emailVerified: { not: null },
        isAdmin: false,
      },
    });

    // Người dùng mới trong ngày hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
        isAdmin: false,
      },
    });

    // Thêm thống kê về số dư trung bình của người dùng
    const balanceStats = await prisma.user.aggregate({
      _avg: {
        balance: true,
      },
      _sum: {
        balance: true,
      },
      where: {
        isAdmin: false,
      },
    });

    // Thống kê theo loại tài khoản
    const accountTypeDistribution = await prisma.$queryRaw`
      SELECT accountType, COUNT(*) as count
      FROM User
      WHERE isAdmin = 0
      GROUP BY accountType
    `;

    return NextResponse.json({
      total,
      active,
      premium,
      vip,
      newUsersToday,
      verifiedUsers,
      avgBalance: balanceStats._avg.balance || 0,
      totalBalance: balanceStats._sum.balance || 0,
      accountTypeDistribution,
    });
  } catch (error: any) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
