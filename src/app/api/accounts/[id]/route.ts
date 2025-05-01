import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/accounts/[id] - Lấy thông tin chi tiết của một game account
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    // Lấy thông tin chi tiết của game account
    const account = await prisma.gameAccount.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        price: true,
        description: true,
        ranks: true,
        level: true,
        champions: true,
        skins: true,
        images: true,
        status: true,
        featuredUntil: true,
        createdAt: true,
        updatedAt: true,
        sellerId: true,
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        {
          error: "Account not found",
          message: "Không tìm thấy thông tin tài khoản game",
        },
        { status: 404 }
      );
    }

    // Tìm các game accounts tương tự
    const similarAccounts = await prisma.gameAccount.findMany({
      where: {
        id: { not: id },
        OR: [
          { ranks: { hasSome: account.ranks } },
          { level: { gte: account.level - 5, lte: account.level + 5 } },
        ],
        status: "AVAILABLE",
      },
      select: {
        id: true,
        username: true,
        price: true,
        ranks: true,
        level: true,
        images: true,
        featuredUntil: true,
      },
      take: 6,
    });

    return NextResponse.json({
      ...account,
      similarAccounts,
    });
  } catch (error: any) {
    console.error(`Error fetching game account (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
