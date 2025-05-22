import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// POST: Yêu cầu đặt lại mật khẩu
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // Kiểm tra dữ liệu đầu vào
    if (!email) {
      return NextResponse.json({ error: "Email là bắt buộc" }, { status: 400 });
    }

    // Kiểm tra người dùng tồn tại
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      // Vì lý do bảo mật, vẫn trả về thành công ngay cả khi không tìm thấy email
      return NextResponse.json(
        {
          message:
            "Nếu email tồn tại, một hướng dẫn đặt lại mật khẩu sẽ được gửi đến email đó.",
        },
        { status: 200 }
      );
    }

    // Tạo token đặt lại mật khẩu
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Kiểm tra và xóa token cũ nếu có
    await (prisma as any).PasswordReset.deleteMany({
      where: { userId: user.id },
    });

    // Lưu token vào database
    await (prisma as any).PasswordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // Hết hạn sau 1 giờ
      },
    });

    // Tạo URL đặt lại mật khẩu
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Trong thực tế, bạn sẽ gửi email với đường dẫn đặt lại mật khẩu
    // sendResetPasswordEmail(user.email, resetUrl);

    // Không log URL đặt lại mật khẩu vì lý do bảo mật
    console.log("Email đặt lại mật khẩu đã được tạo cho:", user.email);

    return NextResponse.json(
      {
        message: "Đã gửi email hướng dẫn đặt lại mật khẩu",
        // Trong môi trường phát triển, có thể trả về thêm URL để test
        ...(process.env.NODE_ENV !== "production" && { resetUrl }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi khi xử lý yêu cầu đặt lại mật khẩu:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xử lý yêu cầu đặt lại mật khẩu" },
      { status: 500 }
    );
  }
}
