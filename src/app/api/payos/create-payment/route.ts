import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateUniqueReference } from "@/lib/utils";
import { generateSignature } from "@/lib/payos";
import axios from "axios";

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;
const PAYOS_API_URL =
  process.env.PAYOS_API_URL || "https://api-merchant.payos.vn";

interface SignPayload {
  orderCode: number;
  amount: number;
  description: string;
  cancelUrl: string;
  returnUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
      return NextResponse.json(
        { error: "Thiếu cấu hình PayOS" },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
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
    const { amount, description = "" } = await req.json();

    if (!amount || amount < 5000) {
      return NextResponse.json(
        { error: "Số tiền nạp tối thiểu là 5,000 VNĐ" },
        { status: 400 }
      );
    }

    const orderCode = Number(`${dbUserId}${Date.now() % 1000000}`);
    const reference = `NAP_${orderCode}`; // <- vẫn giữ reference là string

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const signPayload: SignPayload = {
      orderCode,
      amount: Number(amount),
      description: description || `Nap tien - ${userEmail}`,
      cancelUrl: `${appUrl}/user/deposit?status=cancel`,
      returnUrl: `${appUrl}/payment/success?reference=${reference}`,
    };

    const signature = generateSignature(signPayload, PAYOS_CHECKSUM_KEY);

    const finalPayload: any = {
      ...signPayload,
      signature,
      buyerName: user.name || userEmail.split("@")[0],
      buyerEmail: userEmail,
    };

    if (user.phone && /^0\d{9}$/.test(user.phone)) {
      finalPayload.buyerPhone = user.phone;
    }

    const headers = {
      "x-client-id": PAYOS_CLIENT_ID,
      "x-api-key": PAYOS_API_KEY,
      "Content-Type": "application/json",
    };

    const payosResponse = await axios.post(
      `${PAYOS_API_URL}/v2/payment-requests`,
      finalPayload,
      { headers }
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
        reference,
        transactionCode: orderCode.toString(),
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
        amount,
        description: description || `Nạp tiền - ${userEmail}`,
      },
      reference,
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
