import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tạo mã tham chiếu duy nhất cho các giao dịch
 * @param prefix Tiền tố của mã (VD: NAP, RUT)
 * @param userId ID người dùng
 * @returns Mã tham chiếu duy nhất
 */
export async function generateUniqueReference(
  prefix: string,
  userId: number
): Promise<string> {
  const timestamp = Date.now().toString().slice(-6);
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}_${userId}_${timestamp}${randomPart}`;
}
