import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/admin/users/[id] - Lấy thông tin chi tiết người dùng
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

    const { id } = params;

    // Lấy thông tin người dùng từ database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
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
        phone: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    // Định dạng dữ liệu phản hồi
    const formattedUser = {
      id: String(user.id),
      name: user.name || "",
      email: user.email,
      image: user.image,
      accountType: user.accountType as "REGULAR" | "PREMIUM" | "VIP",
      createdAt: user.createdAt,
      isVerified: !!user.emailVerified,
      isActive: !!user.emailVerified,
      balance: user.balance.toString(),
      lastLogin: user.lastLogin,
      phone: user.phone,
      isAdmin: user.isAdmin,
    };

    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error(`Error fetching user (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Cập nhật thông tin người dùng
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

    // Cập nhật thông tin người dùng
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        image: data.image !== undefined ? data.image : undefined,
        accountType:
          data.accountType !== undefined ? data.accountType : undefined,
        emailVerified:
          data.isVerified !== undefined
            ? data.isVerified
              ? new Date()
              : null
            : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
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
        phone: true,
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
      isActive: !!updatedUser.emailVerified,
      balance: updatedUser.balance.toString(),
      lastLogin: updatedUser.lastLogin,
      phone: updatedUser.phone,
    };

    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error(`Error updating user (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Xóa người dùng
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

    const { id } = params;

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

    // Xóa người dùng
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Xóa người dùng thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error deleting user (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
