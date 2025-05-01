import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";

// POST /api/accounts/change-password - Thay đổi mật khẩu cho người dùng đăng nhập
export async function POST(req: NextRequest) {
  try {
    // Lấy phiên người dùng đăng nhập
    const session = await getServerSession(authOptions);

    // Kiểm tra người dùng đã đăng nhập chưa
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Vui lòng đăng nhập để tiếp tục" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    // Kiểm tra các trường bắt buộc
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Missing fields", message: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error: "Invalid password",
          message: "Mật khẩu mới phải có ít nhất 8 ký tự",
        },
        { status: 400 }
      );
    }

    // Lấy thông tin người dùng từ database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          error: "Invalid user",
          message:
            "Không tìm thấy thông tin tài khoản hoặc tài khoản không có mật khẩu",
        },
        { status: 404 }
      );
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Invalid password",
          message: "Mật khẩu hiện tại không chính xác",
        },
        { status: 400 }
      );
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Mật khẩu đã được thay đổi thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
