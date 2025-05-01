import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/admin/game-accounts/[id] - Lấy thông tin chi tiết tài khoản game
export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Bạn không có quyền truy cập" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Lấy thông tin tài khoản game từ database
    const gameAccount = await prisma.gameAccount.findUnique({
      where: { id: parseInt(id) },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!gameAccount) {
      return NextResponse.json(
        {
          error: "Game account not found",
          message: "Tài khoản game không tồn tại",
        },
        { status: 404 }
      );
    }

    // Chuyển soloRank, flexRank, tftRank thành một mảng ranks
    const ranks = [
      gameAccount.soloRank !== "UNRANKED" ? gameAccount.soloRank : null,
      gameAccount.flexRank !== "UNRANKED" ? gameAccount.flexRank : null,
      gameAccount.tftRank !== "UNRANKED" ? gameAccount.tftRank : null,
    ].filter(Boolean) as string[];

    // Chuyển đổi imageUrls từ chuỗi JSON thành mảng
    let images: string[] = [];
    if (gameAccount.imageUrls) {
      try {
        images = JSON.parse(gameAccount.imageUrls);
      } catch (e) {
        images = [gameAccount.imageUrls];
      }
    }

    // Định dạng dữ liệu phản hồi
    const formattedGameAccount = {
      id: String(gameAccount.id),
      username: gameAccount.username,
      // Không trả về mật khẩu đầy đủ trong API chi tiết
      password: "******",
      soloRank: gameAccount.soloRank,
      flexRank: gameAccount.flexRank,
      tftRank: gameAccount.tftRank,
      ranks,
      level: gameAccount.level,
      blueEssence: gameAccount.blueEssence,
      riotPoints: gameAccount.riotPoints,
      championCount: gameAccount.championCount,
      skinCount: gameAccount.skinCount,
      chromaCount: gameAccount.chromaCount,
      price: gameAccount.price,
      originalPrice: gameAccount.originalPrice,
      discount: gameAccount.discount,
      status: gameAccount.status,
      imageUrls: images,
      description: gameAccount.description || "",
      isFeatured: gameAccount.featuredUntil
        ? new Date(gameAccount.featuredUntil) > new Date()
        : false,
      featuredUntil: gameAccount.featuredUntil,
      createdAt: gameAccount.createdAt,
      updatedAt: gameAccount.updatedAt,
      viewCount: gameAccount.viewCount,
      seller: gameAccount.seller
        ? {
            id: String(gameAccount.seller.id),
            name: gameAccount.seller.name,
            email: gameAccount.seller.email,
          }
        : null,
      buyer: gameAccount.buyer
        ? {
            id: String(gameAccount.buyer.id),
            name: gameAccount.buyer.name,
            email: gameAccount.buyer.email,
          }
        : null,
    };

    return NextResponse.json(formattedGameAccount);
  } catch (error: any) {
    console.error(
      `Error fetching game account (ID: ${(await params).id}):`,
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/game-accounts/[id] - Cập nhật thông tin tài khoản game
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

    // Xử lý ranks và chuyển đổi thành soloRank, flexRank, tftRank
    let soloRank: any = undefined;
    let flexRank: any = undefined;
    let tftRank: any = undefined;

    if (data.ranks && Array.isArray(data.ranks)) {
      if (data.ranks.length > 0) soloRank = data.ranks[0] || "UNRANKED";
      if (data.ranks.length > 1) flexRank = data.ranks[1] || "UNRANKED";
      if (data.ranks.length > 2) tftRank = data.ranks[2] || "UNRANKED";
    }

    // Xử lý thông tin giá và giảm giá
    let price, originalPrice, discount;

    if (data.price !== undefined) {
      price = parseFloat(data.price);
    }

    if (data.originalPrice !== undefined) {
      originalPrice =
        data.originalPrice === null ? null : parseFloat(data.originalPrice);
    }

    if (data.salePrice !== undefined && price !== undefined) {
      discount =
        data.salePrice === null ? null : price - parseFloat(data.salePrice);
    }

    // Xử lý hình ảnh
    let imageUrls;
    if (data.images !== undefined) {
      imageUrls = Array.isArray(data.images)
        ? JSON.stringify(data.images)
        : null;
    }

    // Cập nhật thông tin tài khoản game
    const updatedGameAccount = await prisma.gameAccount.update({
      where: { id: parseInt(id) },
      data: {
        username: data.username !== undefined ? data.username : undefined,
        password: data.password !== undefined ? data.password : undefined,
        soloRank,
        flexRank,
        tftRank,
        level: data.level !== undefined ? data.level : undefined,
        price,
        originalPrice,
        discount,
        status: data.status !== undefined ? data.status : undefined,
        description:
          data.description !== undefined ? data.description : undefined,
        imageUrls,
        featuredUntil:
          data.isFeatured !== undefined
            ? data.isFeatured
              ? data.featuredUntil
                ? new Date(data.featuredUntil)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              : null
            : undefined,
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
      // Không trả về mật khẩu đầy đủ
      password: "******",
      ranks,
      level: updatedGameAccount.level,
      price: updatedGameAccount.price.toString(),
      originalPrice: updatedGameAccount.originalPrice?.toString() || null,
      salePrice: updatedGameAccount.discount
        ? (
            Number(updatedGameAccount.price) -
            Number(updatedGameAccount.discount)
          ).toString()
        : null,
      status: updatedGameAccount.status,
      images,
      description: updatedGameAccount.description || "",
      isFeatured: updatedGameAccount.featuredUntil
        ? new Date(updatedGameAccount.featuredUntil) > new Date()
        : false,
      featuredUntil: updatedGameAccount.featuredUntil,
      createdAt: updatedGameAccount.createdAt,
      updatedAt: updatedGameAccount.updatedAt,
      viewCount: updatedGameAccount.viewCount,
      seller: updatedGameAccount.seller
        ? {
            id: String(updatedGameAccount.seller.id),
            name: updatedGameAccount.seller.name,
            email: updatedGameAccount.seller.email,
          }
        : null,
    };

    return NextResponse.json(formattedGameAccount);
  } catch (error: any) {
    console.error(
      `Error updating game account (ID: ${(await params).id}):`,
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/game-accounts/[id] - Xóa tài khoản game
export async function DELETE(req: NextRequest, { params }: Params) {
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

    // Kiểm tra xem tài khoản này đã được bán hay đang trong đơn hàng
    if (
      existingGameAccount.status === "SOLD" ||
      existingGameAccount.buyerId ||
      existingGameAccount.orderId
    ) {
      return NextResponse.json(
        {
          error: "Conflict",
          message:
            "Không thể xóa tài khoản đã được bán hoặc đang trong đơn hàng",
        },
        { status: 409 }
      );
    }

    // Xóa tài khoản game
    await prisma.gameAccount.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { success: true, message: "Xóa tài khoản game thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      `Error deleting game account (ID: ${(await params).id}):`,
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
