import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Thực tế, bạn sẽ cần có lưu trữ dữ liệu (ví dụ: database như MongoDB, PostgreSQL, etc.)
// API này chỉ là mẫu - bạn cần thay thế bằng code thực tế kết nối đến database
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

    // Kiểm tra độ dài mật khẩu
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Mật khẩu phải có ít nhất 8 ký tự" },
        { status: 400 }
      );
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu thông tin người dùng vào MySQL database

    const prisma = new PrismaClient();

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

    // Giả lập kiểm tra email đã tồn tại (thực tế cần kiểm tra trong database)
    if (email === "example@example.com") {
      return NextResponse.json(
        { message: "Email đã được sử dụng" },
        { status: 400 }
      );
    }

    // Giả lập lưu user thành công
    console.log("Đăng ký người dùng mới:", {
      name,
      email,
      password: "HASHED", // Không bao giờ log mật khẩu thật
    });

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
