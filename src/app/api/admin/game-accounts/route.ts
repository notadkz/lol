import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/admin/game-accounts - Lấy danh sách tài khoản game
export async function GET(req: NextRequest) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Bạn không có quyền truy cập trang này",
        },
        { status: 401 }
      );
    }

    // Lấy các thông số truy vấn
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const rank = searchParams.get("rank") || undefined;

    // Tạo object điều kiện tìm kiếm
    const where: any = {};

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (rank && rank !== "all") {
      if (
        rank === "IRON" ||
        rank === "BRONZE" ||
        rank === "SILVER" ||
        rank === "GOLD"
      ) {
        where.soloRank = rank;
      } else if (
        rank === "PLATINUM" ||
        rank === "EMERALD" ||
        rank === "DIAMOND"
      ) {
        where.soloRank = rank;
      } else {
        where.soloRank = rank;
      }
    }

    // Đếm tổng số tài khoản game phù hợp với điều kiện
    const total = await prisma.gameAccount.count({ where });

    // Lấy danh sách tài khoản game
    const gameAccounts = await prisma.gameAccount.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Chuyển đổi dữ liệu để phù hợp với giao diện
    const formattedGameAccounts = gameAccounts.map((account) => {
      // Chuyển đổi imageUrls từ chuỗi JSON thành mảng
      let images: string[] = [];
      if (account.imageUrls) {
        try {
          images = JSON.parse(account.imageUrls);
        } catch (e) {
          images = [account.imageUrls];
        }
      }

      // Chuyển soloRank, flexRank, tftRank thành một mảng ranks
      const ranks = [
        account.soloRank !== "UNRANKED" ? account.soloRank : null,
        account.flexRank !== "UNRANKED" ? account.flexRank : null,
        account.tftRank !== "UNRANKED" ? account.tftRank : null,
      ].filter(Boolean) as string[];

      // Ghi log để debug
      console.log(`Account ${account.id} ranks:`, {
        soloRank: account.soloRank,
        flexRank: account.flexRank,
        tftRank: account.tftRank,
        ranks,
      });

      return {
        id: account.id,
        username: account.username,
        // Không trả về mật khẩu trong dữ liệu trả về
        password: "******",
        // Đảm bảo trả về tất cả các trường rank
        soloRank: account.soloRank,
        flexRank: account.flexRank,
        tftRank: account.tftRank,
        ranks,
        level: account.level,
        blueEssence: account.blueEssence,
        riotPoints: account.riotPoints,
        championCount: account.championCount,
        skinCount: account.skinCount,
        chromaCount: account.chromaCount,
        price: account.price,
        originalPrice: account.originalPrice,
        discount: account.discount,
        status: account.status,
        imageUrls: images,
        description: account.description || "",
        isFeatured: account.featuredUntil
          ? new Date(account.featuredUntil) > new Date()
          : false,
        featuredUntil: account.featuredUntil,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        viewCount: account.viewCount,
        seller: account.seller
          ? {
              id: account.seller.id,
              name: account.seller.name,
              email: account.seller.email,
            }
          : null,
        buyer: account.buyer
          ? {
              id: account.buyer.id,
              name: account.buyer.name,
              email: account.buyer.email,
            }
          : null,
      };
    });

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: formattedGameAccounts,
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

