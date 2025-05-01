import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateUniqueReference } from "@/lib/utils";
import { generateSignature } from "@/lib/payos"; // 👈 đã tạo ở lib/payos.ts
import axios from "axios";

// Lấy thông tin môi trường PayOS
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;
const PAYOS_API_URL =
  process.env.PAYOS_API_URL || "https://api-merchant.payos.vn";

// Endpoint tạo thanh toán
export async function POST(req: NextRequest) {
  try {
    // Kiểm tra config
    if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
      return NextResponse.json(
        { error: "Thiếu cấu hình PayOS" },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    const dbUserId = user.id;
    const reqData = await req.json();
    const { amount, description = "" } = reqData;

    if (!amount || amount < 50000) {
      return NextResponse.json(
        { error: "Số tiền nạp tối thiểu là 50,000 VNĐ" },
        { status: 400 }
      );
    }

    const reference = await generateUniqueReference("NAP", dbUserId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // ✅ orderPayload: dữ liệu dùng để ký và gửi
    const orderPayload: any = {
      orderCode: reference,
      amount: Number(amount),
      description: description || `Nap tien - ${userEmail}`,
      cancelUrl: `${appUrl}/user/deposit?status=cancel`,
      returnUrl: `${appUrl}/payment/success?reference=${reference}`,
      buyerName: user.name || userEmail.split("@")[0],
      buyerEmail: userEmail,
    };

    // ✅ chỉ thêm buyerPhone nếu hợp lệ
    if (user.phone && /^0\d{9}$/.test(user.phone)) {
      orderPayload.buyerPhone = user.phone;
    }

    // ✅ Tạo signature
    const signature = generateSignature(orderPayload, PAYOS_CHECKSUM_KEY);

    // ✅ Payload cuối cùng gửi PayOS
    const finalPayload = {
      ...orderPayload,
      signature,
    };

    const headers = {
      "x-client-id": PAYOS_CLIENT_ID,
      "x-api-key": PAYOS_API_KEY,
      "Content-Type": "application/json",
    };

    // Gọi PayOS
    const payosResponse = await axios.post(
      `${PAYOS_API_URL}/v2/payment-requests`,
      finalPayload,
      {
        headers,
      }
    );

    const payosData = payosResponse.data;
    if (!payosData || payosData.code !== "00" || !payosData.data) {
      return NextResponse.json(
        {
          success: false,
          error: `Lỗi từ PayOS: ${
            payosData?.desc || "Không thể tạo thanh toán"
          }`,
          details: payosData,
        },
        { status: 500 }
      );
    }

    const paymentData = payosData.data;

    let bankAccount = await prisma.bankAccount.findFirst({
      where: { isActive: true },
    });

    if (!bankAccount) {
      bankAccount = await prisma.bankAccount.create({
        data: {
          bankName: "PayOS",
          accountNumber: "PayOS",
          accountHolder: "PayOS",
          branch: "PayOS Gateway",
          isActive: true,
        },
      });
    }

    await prisma.topUpTransaction.create({
      data: {
        userId: dbUserId,
        amount: Number(amount),
        bankAccountId: bankAccount.id,
        reference: reference,
        transactionCode: paymentData.id || "",
        status: "PENDING",
        transferContent: description || `Nạp tiền - ${userEmail}`,
      },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: paymentData.checkoutUrl,
      qrCode: paymentData.qrCode,
      paymentInfo: {
        bankName: "VietQR",
        amount: amount,
        description: description || `Nạp tiền - ${userEmail}`,
      },
      reference: reference,
    });
  } catch (error: any) {
    console.error("Lỗi tạo thanh toán:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Có lỗi xảy ra khi tạo thanh toán",
      },
      { status: 500 }
    );
  }
}
