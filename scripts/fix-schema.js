/**
 * Script tự động hóa quá trình cập nhật schema và tạo migration
 * Sử dụng: node scripts/fix-schema.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ANSI color codes cho output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.bright}${colors.blue}=== Bắt đầu quá trình cập nhật Schema Prisma ===${colors.reset}\n`
);

// Kiểm tra file schema.prisma đã được cập nhật
try {
  console.log(`${colors.cyan}→ Kiểm tra schema Prisma...${colors.reset}`);
  const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
  const schemaContent = fs.readFileSync(schemaPath, "utf8");

  // Kiểm tra xem schema đã cập nhật chưa
  if (
    schemaContent.includes("ranks          String[]") ||
    schemaContent.includes("images         String[]")
  ) {
    console.log(
      `${colors.red}✗ Schema chưa được cập nhật. Hãy cập nhật schema theo hướng dẫn trong src/app/summary/2023-11-29-schema-fix.md${colors.reset}`
    );
    process.exit(1);
  }

  console.log(`${colors.green}✓ Schema đã được cập nhật${colors.reset}`);
} catch (error) {
  console.error(
    `${colors.red}✗ Lỗi khi kiểm tra schema: ${error.message}${colors.reset}`
  );
  process.exit(1);
}

// Chạy lệnh format schema
try {
  console.log(`\n${colors.cyan}→ Format schema Prisma...${colors.reset}`);
  execSync("npx prisma format", { stdio: "inherit" });
  console.log(`${colors.green}✓ Format schema thành công${colors.reset}`);
} catch (error) {
  console.error(
    `${colors.red}✗ Lỗi khi format schema: ${error.message}${colors.reset}`
  );
  process.exit(1);
}

// Tạo Prisma Client mới
try {
  console.log(`\n${colors.cyan}→ Tạo Prisma Client mới...${colors.reset}`);
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log(`${colors.green}✓ Tạo Prisma Client thành công${colors.reset}`);
} catch (error) {
  console.error(
    `${colors.red}✗ Lỗi khi tạo Prisma Client: ${error.message}${colors.reset}`
  );
  process.exit(1);
}

// Nhắc nhở người dùng tạo migration
console.log(
  `\n${colors.yellow}${colors.bright}! Chú ý: ${colors.reset}${colors.yellow}Bạn cần tạo migration cho cơ sở dữ liệu.${colors.reset}`
);
console.log(
  `${colors.yellow}Nếu database đã có dữ liệu thực, hãy thực hiện thêm các bước sau:${colors.reset}`
);
console.log(
  `\n${colors.cyan}1. Tạo bản sao lưu database (backup)${colors.reset}`
);
console.log(`${colors.cyan}2. Tạo migration:${colors.reset}`);
console.log(
  `   ${colors.dim}npx prisma migrate dev --name update_game_account_structure${colors.reset}`
);

// Nhắc nhở cập nhật API và front-end
console.log(
  `\n${colors.yellow}${colors.bright}! Chú ý: ${colors.reset}${colors.yellow}Bạn cần cập nhật các file API và front-end components.${colors.reset}`
);
console.log(
  `${colors.yellow}Xem chi tiết tại: ${colors.underscore}src/app/summary/2023-11-29-schema-fix.md${colors.reset}`
);

console.log(
  `\n${colors.bright}${colors.green}=== Đã hoàn thành quá trình chuẩn bị cập nhật Schema Prisma ===${colors.reset}`
);
