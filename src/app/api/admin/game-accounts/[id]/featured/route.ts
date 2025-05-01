import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Params {
  params: {
    id: string;
  };
}

// PATCH /api/admin/game-accounts/[id]/featured - Cập nhật trạng thái nổi bật cho tài khoản game
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
    if (data.isFeatured === undefined) {
      return NextResponse.json(
        {
          error: "Missing data",
          message: "Thiếu thông tin trạng thái nổi bật",
        },
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

    // Tính toán ngày hết hạn nổi bật
    let featuredUntil = null;
    if (data.isFeatured) {
      // Nếu có thời hạn cụ thể, sử dụng nó
      if (data.featuredUntil) {
        featuredUntil = new Date(data.featuredUntil);
      } else {
        // Mặc định là 7 ngày kể từ thời điểm hiện tại
        featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + 7);
      }
    }

    // Cập nhật trạng thái nổi bật cho tài khoản game
    const updatedGameAccount = await prisma.gameAccount.update({
      where: { id: parseInt(id) },
      data: {
        featuredUntil: featuredUntil,
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

    // Định dạng dữ liệu phản hồi
    const formattedGameAccount = {
      id: String(updatedGameAccount.id),
      username: updatedGameAccount.username,
      isFeatured: updatedGameAccount.featuredUntil
        ? new Date(updatedGameAccount.featuredUntil) > new Date()
        : false,
      featuredUntil: updatedGameAccount.featuredUntil,
      status: updatedGameAccount.status,
    };

    return NextResponse.json(formattedGameAccount);
  } catch (error: any) {
    console.error(
      `Error updating featured status (ID: ${(await params).id}):`,
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
