/*
  Warnings:

  - You are about to drop the column `count` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `sort` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `standard` on the `Stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Recipe` DROP FOREIGN KEY `Recipe_stockId_fkey`;

-- AlterTable
ALTER TABLE `Recipe` ADD COLUMN `mixedStockId` INTEGER NULL,
    MODIFY `stockId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Stock` DROP COLUMN `count`,
    DROP COLUMN `sort`,
    DROP COLUMN `standard`,
    ADD COLUMN `amount` INTEGER NULL,
    ADD COLUMN `unit` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `MixedStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `totalAmount` INTEGER NULL,
    `unit` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mixing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `mixedStockId` INTEGER NOT NULL,
    `stockId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Recipe` ADD CONSTRAINT `Recipe_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recipe` ADD CONSTRAINT `Recipe_mixedStockId_fkey` FOREIGN KEY (`mixedStockId`) REFERENCES `MixedStock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MixedStock` ADD CONSTRAINT `MixedStock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mixing` ADD CONSTRAINT `Mixing_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mixing` ADD CONSTRAINT `Mixing_mixedStockId_fkey` FOREIGN KEY (`mixedStockId`) REFERENCES `MixedStock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mixing` ADD CONSTRAINT `Mixing_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
