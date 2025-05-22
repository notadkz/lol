import { NextRequest, NextResponse } from "next/server";
import rateLimit from "express-rate-limit";
import { IncomingMessage, ServerResponse } from "http";

// Tạo một bản đồ để lưu trữ IP và số lần request
const rateLimitMap = new Map();

// Hàm kiểm tra rate limit
export function checkRateLimit(
  req: NextRequest,
  apiEndpoint: string,
  maxRequests: number,
  windowMs: number
) {
  // Lấy địa chỉ IP của client
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "anonymous";

  // Tạo khóa cho endpoint và IP cụ thể
  const key = `${apiEndpoint}:${ip}`;

  // Lấy thông tin requests hiện tại
  const currentRequests = rateLimitMap.get(key) || {
    count: 0,
    resetTime: Date.now() + windowMs,
  };

  // Nếu đã quá thời gian reset, reset lại số lần request
  if (Date.now() > currentRequests.resetTime) {
    currentRequests.count = 0;
    currentRequests.resetTime = Date.now() + windowMs;
  }

  // Tăng số lần request
  currentRequests.count += 1;

  // Cập nhật lại bản đồ
  rateLimitMap.set(key, currentRequests);

  // Kiểm tra xem có vượt quá giới hạn không
  if (currentRequests.count > maxRequests) {
    const timeRemaining = Math.ceil(
      (currentRequests.resetTime - Date.now()) / 1000
    );
    return {
      limited: true,
      timeRemaining,
    };
  }

  return {
    limited: false,
    timeRemaining: 0,
  };
}

// Cấu hình cho login attempts
export const loginRateLimit = {
  maxRequests: 5, // 5 lần đăng nhập thất bại
  windowMs: 15 * 60 * 1000, // trong 15 phút
};

// Cấu hình cho forgot password
export const forgotPasswordRateLimit = {
  maxRequests: 3, // 3 lần yêu cầu đặt lại mật khẩu
  windowMs: 60 * 60 * 1000, // trong 1 giờ
};
