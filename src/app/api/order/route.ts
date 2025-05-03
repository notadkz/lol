import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // hoặc đường dẫn tới authOptions của bạn
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("🟡 Session ở API /api/order:", session);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { accountId } = await req.json();

  if (!accountId) {
    return NextResponse.json({ error: "Thiếu accountId" }, { status: 400 });
  }

  try {
    const userId = Number(session.user.id);

    // Lấy tài khoản cần mua
    const account = await prisma.gameAccount.findUnique({
      where: { id: Number(accountId) },
    });

    if (!account || account.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại hoặc đã bán" },
        { status: 400 }
      );
    }

    // Lấy thông tin người dùng
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    // Kiểm tra số dư
    if (user.balance.lt(account.price)) {
      return NextResponse.json({ error: "Số dư không đủ" }, { status: 400 });
    }

    const totalAmount = account.price;

    // Thực hiện trong transaction để đảm bảo an toàn
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: user.id,
          accountId: account.id,
          totalAmount,
          status: "COMPLETED", // hoặc PENDING nếu cần xác nhận
          paymentMethod: "BALANCE",
        },
      });

      // Trừ tiền người dùng
      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: totalAmount,
          },
        },
      });

      // Cập nhật trạng thái tài khoản game
      await tx.gameAccount.update({
        where: { id: account.id },
        data: {
          status: "SOLD",
          buyerId: user.id,
        },
      });

      // Ghi lịch sử giao dịch
      await tx.transactionHistory.create({
        data: {
          userId: user.id,
          amount: -totalAmount,
          balanceBefore: user.balance,
          balanceAfter: user.balance.minus(totalAmount),
          type: "PURCHASE",
          description: `Mua tài khoản game ID #${account.id}`,
          orderId: newOrder.id,
          status: "SUCCESS",
        },
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Lỗi đặt hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
