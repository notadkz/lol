import crypto from "crypto";

export function generateSignature(
  payload: {
    orderCode: number; // ✅ đổi từ string → number
    amount: number;
    description: string;
    cancelUrl: string;
    returnUrl: string;
  },
  checksumKey: string
): string {
  const sortedKeys = [
    "amount",
    "cancelUrl",
    "description",
    "orderCode",
    "returnUrl",
  ];
  const dataString = sortedKeys
    .map((key) => `${key}=${payload[key as keyof typeof payload]}`)
    .join("&");

  return crypto
    .createHmac("sha256", checksumKey)
    .update(dataString)
    .digest("hex");
}
