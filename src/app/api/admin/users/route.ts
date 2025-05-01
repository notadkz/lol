import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/admin/users - Lấy danh sách người dùng
export async function GET(req: NextRequest) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Bạn không có quyền truy cập trang này",
        },
        { status: 401 }
      );
    }

    // Lấy các thông số truy vấn
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || undefined;
    const accountType = searchParams.get("accountType") || undefined;

    // Tạo object điều kiện tìm kiếm
    const where: any = {};

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (accountType && accountType !== "all") {
      where.accountType = accountType;
    }

    // Đếm tổng số người dùng phù hợp với điều kiện
    const total = await prisma.user.count({ where });

    // Lấy danh sách người dùng
    const users = await prisma.user.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Chuyển đổi dữ liệu để phù hợp với giao diện
    const formattedUsers = users.map((user) => ({
      id: String(user.id), // Chuyển ID thành string để phù hợp với giao diện
      name: user.name || "",
      email: user.email,
      image: user.image,
      accountType: user.accountType as "REGULAR" | "PREMIUM" | "VIP",
      createdAt: user.createdAt,
      isVerified: !!user.emailVerified, // Nếu emailVerified có giá trị thì là đã xác thực
      isActive: true, // Mặc định là active vì không có trường isActive trong schema
      balance: user.balance.toString(),
      lastLogin: user.lastLogin,
      isAdmin: user.isAdmin, // Thêm thông tin isAdmin
    }));

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: formattedUsers,
      total,
      page,
      totalPages,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Tạo người dùng mới
export async function POST(req: NextRequest) {
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

    const data = await req.json();

    // Validate dữ liệu đầu vào
    if (!data.email || !data.name) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Email và tên người dùng là bắt buộc",
        },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email already exists",
          message: "Email này đã được đăng ký",
        },
        { status: 409 }
      );
    }

    // Tạo mật khẩu ngẫu nhiên
    const randomPassword = Math.random().toString(36).slice(-10);

    // Tạo người dùng mới
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: randomPassword, // Cần hash trước khi lưu vào DB trong trường hợp thật
        image: data.image || null,
        accountType: data.accountType || "REGULAR",
        emailVerified: data.isVerified ? new Date() : null,
        balance: 0,
      },
    });

    // Chuyển đổi dữ liệu để phù hợp với giao diện
    const formattedUser = {
      id: String(newUser.id),
      name: newUser.name || "",
      email: newUser.email,
      image: newUser.image,
      accountType: newUser.accountType as "REGULAR" | "PREMIUM" | "VIP",
      createdAt: newUser.createdAt,
      isVerified: !!newUser.emailVerified,
      isActive: true,
      balance: newUser.balance.toString(),
    };

    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
