import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/lib/prisma";

// GET /api/accounts - Lấy danh sách game accounts public
export async function GET(req: NextRequest) {
  try {
    // Lấy các thông số truy vấn
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const search = searchParams.get("search") || undefined;
    const minPrice = Number(searchParams.get("minPrice")) || undefined;
    const maxPrice = Number(searchParams.get("maxPrice")) || undefined;
    const ranks = searchParams.getAll("rank") || undefined;
    const status = searchParams.get("status") as
      | "AVAILABLE"
      | "SOLD"
      | undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";
    const featured = searchParams.get("featured") === "true" ? true : undefined;

    // Tạo object điều kiện tìm kiếm
    const where: any = {
      // Chỉ hiển thị game accounts có trạng thái AVAILABLE hoặc theo filter
      status: status || "AVAILABLE",
    };

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice !== undefined) {
      where.price = {
        ...where.price,
        gte: minPrice,
      };
    }

    if (maxPrice !== undefined) {
      where.price = {
        ...where.price,
        lte: maxPrice,
      };
    }

    if (ranks && ranks.length > 0) {
      where.ranks = {
        hasSome: ranks,
      };
    }

    if (featured) {
      const now = new Date();
      where.featuredUntil = {
        gte: now,
      };
    }

    // Đếm tổng số game accounts phù hợp với điều kiện
    const total = await prisma.gameAccount.count({ where });

    // Lấy danh sách game accounts
    const accounts = await prisma.gameAccount.findMany({
      where,
      select: {
        id: true,
        username: true,
        price: true,
        ranks: true,
        level: true,
        status: true,
        images: true,
        featuredUntil: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: accounts,
      total,
      page,
      totalPages,
    });
  } catch (error: any) {
    console.error("Error fetching game accounts:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
