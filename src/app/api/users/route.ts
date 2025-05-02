import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/users - Lấy thông tin người dùng hiện tại
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Bạn chưa đăng nhập" },
        { status: 401 }
      );
    }

    // Lấy thông tin người dùng từ database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        accountType: true,
        createdAt: true,
        // isVerified: true,
        // isActive: true,
        balance: true,
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
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Cập nhật thông tin người dùng hiện tại
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Bạn chưa đăng nhập" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Lấy thông tin người dùng từ database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    // Chỉ cho phép người dùng cập nhật một số thông tin cá nhân
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        image: data.image !== undefined ? data.image : undefined,
        // Lưu ý: Không cho phép cập nhật email, accountType thông qua API này
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        accountType: true,
        createdAt: true,
        // isVerified: true,
        // isActive: true,
        balance: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating current user:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
