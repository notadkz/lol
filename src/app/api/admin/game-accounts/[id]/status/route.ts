import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Params {
  params: {
    id: string;
  };
}

// PATCH /api/admin/game-accounts/[id]/status - Cập nhật trạng thái tài khoản game
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Bạn không có quyền thực hiện thao tác này",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await req.json();

    // Kiểm tra dữ liệu đầu vào
    if (!data.status) {
      return NextResponse.json(
        { error: "Missing data", message: "Thiếu thông tin trạng thái" },
        { status: 400 }
      );
    }

    // Kiểm tra tài khoản game tồn tại
    const existingGameAccount = await prisma.gameAccount.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingGameAccount) {
      return NextResponse.json(
        {
          error: "Game account not found",
          message: "Tài khoản game không tồn tại",
        },
        { status: 404 }
      );
    }

    // Cập nhật trạng thái tài khoản game
    const updatedGameAccount = await prisma.gameAccount.update({
      where: { id: parseInt(id) },
      data: {
        status: data.status,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Chuyển soloRank, flexRank, tftRank thành một mảng ranks
    const ranks = [
      updatedGameAccount.soloRank !== "UNRANKED"
        ? updatedGameAccount.soloRank
        : null,
      updatedGameAccount.flexRank !== "UNRANKED"
        ? updatedGameAccount.flexRank
        : null,
      updatedGameAccount.tftRank !== "UNRANKED"
        ? updatedGameAccount.tftRank
        : null,
    ].filter(Boolean) as string[];

    // Chuyển đổi imageUrls từ chuỗi JSON thành mảng
    let images: string[] = [];
    if (updatedGameAccount.imageUrls) {
      try {
        images = JSON.parse(updatedGameAccount.imageUrls);
      } catch (e) {
        images = [updatedGameAccount.imageUrls];
      }
    }

    // Định dạng dữ liệu phản hồi
    const formattedGameAccount = {
      id: String(updatedGameAccount.id),
      username: updatedGameAccount.username,
      password: "******", // Không trả về mật khẩu
      ranks,
      level: updatedGameAccount.level,
      price: updatedGameAccount.price.toString(),
      status: updatedGameAccount.status,
      images,
      createdAt: updatedGameAccount.createdAt,
      updatedAt: updatedGameAccount.updatedAt,
      seller: updatedGameAccount.buyer
        ? {
            id: String(updatedGameAccount.buyer.id),
            name: updatedGameAccount.buyer.name,
            email: updatedGameAccount.buyer.email,
          }
        : null,
    };

    return NextResponse.json(formattedGameAccount);
  } catch (error: any) {
    console.error(
      `Error updating game account status (ID: ${(await params).id}):`,
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
