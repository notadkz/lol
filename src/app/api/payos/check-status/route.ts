import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "Thiếu mã tham chiếu", success: false },
      { status: 400 }
    );
  }

  const transaction = await prisma.topUpTransaction.findFirst({
    where: { reference },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Không tìm thấy giao dịch", success: false },
      { status: 404 }
    );
  }

  return NextResponse.json({ status: transaction.status, success: true });
}
