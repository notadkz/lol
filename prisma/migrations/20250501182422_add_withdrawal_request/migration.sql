/*
  Warnings:

  - Added the required column `reference` to the `TopUpTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `topuptransaction` ADD COLUMN `reference` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `WithdrawalRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reference` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `accountHolder` VARCHAR(191) NOT NULL,
    `processingNote` TEXT NULL,
    `adminId` INTEGER NULL,
    `processedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `balanceBefore` DECIMAL(65, 30) NOT NULL,
    `balanceAfter` DECIMAL(65, 30) NOT NULL,
    `type` ENUM('TOPUP', 'WITHDRAWAL', 'PURCHASE', 'REFUND', 'COMMISSION', 'ADMIN') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `topUpTransactionId` INTEGER NULL,
    `withdrawalRequestId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `refundRequestId` INTEGER NULL,
    `adminId` INTEGER NULL,
    `adminNote` TEXT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WithdrawalRequest` ADD CONSTRAINT `WithdrawalRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionHistory` ADD CONSTRAINT `TransactionHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionHistory` ADD CONSTRAINT `TransactionHistory_topUpTransactionId_fkey` FOREIGN KEY (`topUpTransactionId`) REFERENCES `TopUpTransaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionHistory` ADD CONSTRAINT `TransactionHistory_withdrawalRequestId_fkey` FOREIGN KEY (`withdrawalRequestId`) REFERENCES `WithdrawalRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionHistory` ADD CONSTRAINT `TransactionHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionHistory` ADD CONSTRAINT `TransactionHistory_refundRequestId_fkey` FOREIGN KEY (`refundRequestId`) REFERENCES `RefundRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
