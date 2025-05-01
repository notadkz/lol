import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Interface cho sản phẩm mẫu
interface MockProduct {
  id: string;
  name: string;
  level: number;
  skins: number;
  blueEssence: number;
  orangeEssence: number;
  riotPoints: number;
  price: number;
  originalPrice: number;
  discount: number;
  status: string;
  images: string[];
  description: string;
  soloRank: string;
  flexRank: string;
  tftRank: string;
  champions: number;
  chromaCount: number;
  viewCount: number;
  createdAt: string;
  featured: boolean;
  ownedChampions: Array<{ id: number; name: string; imageUrl: string | null }>;
  ownedSkins: Array<{
    id: number;
    name: string;
    championId: number;
    imageUrl: string | null;
  }>;
  ownedChromas: Array<{
    id: number;
    name: string;
    skinId: number;
    imageUrl: string | null;
  }>;
  ownedWards: Array<{ id: number; name: string; imageUrl: string | null }>;
  ownedEmotes: Array<{ id: number; name: string; imageUrl: string | null }>;
  ownedIcons: Array<{ id: number; name: string; imageUrl: string | null }>;
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: { name: string; image: string | null };
  }>;
}

// Dữ liệu mẫu chi tiết sản phẩm với index signature
const MOCK_PRODUCT_DETAILS: { [key: string]: MockProduct } = {
  "1": {
    id: "1",
    name: "Tài khoản BẠCH KIM",
    level: 150,
    skins: 32,
    blueEssence: 12500,
    orangeEssence: 5000,
    riotPoints: 1250,
    price: 1200000,
    originalPrice: 1500000,
    discount: 20,
    status: "available",
    images: ["/images/account-1.jpg", "/images/account-2.jpg"],
    description:
      "Tài khoản với nhiều skin hiếm, đã chơi từ mùa 3. Bao gồm nhiều trang phục giới hạn và tướng mạnh meta hiện tại.",
    soloRank: "BẠCH KIM",
    flexRank: "VÀNG",
    tftRank: "BẠCH KIM",
    champions: 95,
    chromaCount: 15,
    viewCount: 150,
    createdAt: new Date().toISOString(),
    featured: true,

    ownedChampions: Array(10)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Champion ${i + 1}`,
        imageUrl: `/images/champions/champ-${i + 1}.jpg`,
      })),

    ownedSkins: Array(15)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Skin ${i + 1}`,
        championId: Math.floor(Math.random() * 10) + 1,
        imageUrl: `/images/skins/skin-${i + 1}.jpg`,
      })),

    ownedChromas: Array(5)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Chroma ${i + 1}`,
        skinId: Math.floor(Math.random() * 15) + 1,
        imageUrl: `/images/chromas/chroma-${i + 1}.jpg`,
      })),

    ownedWards: Array(3)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Ward ${i + 1}`,
        imageUrl: `/images/wards/ward-${i + 1}.jpg`,
      })),

    ownedEmotes: Array(8)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Emote ${i + 1}`,
        imageUrl: `/images/emotes/emote-${i + 1}.jpg`,
      })),

    ownedIcons: Array(12)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Icon ${i + 1}`,
        imageUrl: `/images/icons/icon-${i + 1}.jpg`,
      })),

    reviews: Array(3)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: `Tài khoản rất tốt, giao dịch nhanh chóng và đáng tin cậy ${
          i + 1
        }`,
        createdAt: new Date().toISOString(),
        user: {
          name: `User ${i + 1}`,
          image: `/images/avatars/avatar-${i + 1}.jpg`,
        },
      })),
  },
  "2": {
    id: "2",
    name: "Tài khoản KIM CƯƠNG",
    level: 210,
    skins: 45,
    blueEssence: 25000,
    orangeEssence: 8000,
    riotPoints: 2000,
    price: 2500000,
    originalPrice: 3000000,
    discount: 16.7,
    status: "available",
    images: ["/images/account-3.jpg", "/images/account-4.jpg"],
    description:
      "Tài khoản mạnh với nhiều trang phục hàng hiếm, đã đạt rank Kim Cương trong nhiều mùa liên tiếp.",
    soloRank: "KIM CƯƠNG",
    flexRank: "BẠCH KIM",
    tftRank: "CAO THỦ",
    champions: 130,
    chromaCount: 25,
    viewCount: 320,
    createdAt: new Date().toISOString(),
    featured: true,

    // Tương tự như trên nhưng với số lượng lớn hơn
    ownedChampions: Array(20)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Champion ${i + 1}`,
        imageUrl: `/images/champions/champ-${i + 1}.jpg`,
      })),

    ownedSkins: Array(25)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Skin ${i + 1}`,
        championId: Math.floor(Math.random() * 20) + 1,
        imageUrl: `/images/skins/skin-${i + 1}.jpg`,
      })),

    ownedChromas: Array(10)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Chroma ${i + 1}`,
        skinId: Math.floor(Math.random() * 25) + 1,
        imageUrl: `/images/chromas/chroma-${i + 1}.jpg`,
      })),

    ownedWards: Array(5)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Ward ${i + 1}`,
        imageUrl: `/images/wards/ward-${i + 1}.jpg`,
      })),

    ownedEmotes: Array(15)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Emote ${i + 1}`,
        imageUrl: `/images/emotes/emote-${i + 1}.jpg`,
      })),

    ownedIcons: Array(20)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Icon ${i + 1}`,
        imageUrl: `/images/icons/icon-${i + 1}.jpg`,
      })),

    reviews: Array(5)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: `Siêu phẩm, rất hài lòng với tài khoản này ${i + 1}`,
        createdAt: new Date().toISOString(),
        user: {
          name: `User ${i + 1}`,
          image: `/images/avatars/avatar-${i + 1}.jpg`,
        },
      })),
  },
  "3": {
    id: "3",
    name: "Tài khoản CAO THỦ",
    level: 300,
    skins: 78,
    blueEssence: 50000,
    orangeEssence: 15000,
    riotPoints: 3000,
    price: 5000000,
    originalPrice: 6000000,
    discount: 16.7,
    status: "available",
    images: ["/images/account-5.jpg", "/images/account-6.jpg"],
    description:
      "Tài khoản siêu VIP với đầy đủ tướng và trang phục, đã đạt rank Cao Thủ nhiều mùa.",
    soloRank: "CAO THỦ",
    flexRank: "KIM CƯƠNG",
    tftRank: "ĐẠI CAO THỦ",
    champions: 165,
    chromaCount: 40,
    viewCount: 580,
    createdAt: new Date().toISOString(),
    featured: true,

    // Tương tự như trên nhưng với số lượng lớn hơn nữa
    ownedChampions: Array(30)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Champion ${i + 1}`,
        imageUrl: `/images/champions/champ-${i + 1}.jpg`,
      })),

    ownedSkins: Array(40)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Skin ${i + 1}`,
        championId: Math.floor(Math.random() * 30) + 1,
        imageUrl: `/images/skins/skin-${i + 1}.jpg`,
      })),

    ownedChromas: Array(20)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Chroma ${i + 1}`,
        skinId: Math.floor(Math.random() * 40) + 1,
        imageUrl: `/images/chromas/chroma-${i + 1}.jpg`,
      })),

    ownedWards: Array(8)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Ward ${i + 1}`,
        imageUrl: `/images/wards/ward-${i + 1}.jpg`,
      })),

    ownedEmotes: Array(25)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Emote ${i + 1}`,
        imageUrl: `/images/emotes/emote-${i + 1}.jpg`,
      })),

    ownedIcons: Array(35)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: `Icon ${i + 1}`,
        imageUrl: `/images/icons/icon-${i + 1}.jpg`,
      })),

    reviews: Array(8)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: `Tài khoản tuyệt vời, nhiều skin hiếm, đáng đồng tiền bát gạo ${
          i + 1
        }`,
        createdAt: new Date().toISOString(),
        user: {
          name: `User ${i + 1}`,
          image: `/images/avatars/avatar-${i + 1}.jpg`,
        },
      })),
  },
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Fetching details for product ID: ${params.id}`);
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID tài khoản không hợp lệ" },
        { status: 400 }
      );
    }

    // Kiểm tra xem có trong dữ liệu mẫu không
    if (MOCK_PRODUCT_DETAILS[id]) {
      console.log(`Found mock data for product ID: ${id}`);
      return NextResponse.json({ product: MOCK_PRODUCT_DETAILS[id] });
    }

    // Lấy thông tin chi tiết của tài khoản game từ database
    let gameAccount;
    try {
      gameAccount = await prisma.gameAccount.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          ownedChampions: {
            include: {
              champion: true,
            },
          },
          ownedSkins: {
            include: {
              skin: true,
            },
          },
          ownedChromas: {
            include: {
              chroma: true,
            },
          },
          ownedWards: {
            include: {
              ward: true,
            },
          },
          ownedEmotes: {
            include: {
              emote: true,
            },
          },
          ownedIcons: {
            include: {
              icon: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Nếu có lỗi database, kiểm tra xem có trong dữ liệu mẫu không
      if (MOCK_PRODUCT_DETAILS[id]) {
        console.log(`Database error, falling back to mock data for ID: ${id}`);
        return NextResponse.json({ product: MOCK_PRODUCT_DETAILS[id] });
      } else {
        throw dbError; // Ném lỗi ra khỏi khối try để được xử lý ở catch bên ngoài
      }
    }

    if (!gameAccount) {
      console.log(`No product found with ID: ${id}, checking mock data`);
      // Không tìm thấy trong database, kiểm tra xem có trong dữ liệu mẫu không
      if (MOCK_PRODUCT_DETAILS[id]) {
        console.log(`Found mock data for product ID: ${id}`);
        return NextResponse.json({ product: MOCK_PRODUCT_DETAILS[id] });
      }

      return NextResponse.json(
        { error: "Không tìm thấy tài khoản game" },
        { status: 404 }
      );
    }

    let images;
    try {
      // Parse imageUrls từ JSON string thành mảng
      images = gameAccount.imageUrls
        ? JSON.parse(gameAccount.imageUrls.toString())
        : ["/images/account-default.jpg"];
    } catch (error) {
      console.warn("Error parsing imageUrls:", error);
      images = ["/images/account-default.jpg"];
    }

    // Chuyển đổi dữ liệu sang định dạng chi tiết sản phẩm
    const productDetail = {
      id: gameAccount.id.toString(),
      name: `Tài khoản ${
        gameAccount.soloRank?.replace("_", " ") || "UNRANKED"
      }`,
      level: gameAccount.level || 30,
      skins: gameAccount.skinCount || 0,
      blueEssence: gameAccount.blueEssence || 0,
      riotPoints: gameAccount.riotPoints || 0,
      price: Number(gameAccount.price) || 0,
      originalPrice: gameAccount.originalPrice
        ? Number(gameAccount.originalPrice)
        : null,
      discount: gameAccount.discount || 0,
      status: (gameAccount.status || "AVAILABLE").toLowerCase(),
      images: images,
      description: gameAccount.description || "",
      soloRank: (gameAccount.soloRank || "UNRANKED").replace("_", " "),
      flexRank: (gameAccount.flexRank || "UNRANKED").replace("_", " "),
      tftRank: (gameAccount.tftRank || "UNRANKED").replace("_", " "),
      champions: gameAccount.championCount || 0,
      chromaCount: gameAccount.chromaCount || 0,
      viewCount: gameAccount.viewCount || 0,
      createdAt: gameAccount.createdAt,
      featured: gameAccount.isFeatured || false,

      // Thông tin chi tiết về tài nguyên game
      ownedChampions: (gameAccount.ownedChampions || []).map((oc) => ({
        id: oc.champion?.id || 0,
        name: oc.champion?.name || "Unknown Champion",
        imageUrl: oc.champion?.imageUrl || null,
      })),

      ownedSkins: (gameAccount.ownedSkins || []).map((os) => ({
        id: os.skin?.id || 0,
        name: os.skin?.name || "Unknown Skin",
        championId: os.skin?.championId || 0,
        imageUrl: os.skin?.imageUrl || null,
      })),

      ownedChromas: (gameAccount.ownedChromas || []).map((oc) => ({
        id: oc.chroma?.id || 0,
        name: oc.chroma?.name || "Unknown Chroma",
        skinId: oc.chroma?.skinId || 0,
        imageUrl: oc.chroma?.imageUrl || null,
      })),

      ownedWards: (gameAccount.ownedWards || []).map((ow) => ({
        id: ow.ward?.id || 0,
        name: ow.ward?.name || "Unknown Ward",
        imageUrl: ow.ward?.imageUrl || null,
      })),

      ownedEmotes: (gameAccount.ownedEmotes || []).map((oe) => ({
        id: oe.emote?.id || 0,
        name: oe.emote?.name || "Unknown Emote",
        imageUrl: oe.emote?.imageUrl || null,
      })),

      ownedIcons: (gameAccount.ownedIcons || []).map((oi) => ({
        id: oi.icon?.id || 0,
        name: oi.icon?.name || "Unknown Icon",
        imageUrl: oi.icon?.imageUrl || null,
      })),

      reviews: (gameAccount.reviews || []).map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || "",
        createdAt: review.createdAt,
        user: {
          name: review.user?.name || "Anonymous",
          image: review.user?.image || null,
        },
      })),
    };

    return NextResponse.json({ product: productDetail });
  } catch (error) {
    console.error("Error fetching game account details:", error);

    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    }

    // Nếu có trong dữ liệu mẫu thì trả về
    if (params.id && MOCK_PRODUCT_DETAILS[params.id]) {
      console.log(`Error occurred, returning mock data for ID: ${params.id}`);
      return NextResponse.json({
        product: MOCK_PRODUCT_DETAILS[params.id],
        _debug:
          process.env.NODE_ENV !== "production"
            ? {
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : undefined,
      });
    }

    // Nếu không có thì trả về lỗi
    return NextResponse.json(
      {
        error: "Lỗi khi lấy chi tiết tài khoản game",
        _debug:
          process.env.NODE_ENV !== "production"
            ? {
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
