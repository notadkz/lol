import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Params {
  params: {
    id: number;
  };
}

// GET /api/users/[id] - Lấy thông tin người dùng theo ID
// (public nhưng chỉ hiển thị thông tin không nhạy cảm)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    // Lấy thông tin người dùng từ database
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        accountType: true,
        createdAt: true,
        // isVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
          message: "Không tìm thấy thông tin người dùng",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error(`Error fetching user (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
