import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

enum PayOSStatus {
  PROCESSING = "PROCESSING",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
  ERROR = "ERROR",
  REFUNDED = "REFUNDED",
  EXPIRED = "EXPIRED",
}

function verifyWebhookSignature(data: any, signature: string): boolean {
  if (!PAYOS_CHECKSUM_KEY) {
    console.error("Thiếu cấu hình PAYOS_CHECKSUM_KEY");
    return false;
  }

  try {
    const dataString = JSON.stringify(data);
    const hmac = crypto.createHmac("sha256", PAYOS_CHECKSUM_KEY);
    const calculatedSignature = hmac.update(dataString).digest("hex");
    return calculatedSignature === signature;
  } catch (error) {
    console.error("Lỗi khi xác thực chữ ký webhook:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const signature = req.headers.get("X-Signature") || "";

    const isPing = !data?.orderCode && !data?.transactionId && !signature;

    // Kiểm tra dữ liệu cơ bản
    if (!data || typeof data !== "object") {
      console.error("Dữ liệu webhook không hợp lệ:", data);
      return NextResponse.json(
        { error: "Dữ liệu webhook không hợp lệ" },
        { status: 400 }
      );
    }

    // Xác định dữ liệu thanh toán và trạng thái
    let paymentData = data;
    let orderCode = null;
    let status = null;

    if (data.data && typeof data.data === "object") {
      paymentData = data.data;
      orderCode = paymentData.orderCode;
      status =
        data.code === "00" && data.success
          ? PayOSStatus.PAID
          : PayOSStatus.ERROR;
    } else {
      orderCode = data.orderCode;
      status = data.status;
    }

    // Nếu chỉ là ping → trả về OK ở cuối
    if (isPing) {
      console.log("🔧 Nhận ping webhook từ PayOS");
      return NextResponse.json({ message: "Webhook ping OK" });
    }

    if (!orderCode) {
      console.error("Thiếu mã giao dịch trong webhook:", data);
      return NextResponse.json(
        { error: "Thiếu mã giao dịch" },
        { status: 400 }
      );
    }

    let transactionData = await prisma.topUpTransaction.findFirst({
      where: { transactionCode: orderCode.toString() },
      include: { user: true },
    });

    if (!transactionData) {
      const reference = paymentData.reference || data.reference;
      if (reference) {
        transactionData = await prisma.topUpTransaction.findFirst({
          where: { reference: reference.toString() },
          include: { user: true },
        });
      }

      if (!transactionData) {
        console.error("Không tìm thấy giao dịch:", orderCode);
        return NextResponse.json(
          { error: "Không tìm thấy giao dịch" },
          { status: 404 }
        );
      }
    }

    if (transactionData.status === "SUCCESS") {
      console.log("Giao dịch đã xử lý:", orderCode);
      return NextResponse.json({ message: "Đã xử lý" });
    }

    if (status === PayOSStatus.PAID) {
      console.log("✅ Giao dịch thành công:", orderCode);

      await prisma.topUpTransaction.update({
        where: { id: transactionData.id },
        data: {
          status: "SUCCESS",
          transferTime: new Date(),
          apiResponse: JSON.stringify(data),
          bankReference:
            data.transactionId || paymentData.transactionId || null,
        },
      });

      const user = transactionData.user;
      if (!user) {
        console.error("Không tìm thấy user:", transactionData.userId);
        return NextResponse.json(
          { error: "Không tìm thấy người dùng" },
          { status: 404 }
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: Number(transactionData.amount),
          },
        },
      });

      await prisma.transactionHistory.create({
        data: {
          userId: user.id,
          amount: Number(transactionData.amount),
          balanceBefore: Number(user.balance),
          balanceAfter: Number(updatedUser.balance),
          type: "TOPUP",
          description: `Nạp tiền qua PayOS - ${transactionData.reference}`,
          reference: transactionData.reference,
          status: "SUCCESS",
          topUpTransactionId: transactionData.id,
          metadata: JSON.stringify({
            paymentId: data.transactionId || null,
            paymentMethod: "PayOS",
            paymentTime: new Date().toISOString(),
          }),
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Nạp tiền thành công",
          content: `Bạn đã nạp thành công ${Number(
            transactionData.amount
          ).toLocaleString("vi-VN")} VNĐ vào tài khoản.`,
          type: "PAYMENT",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Giao dịch đã được xử lý thành công",
      });
    } else if (
      status === PayOSStatus.CANCELLED ||
      status === PayOSStatus.ERROR ||
      status === PayOSStatus.EXPIRED
    ) {
      await prisma.topUpTransaction.update({
        where: { id: transactionData.id },
        data: {
          status: "FAILED",
          apiResponse: JSON.stringify(data),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Giao dịch đã cập nhật thành thất bại",
      });
    } else {
      console.log("Giao dịch đang xử lý:", orderCode);
      return NextResponse.json({
        success: true,
        message: "Giao dịch đang được xử lý",
      });
    }
  } catch (error: any) {
    console.error("❌ Lỗi xử lý webhook:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý webhook" },
      { status: 500 }
    );
  }
}
