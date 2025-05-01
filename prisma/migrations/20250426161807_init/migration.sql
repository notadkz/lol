-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `balance` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `soloRank` ENUM('SAT', 'DONG', 'BAC', 'VANG', 'BACH_KIM', 'KIM_CUONG', 'CAO_THU', 'DAI_CAO_THU', 'THACH_DAU') NOT NULL,
    `flexRank` ENUM('SAT', 'DONG', 'BAC', 'VANG', 'BACH_KIM', 'KIM_CUONG', 'CAO_THU', 'DAI_CAO_THU', 'THACH_DAU') NOT NULL,
    `tftRank` ENUM('SAT', 'DONG', 'BAC', 'VANG', 'BACH_KIM', 'KIM_CUONG', 'CAO_THU', 'DAI_CAO_THU', 'THACH_DAU') NOT NULL,
    `level` INTEGER NOT NULL,
    `blueEssence` INTEGER NOT NULL,
    `riotPoints` INTEGER NOT NULL,
    `verifiedEmail` BOOLEAN NOT NULL DEFAULT false,
    `championCount` INTEGER NOT NULL,
    `skinCount` INTEGER NOT NULL,
    `chromaCount` INTEGER NOT NULL,
    `wardCount` INTEGER NOT NULL,
    `emoteCount` INTEGER NOT NULL,
    `iconCount` INTEGER NOT NULL,
    `littleLegendCount` INTEGER NOT NULL,
    `boomCount` INTEGER NOT NULL,
    `arenaCount` INTEGER NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('AVAILABLE', 'SOLD', 'HIDDEN') NOT NULL DEFAULT 'AVAILABLE',
    `buyerId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `orderId` INTEGER NULL,

    UNIQUE INDEX `Account_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopUpTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `bank` VARCHAR(191) NOT NULL,
    `transactionCode` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Champion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Champion_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `championId` INTEGER NOT NULL,

    UNIQUE INDEX `Skin_name_championId_key`(`name`, `championId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chroma` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `skinId` INTEGER NOT NULL,

    UNIQUE INDEX `Chroma_name_skinId_key`(`name`, `skinId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Ward_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Emote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Emote_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Icon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Icon_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LittleLegend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `LittleLegend_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Boom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Boom_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Arena` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Arena_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountChampion` (
    `accountId` INTEGER NOT NULL,
    `championId` INTEGER NOT NULL,

    PRIMARY KEY (`accountId`, `championId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountSkin` (
    `accountId` INTEGER NOT NULL,
    `skinId` INTEGER NOT NULL,

    PRIMARY KEY (`accountId`, `skinId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountChroma` (
    `accountId` INTEGER NOT NULL,
    `chromaId` INTEGER NOT NULL,

    PRIMARY KEY (`accountId`, `chromaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountWard` (
    `accountId` INTEGER NOT NULL,
    `wardId` INTEGER NOT NULL,

    PRIMARY KEY (`accountId`, `wardId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountEmote` (
    `accountId` INTEGER NOT NULL,
    `emoteId` INTEGER NOT NULL,

    PRIMARY KEY (`accountId`, `emoteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountIcon` (
    `accountId` INTEGER NOT NULL,
    `iconId` INTEGER NOT NULL,

    PRIMARY KEY (`accountId`, `iconId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountLittleLegend` (
    `accountId` INTEGER NOT NULL,
    `littleLegendId` INTEGER NOT NULL,

    PRIMARY KEY (`accountId`, `littleLegendId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountBoom` (
    `accountId` INTEGER NOT NULL,
    `boomId` INTEGER NOT NULL,

    PRIMARY KEY (`accountId`, `boomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountArena` (
    `accountId` INTEGER NOT NULL,
    `arenaId` INTEGER NOT NULL,

    PRIMARY KEY (`accountId`, `arenaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopUpTransaction` ADD CONSTRAINT `TopUpTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skin` ADD CONSTRAINT `Skin_championId_fkey` FOREIGN KEY (`championId`) REFERENCES `Champion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chroma` ADD CONSTRAINT `Chroma_skinId_fkey` FOREIGN KEY (`skinId`) REFERENCES `Skin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountChampion` ADD CONSTRAINT `AccountChampion_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountChampion` ADD CONSTRAINT `AccountChampion_championId_fkey` FOREIGN KEY (`championId`) REFERENCES `Champion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountSkin` ADD CONSTRAINT `AccountSkin_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountSkin` ADD CONSTRAINT `AccountSkin_skinId_fkey` FOREIGN KEY (`skinId`) REFERENCES `Skin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountChroma` ADD CONSTRAINT `AccountChroma_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountChroma` ADD CONSTRAINT `AccountChroma_chromaId_fkey` FOREIGN KEY (`chromaId`) REFERENCES `Chroma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountWard` ADD CONSTRAINT `AccountWard_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountWard` ADD CONSTRAINT `AccountWard_wardId_fkey` FOREIGN KEY (`wardId`) REFERENCES `Ward`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountEmote` ADD CONSTRAINT `AccountEmote_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountEmote` ADD CONSTRAINT `AccountEmote_emoteId_fkey` FOREIGN KEY (`emoteId`) REFERENCES `Emote`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountIcon` ADD CONSTRAINT `AccountIcon_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountIcon` ADD CONSTRAINT `AccountIcon_iconId_fkey` FOREIGN KEY (`iconId`) REFERENCES `Icon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountLittleLegend` ADD CONSTRAINT `AccountLittleLegend_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountLittleLegend` ADD CONSTRAINT `AccountLittleLegend_littleLegendId_fkey` FOREIGN KEY (`littleLegendId`) REFERENCES `LittleLegend`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountBoom` ADD CONSTRAINT `AccountBoom_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountBoom` ADD CONSTRAINT `AccountBoom_boomId_fkey` FOREIGN KEY (`boomId`) REFERENCES `Boom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountArena` ADD CONSTRAINT `AccountArena_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountArena` ADD CONSTRAINT `AccountArena_arenaId_fkey` FOREIGN KEY (`arenaId`) REFERENCES `Arena`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
