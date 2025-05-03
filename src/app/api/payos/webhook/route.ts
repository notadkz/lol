import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Lấy thông tin mỗi trường PayOS
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

// Enum cho trạng thái giao dịch PayOS
enum PayOSStatus {
  PROCESSING = "PROCESSING", // Đang xử lý
  PAID = "PAID", // Đã thanh toán
  CANCELLED = "CANCELLED", // Đã hủy
  ERROR = "ERROR", // Lỗi
  REFUNDED = "REFUNDED", // Đã hoàn tiền
  EXPIRED = "EXPIRED", // Hết hạn
}

// Function kiểm tra chữ ký webhook
function verifyWebhookSignature(data: any, signature: string): boolean {
  if (!PAYOS_CHECKSUM_KEY) {
    console.error("Thiếu cấu hình PAYOS_CHECKSUM_KEY");
    return false;
  }

  try {
    // Tạo chuỗi dữ liệu từ paymentData
    const dataString = JSON.stringify(data);

    // Tạo HMAC sử dụng SHA256 và PAYOS_CHECKSUM_KEY
    const hmac = crypto.createHmac("sha256", PAYOS_CHECKSUM_KEY);
    const calculatedSignature = hmac.update(dataString).digest("hex");

    // So sánh chữ ký đã tính với chữ ký nhận được
    return calculatedSignature === signature;
  } catch (error) {
    console.error("Lỗi khi xác thực chữ ký webhook:", error);
    return false;
  }
}

// Handler xử lý webhook PayOS
export async function POST(req: NextRequest) {
  try {
    // Lấy dữ liệu từ request
    const data = await req.json();
    const signature = req.headers.get("X-Signature") || "";

    /* Dùng để config webhook PayOS */
    // if (!data.orderCode && !data.transactionId && !signature) {
    //   console.log("🔧 Ping kiểm tra webhook từ PayOS → Trả về 200 OK");
    //   return NextResponse.json({ message: "Webhook OK" }, { status: 200 });
    // }
    // console.log("Nhận webhook PayOS:", JSON.stringify(data));

    // Kiểm tra cấu trúc dữ liệu webhook của PayOS
    if (!data || typeof data !== "object") {
      console.error("Dữ liệu webhook không hợp lệ:", data);
      return NextResponse.json(
        { error: "Dữ liệu webhook không hợp lệ" },
        { status: 400 }
      );
    }

    // Xử lý dữ liệu webhook theo định dạng mới
    // Nếu có trường data thì là định dạng mới
    let paymentData = data;
    let orderCode = null;
    let status = null;

    if (data.data && typeof data.data === "object") {
      paymentData = data.data;
      // Tìm orderCode
      orderCode = paymentData.orderCode;
      // Xác định trạng thái
      status =
        data.code === "00" && data.success
          ? PayOSStatus.PAID
          : PayOSStatus.ERROR;
    } else {
      // Định dạng cũ
      orderCode = data.orderCode;
      status = data.status;
    }

    // Kiểm tra dữ liệu
    if (!orderCode) {
      console.error("Thiếu mã giao dịch trong webhook:", data);
      return NextResponse.json(
        { error: "Thiếu mã giao dịch" },
        { status: 400 }
      );
    }

    // Tìm giao dịch theo mã tham chiếu
    let transactionData = await prisma.topUpTransaction.findFirst({
      where: {
        transactionCode: orderCode.toString(), // so sánh đúng với orderCode đã truyền
      },
      include: {
        user: true,
      },
    });

    if (!transactionData) {
      // Kiểm tra xem có thể tìm bằng reference từ webhook không
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

    // Kiểm tra nếu giao dịch đã được xử lý trước đó
    if (transactionData.status === "SUCCESS") {
      console.log("Giao dịch đã được xử lý trước đó:", orderCode);
      return NextResponse.json({ message: "Giao dịch đã được xử lý" });
    }

    // Xử lý theo trạng thái thanh toán
    if (status === PayOSStatus.PAID) {
      console.log("Xử lý giao dịch thành công:", orderCode);

      // Cập nhật trạng thái giao dịch
      await prisma.topUpTransaction.update({
        where: {
          id: transactionData.id,
        },
        data: {
          status: "SUCCESS",
          transferTime: new Date(),
          apiResponse: JSON.stringify(data),
          bankReference:
            data.transactionId || paymentData.transactionId || null,
        },
      });

      // Lấy thông tin user
      const user = transactionData.user;
      if (!user) {
        console.error(
          "Không tìm thấy thông tin người dùng:",
          transactionData.userId
        );
        return NextResponse.json(
          { error: "Không tìm thấy thông tin người dùng" },
          { status: 404 }
        );
      }

      // Cập nhật số dư người dùng
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          balance: {
            increment: Number(transactionData.amount),
          },
        },
      });

      // Tạo bản ghi lịch sử giao dịch
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

      // Tạo thông báo cho người dùng
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
      // Cập nhật trạng thái giao dịch thất bại
      await prisma.topUpTransaction.update({
        where: {
          id: transactionData.id,
        },
        data: {
          status: "FAILED",
          apiResponse: JSON.stringify(data),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Giao dịch đã được cập nhật thành thất bại",
      });
    } else {
      // Trường hợp còn đang xử lý
      console.log("Giao dịch đang xử lý:", orderCode);
      return NextResponse.json({
        success: true,
        message: "Giao dịch đang được xử lý",
      });
    }
  } catch (error: any) {
    console.error("Lỗi xử lý webhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi xử lý webhook",
      },
      { status: 500 }
    );
  }
}
