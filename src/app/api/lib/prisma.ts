import { PrismaClient } from "@prisma/client";

// Khai báo biến toàn cục để tránh tạo nhiều instance Prisma Client trong môi trường phát triển
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Tạo instance của Prisma Client
const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// Gán cho biến toàn cục trong môi trường phát triển để giữ kết nối giữa các lần hot-reload
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
