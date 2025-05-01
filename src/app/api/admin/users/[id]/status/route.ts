import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Params {
  params: {
    id: string;
  };
}

// PATCH /api/admin/users/[id]/status - Cập nhật trạng thái người dùng
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

    const { id } = params;
    const data = await req.json();

    // Kiểm tra dữ liệu đầu vào
    if (data.isActive === undefined) {
      return NextResponse.json(
        { error: "Missing data", message: "Thiếu thông tin trạng thái" },
        { status: 400 }
      );
    }

    // Kiểm tra người dùng tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found", message: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    // Cập nhật trạng thái người dùng bằng cách đặt hoặc xóa emailVerified
    // (Không có trường isActive nên dùng emailVerified để xác định trạng thái)
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        emailVerified: data.isActive ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        accountType: true,
        createdAt: true,
        emailVerified: true,
        lastLogin: true,
        balance: true,
        isAdmin: true,
      },
    });

    // Định dạng dữ liệu phản hồi
    const formattedUser = {
      id: String(updatedUser.id),
      name: updatedUser.name || "",
      email: updatedUser.email,
      image: updatedUser.image,
      accountType: updatedUser.accountType as "REGULAR" | "PREMIUM" | "VIP",
      createdAt: updatedUser.createdAt,
      isVerified: !!updatedUser.emailVerified,
      isActive: !!updatedUser.emailVerified, // Trạng thái hoạt động dựa trên việc đã xác thực email hay chưa
      balance: updatedUser.balance.toString(),
      lastLogin: updatedUser.lastLogin,
      isAdmin: updatedUser.isAdmin,
    };

    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error(`Error updating user status (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
