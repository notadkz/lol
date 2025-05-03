import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await prisma.gameAccount.findMany({
      where: {
        buyerId: Number(session.user.id),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: accounts });
  } catch (error) {
    console.error("Lỗi lấy tài khoản đã mua:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
