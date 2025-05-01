import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { prisma } from "@/lib/prisma";

// POST: Đặt lại mật khẩu từ token
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    // Kiểm tra các trường bắt buộc
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token và mật khẩu mới là bắt buộc" },
        { status: 400 }
      );
    }

    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 8 ký tự" },
        { status: 400 }
      );
    }

    // Hash token để so sánh với token trong DB (vì token được lưu dưới dạng hash)
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Tìm token trong DB sử dụng hashedToken
    const passwordReset = await (prisma as any).PasswordReset.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    // Kiểm tra xem token có tồn tại không
    if (!passwordReset) {
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    // Kiểm tra xem token có hết hạn không
    if (passwordReset.expires < new Date()) {
      // Xóa token hết hạn
      await (prisma as any).PasswordReset.delete({
        where: { id: passwordReset.id },
      });

      return NextResponse.json(
        { error: "Token đã hết hạn, vui lòng yêu cầu lại" },
        { status: 400 }
      );
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới trong DB
    await prisma.user.update({
      where: { id: passwordReset.userId },
      data: { password: hashedPassword },
    });

    // Xóa token đã sử dụng
    await (prisma as any).PasswordReset.delete({
      where: { id: passwordReset.id },
    });

    return NextResponse.json({
      success: true,
      message:
        "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
    });
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đặt lại mật khẩu" },
      { status: 500 }
    );
  }
}
