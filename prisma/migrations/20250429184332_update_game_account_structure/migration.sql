/*
  Warnings:

  - The primary key for the `accountchampion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `accountchroma` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `accountemote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `accounticon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `accountskin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `accountward` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `completedAt` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `couponId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `finalAmount` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `order` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `paymentMethod` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(5))`.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `AccountChampion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `AccountChroma` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `AccountEmote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `AccountIcon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `AccountSkin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `AccountWard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `Account_buyerId_fkey`;

-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `Account_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `accountchampion` DROP FOREIGN KEY `AccountChampion_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `accountchroma` DROP FOREIGN KEY `AccountChroma_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `accountemote` DROP FOREIGN KEY `AccountEmote_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `accounticon` DROP FOREIGN KEY `AccountIcon_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `accountskin` DROP FOREIGN KEY `AccountSkin_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `accountward` DROP FOREIGN KEY `AccountWard_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `chroma` DROP FOREIGN KEY `Chroma_skinId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `skin` DROP FOREIGN KEY `Skin_championId_fkey`;

-- DropForeignKey
ALTER TABLE `wishlist` DROP FOREIGN KEY `Wishlist_accountId_fkey`;

-- DropIndex
DROP INDEX `Chroma_name_skinId_key` ON `chroma`;

-- DropIndex
DROP INDEX `Chroma_skinId_fkey` ON `chroma`;

-- DropIndex
DROP INDEX `Order_userId_fkey` ON `order`;

-- DropIndex
DROP INDEX `Review_accountId_fkey` ON `review`;

-- DropIndex
DROP INDEX `Skin_championId_fkey` ON `skin`;

-- DropIndex
DROP INDEX `Skin_name_championId_key` ON `skin`;

-- DropIndex
DROP INDEX `Wishlist_accountId_fkey` ON `wishlist`;

-- AlterTable
ALTER TABLE `accountchampion` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `accountchroma` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `accountemote` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `accounticon` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `accountskin` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `accountward` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `champion` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `chroma` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `emote` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `icon` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `completedAt`,
    DROP COLUMN `couponId`,
    DROP COLUMN `discountAmount`,
    DROP COLUMN `finalAmount`,
    DROP COLUMN `note`,
    DROP COLUMN `userId`,
    ADD COLUMN `accountId` INTEGER NOT NULL,
    ADD COLUMN `buyerId` INTEGER NOT NULL,
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    MODIFY `totalAmount` DECIMAL(10, 2) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    MODIFY `paymentMethod` ENUM('MOMO', 'ZALOPAY', 'VNPAY', 'BANK_TRANSFER', 'E_WALLET', 'BALANCE') NOT NULL DEFAULT 'MOMO';

-- AlterTable
ALTER TABLE `skin` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ward` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `account`;

-- CreateTable
CREATE TABLE `GameAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `emailPassword` VARCHAR(191) NULL,
    `soloRank` ENUM('UNRANKED', 'SAT', 'DONG', 'BAC', 'VANG', 'BACH_KIM', 'KIM_CUONG', 'CAO_THU', 'DAI_CAO_THU', 'THACH_DAU') NOT NULL DEFAULT 'UNRANKED',
    `flexRank` ENUM('UNRANKED', 'SAT', 'DONG', 'BAC', 'VANG', 'BACH_KIM', 'KIM_CUONG', 'CAO_THU', 'DAI_CAO_THU', 'THACH_DAU') NOT NULL DEFAULT 'UNRANKED',
    `tftRank` ENUM('UNRANKED', 'SAT', 'DONG', 'BAC', 'VANG', 'BACH_KIM', 'KIM_CUONG', 'CAO_THU', 'DAI_CAO_THU', 'THACH_DAU') NOT NULL DEFAULT 'UNRANKED',
    `level` INTEGER NOT NULL DEFAULT 30,
    `blueEssence` INTEGER NOT NULL DEFAULT 0,
    `riotPoints` INTEGER NOT NULL DEFAULT 0,
    `championCount` INTEGER NOT NULL DEFAULT 0,
    `skinCount` INTEGER NOT NULL DEFAULT 0,
    `chromaCount` INTEGER NOT NULL DEFAULT 0,
    `price` DOUBLE NOT NULL,
    `originalPrice` DOUBLE NULL,
    `discount` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'AVAILABLE',
    `description` TEXT NULL,
    `imageUrls` TEXT NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `featuredUntil` DATETIME(3) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sellerId` INTEGER NULL,
    `buyerId` INTEGER NULL,
    `orderId` INTEGER NULL,

    UNIQUE INDEX `GameAccount_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Listing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `accountId` INTEGER NOT NULL,
    `sellerId` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('ACTIVE', 'SOLD', 'PENDING', 'REJECTED', 'PAUSED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Listing_accountId_key`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `auth_accounts_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Order_accountId_key` ON `Order`(`accountId`);

-- AddForeignKey
ALTER TABLE `GameAccount` ADD CONSTRAINT `GameAccount_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameAccount` ADD CONSTRAINT `GameAccount_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountChampion` ADD CONSTRAINT `AccountChampion_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountSkin` ADD CONSTRAINT `AccountSkin_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountChroma` ADD CONSTRAINT `AccountChroma_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountWard` ADD CONSTRAINT `AccountWard_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountEmote` ADD CONSTRAINT `AccountEmote_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountIcon` ADD CONSTRAINT `AccountIcon_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `GameAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auth_accounts` ADD CONSTRAINT `auth_accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
