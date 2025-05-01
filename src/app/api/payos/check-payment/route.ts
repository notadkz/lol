import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Lấy phiên đăng nhập từ NextAuth
    const session = await getServerSession(authOptions);

    // Kiểm tra đăng nhập
    if (!session?.user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thực hiện chức năng này" },
        { status: 401 }
      );
    }

    // Lấy tham số reference từ URL
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Thiếu mã tham chiếu giao dịch" },
        { status: 400 }
      );
    }

    // Tìm giao dịch theo mã tham chiếu
    const transaction = await prisma.topUpTransaction.findFirst({
      where: {
        reference: reference,
        userId: Number(session.user.id),
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Không tìm thấy giao dịch" },
        { status: 404 }
      );
    }

    // Kiểm tra nếu cần cập nhật trạng thái (nếu đã thanh toán thành công trên PayOS nhưng chưa cập nhật trong database)
    // Thực tế, bạn có thể gọi API PayOS để kiểm tra trạng thái hiện tại
    // Code bổ sung ở đây...

    // Trả về thông tin giao dịch
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi khi kiểm tra trạng thái thanh toán",
      },
      { status: 500 }
    );
  }
}
