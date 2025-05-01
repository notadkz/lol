import crypto from "crypto";

/**
 * Tạo chữ ký (signature) để xác thực dữ liệu gửi lên PayOS
 * @param payload - Dữ liệu gửi lên API
 * @param checksumKey - Khóa bí mật do PayOS cung cấp
 * @returns Chuỗi chữ ký HMAC-SHA256
 */
export function generateSignature(payload: any, checksumKey: string): string {
  const rawData = JSON.stringify(payload);
  return crypto.createHmac("sha256", checksumKey).update(rawData).digest("hex");
}
