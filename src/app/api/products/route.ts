import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Dữ liệu mẫu để sử dụng khi không thể kết nối database
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Tài khoản BẠCH KIM",
    level: 150,
    skins: 32,
    blueEssence: 12500,
    orangeEssence: 5000,
    rp: 1250,
    tftPets: 5,
    price: 1200000,
    status: "available",
    images: ["/images/account-1.jpg", "/images/account-2.jpg"],
    description: "Tài khoản với nhiều skin hiếm, đã chơi từ mùa 3",
    rank: "BẠCH KIM",
    champions: 95,
    featured: true,
  },
  {
    id: "2",
    name: "Tài khoản KIM CƯƠNG",
    level: 210,
    skins: 45,
    blueEssence: 25000,
    orangeEssence: 8000,
    rp: 2000,
    tftPets: 8,
    price: 2500000,
    status: "available",
    images: ["/images/account-3.jpg", "/images/account-4.jpg"],
    description: "Tài khoản mạnh với nhiều trang phục hàng hiếm",
    rank: "KIM CƯƠNG",
    champions: 130,
    featured: true,
  },
  {
    id: "3",
    name: "Tài khoản CAO THỦ",
    level: 300,
    skins: 78,
    blueEssence: 50000,
    orangeEssence: 15000,
    rp: 3000,
    tftPets: 15,
    price: 5000000,
    status: "available",
    images: ["/images/account-5.jpg", "/images/account-6.jpg"],
    description: "Tài khoản siêu VIP với đầy đủ tướng và trang phục",
    rank: "CAO THỦ",
    champions: 165,
    featured: true,
  },
];

export async function GET(req: Request) {
  try {
    console.log("Fetching game accounts from database...");

    // Lấy danh sách tài khoản game từ database
    const gameAccounts = await prisma.gameAccount.findMany({
      where: {
        status: "AVAILABLE",
      },
      select: {
        id: true,
        username: true,
        level: true,
        blueEssence: true,
        riotPoints: true,
        skinCount: true,
        championCount: true,
        price: true,
        description: true,
        imageUrls: true,
        soloRank: true,
        isFeatured: true,
        ownedSkins: {
          select: {
            id: true,
          },
        },
        ownedChampions: {
          select: {
            id: true,
          },
        },
      },
    });

    console.log(`Found ${gameAccounts.length} accounts in database`);

    // Nếu không có dữ liệu từ database, trả về dữ liệu mẫu
    if (!gameAccounts || gameAccounts.length === 0) {
      console.log("No accounts found in database, returning mock data");
      return NextResponse.json({ products: MOCK_PRODUCTS });
    }

    // Chuyển đổi dữ liệu sang định dạng Product
    const products = gameAccounts.map((account) => {
      // Parse imageUrls từ JSON string thành mảng
      let images;
      try {
        images = account.imageUrls
          ? JSON.parse(account.imageUrls.toString())
          : ["/images/account-default.jpg"];
      } catch (error) {
        console.warn("Failed to parse imageUrls, using default image", error);
        images = ["/images/account-default.jpg"];
      }

      // Handle potential null values with defaults
      return {
        id: account.id.toString(),
        name: `Tài khoản ${account.soloRank?.replace("_", " ") || "UNRANKED"}`,
        level: account.level || 30,
        skins: account.skinCount || 0,
        blueEssence: account.blueEssence || 0,
        orangeEssence: 0, // Không có trong model, đặt giá trị mặc định
        rp: account.riotPoints || 0,
        tftPets: 0, // Không có trong model, đặt giá trị mặc định
        price: Number(account.price) || 0,
        status: "available",
        images: images,
        description: account.description || "",
        rank: account.soloRank?.replace("_", " ") || "UNRANKED",
        champions: account.championCount || 0,
        featured: account.isFeatured || false,
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching game accounts:", error);

    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    }

    // Trả về dữ liệu mẫu trong trường hợp có lỗi
    console.log("Error occurred, returning mock data");
    return NextResponse.json({
      products: MOCK_PRODUCTS,
      _debug:
        process.env.NODE_ENV !== "production"
          ? { error: error instanceof Error ? error.message : "Unknown error" }
          : undefined,
    });
  }
}
