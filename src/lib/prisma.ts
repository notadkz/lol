import { PrismaClient } from "@prisma/client";

// Tạo một instance PrismaClient toàn cục để tránh tạo nhiều kết nối
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Sử dụng instance đã tồn tại hoặc tạo mới
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Chỉ khởi tạo prisma một lần trong môi trường không phải production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