// POST /api/admin/game-accounts - Tạo tài khoản game mới
export async function POST(req: NextRequest) {
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

    const data = await req.json();

    // Validate dữ liệu đầu vào
    if (!data.username || !data.password || !data.price) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Tên đăng nhập, mật khẩu và giá tiền là bắt buộc",
        },
        { status: 400 }
      );
    }

    // Xử lý ranks và chuyển đổi thành soloRank, flexRank, tftRank
    let soloRank: any = "UNRANKED";
    let flexRank: any = "UNRANKED";
    let tftRank: any = "UNRANKED";

    // Loại bỏ ánh xạ từ tiếng Anh sang tiếng Việt vì frontend đã gửi giá trị tiếng Việt
    console.log("Received data.ranks:", JSON.stringify(data.ranks));

    // Trực tiếp sử dụng các giá trị đã nhận, vì chúng đã ở đúng định dạng
    if (data.ranks && Array.isArray(data.ranks) && data.ranks.length > 0) {
      // Kiểm tra xem giá trị rank có hợp lệ với enum Rank hay không
      const validRanks = [
        "UNRANKED",
        "SAT",
        "DONG",
        "BAC",
        "VANG",
        "BACH_KIM",
        "KIM_CUONG",
        "CAO_THU",
        "DAI_CAO_THU",
        "THACH_DAU",
      ];

      // Lấy giá trị rank đầu tiên làm soloRank nếu nó hợp lệ
      if (validRanks.includes(data.ranks[0])) {
        soloRank = data.ranks[0];
      }

      // Lấy giá trị rank thứ hai làm flexRank nếu nó tồn tại và hợp lệ
      if (data.ranks.length > 1 && validRanks.includes(data.ranks[1])) {
        flexRank = data.ranks[1];
      }

      // Lấy giá trị rank thứ ba làm tftRank nếu nó tồn tại và hợp lệ
      if (data.ranks.length > 2 && validRanks.includes(data.ranks[2])) {
        tftRank = data.ranks[2];
      }
    }

    // Kiểm tra các trường riêng lẻ nếu mảng ranks không được gửi
    if ((!data.ranks || !Array.isArray(data.ranks)) && data.soloRank) {
      soloRank = data.soloRank;
    }
    if ((!data.ranks || !Array.isArray(data.ranks)) && data.flexRank) {
      flexRank = data.flexRank;
    }
    if ((!data.ranks || !Array.isArray(data.ranks)) && data.tftRank) {
      tftRank = data.tftRank;
    }

    console.log(
      "Final rank values - soloRank:",
      soloRank,
      "flexRank:",
      flexRank,
      "tftRank:",
      tftRank
    );

    // Xử lý thông tin giá và giảm giá
    const price = parseFloat(data.price);
    const originalPrice = data.originalPrice
      ? parseFloat(data.originalPrice)
      : null;
    const discount = data.salePrice ? price - parseFloat(data.salePrice) : null;

    // Xử lý hình ảnh
    const imageUrls =
      data.images && Array.isArray(data.images)
        ? JSON.stringify(data.images)
        : null;

    // Tạo tài khoản game mới
    const newGameAccount = await prisma.gameAccount.create({
      data: {
        username: data.username,
        password: data.password,
        email: data.email || null,
        emailPassword: data.emailPassword || null,
        soloRank,
        flexRank,
        tftRank,
        level: data.level || 30,
        blueEssence: data.blueEssence || 0,
        riotPoints: data.riotPoints || 0,
        championCount: data.championCount || 0,
        skinCount: data.skinCount || 0,
        chromaCount: data.chromaCount || 0,
        price,
        originalPrice,
        discount,
        status: data.status || "AVAILABLE",
        description: data.description || "",
        imageUrls,
        isFeatured: data.isFeatured || false,
        featuredUntil: data.isFeatured
          ? data.featuredUntil
            ? new Date(data.featuredUntil)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : null,
        viewCount: 0,
        sellerId: data.sellerId ? parseInt(data.sellerId) : null,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Chuyển đổi dữ liệu để phù hợp với giao diện
    const ranks = [
      newGameAccount.soloRank !== "UNRANKED" ? newGameAccount.soloRank : null,
      newGameAccount.flexRank !== "UNRANKED" ? newGameAccount.flexRank : null,
      newGameAccount.tftRank !== "UNRANKED" ? newGameAccount.tftRank : null,
    ].filter(Boolean) as string[];

    // Chuyển đổi imageUrls từ chuỗi JSON thành mảng
    let images: string[] = [];
    if (newGameAccount.imageUrls) {
      try {
        images = JSON.parse(newGameAccount.imageUrls);
      } catch (e) {
        images = [newGameAccount.imageUrls];
      }
    }

    // Log chi tiết về tài khoản đã tạo
    console.log(
      "Successfully created game account with ID:",
      newGameAccount.id
    );
    console.log("Rank values saved in database:", {
      soloRank: newGameAccount.soloRank,
      flexRank: newGameAccount.flexRank,
      tftRank: newGameAccount.tftRank,
      ranksArray: ranks,
    });

    const formattedGameAccount = {
      id: String(newGameAccount.id),
      username: newGameAccount.username,
      // Không trả về mật khẩu trong dữ liệu trả về
      password: "******",
      // Thêm thông tin rank chi tiết
      soloRank: newGameAccount.soloRank,
      flexRank: newGameAccount.flexRank,
      tftRank: newGameAccount.tftRank,
      ranks,
      level: newGameAccount.level,
      price: newGameAccount.price.toString(),
      originalPrice: newGameAccount.originalPrice?.toString() || null,
      salePrice: newGameAccount.discount
        ? (
            Number(newGameAccount.price) - Number(newGameAccount.discount)
          ).toString()
        : null,
      status: newGameAccount.status,
      images,
      description: newGameAccount.description || "",
      isFeatured: newGameAccount.featuredUntil ? true : false,
      featuredUntil: newGameAccount.featuredUntil,
      createdAt: newGameAccount.createdAt,
      updatedAt: newGameAccount.updatedAt,
      viewCount: newGameAccount.viewCount,
      seller: newGameAccount.seller
        ? {
            id: String(newGameAccount.seller.id),
            name: newGameAccount.seller.name,
            email: newGameAccount.seller.email,
          }
        : null,
    };

    return NextResponse.json(formattedGameAccount, { status: 201 });
  } catch (error: any) {
    console.error("Error creating game account:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
