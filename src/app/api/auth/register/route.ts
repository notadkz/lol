import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Vui lòng cung cấp đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Kiểm tra độ dài và độ phức tạp của mật khẩu    if (password.length < 8) {      return NextResponse.json(        { message: "Mật khẩu phải có ít nhất 8 ký tự" },        { status: 400 }      );    }        // Kiểm tra mật khẩu có chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;    if (!passwordRegex.test(password)) {      return NextResponse.json(        {           message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"         },        { status: 400 }      );    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email đã được sử dụng" },
        { status: 400 }
      );
    }

    // Tạo người dùng mới
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Ghi log thành công mà không tiết lộ thông tin nhạy cảm    console.log("Đăng ký người dùng mới thành công");

    return NextResponse.json(
      {
        message: "Đăng ký thành công",
        user: {
          name,
          email,
          // Không bao giờ trả về mật khẩu, kể cả đã hash
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      {
        message: "Đã xảy ra lỗi khi đăng ký",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      },
      { status: 500 }
    );
  }
}
