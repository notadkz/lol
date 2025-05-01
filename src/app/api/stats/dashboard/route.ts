import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { User, Order } from "@prisma/client";

interface MonthlyRevenue {
  month: number;
  revenue: number | string;
}

interface OrderWithBuyer extends Order {
  buyer: {
    name: string;
  };
}

interface UserWithTimestamp extends Pick<User, "id" | "name" | "email"> {
  createdAt: Date;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Kiểm tra xác thực và quyền admin
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Lấy dữ liệu tổng quan
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.gameAccount.count(),
      prisma.order.count(),
      prisma.order.count({
        where: { status: "PENDING" },
      }),
      prisma.gameAccount.count({
        where: { status: "AVAILABLE" },
      }),
    ]);

    // 2. Tính tổng doanh thu
    const revenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: "COMPLETED",
      },
    });

    // 3. Lấy dữ liệu doanh thu theo tháng
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // 1/1/năm hiện tại
    const endDate = new Date(currentYear, 11, 31); // 31/12/năm hiện tại

    const revenueByMonth = await prisma.$queryRaw<MonthlyRevenue[]>`
      SELECT EXTRACT(MONTH FROM "createdAt") as month, SUM("totalAmount") as revenue
      FROM "Order"
      WHERE "status" = 'COMPLETED'
      AND "createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY EXTRACT(MONTH FROM "createdAt")
      ORDER BY month
    `;

    // 4. Lấy dữ liệu đơn hàng theo trạng thái
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // 5. Lấy dữ liệu sản phẩm theo rank
    const productsByRank = await prisma.gameAccount.groupBy({
      by: ["soloRank"],
      _count: {
        id: true,
      },
      where: {
        status: "AVAILABLE",
      },
    });

    // 6. Lấy hoạt động gần đây
    const recentUsers = await prisma.user.findMany({
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        buyerId: true,
        createdAt: true,
        buyer: {
          select: {
            name: true,
          },
        },
      },
    });

    // Chuyển đổi dữ liệu hoạt động gần đây
    const recentActivities = [
      ...recentUsers.map((user: UserWithTimestamp) => ({
        id: user.id,
        type: "user" as const,
        title: "Người dùng mới đăng ký",
        description: user.email,
        timestamp: user.createdAt.toISOString(),
      })),
      ...recentOrders.map((order: OrderWithBuyer) => ({
        id: order.id,
        type: "order" as const,
        title: "Đơn hàng mới",
        description: `Đơn hàng #${order.id} từ ${order.buyer.name}`,
        timestamp: order.createdAt.toISOString(),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);

    // Chuyển đổi dữ liệu doanh thu
    const revenueData = Array.from({ length: 12 }, (_, i) => {
      const monthData = revenueByMonth.find(
        (item: MonthlyRevenue) => Number(item.month) === i + 1
      );
      return {
        month: i + 1,
        revenue: monthData ? Number(monthData.revenue) : 0,
      };
    });

    // Chuyển đổi dữ liệu trạng thái đơn hàng
    const orderStatusData = ordersByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // Chuyển đổi dữ liệu sản phẩm theo rank
    const productRankData = productsByRank.map((item) => ({
      rank: item.soloRank,
      count: item._count.id,
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        revenue: revenue._sum.totalAmount || 0,
        pendingOrders,
        lowStockProducts,
      },
      revenueData,
      orderStatusData,
      productRankData,
      recentActivities,
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu dashboard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
