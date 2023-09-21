/*
  Warnings:

  - You are about to alter the column `createdAt` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `Menu` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `Menu` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `Mileage` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `Mileage` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `Option` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `orderId` on the `PreOrder` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `PreOrder` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `PreOrder` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `Store` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `Store` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- DropForeignKey
ALTER TABLE `PreOrder` DROP FOREIGN KEY `PreOrder_orderId_fkey`;

-- AlterTable
ALTER TABLE `Category` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `Menu` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `Mileage` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `Option` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW();

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `preOrderId` INTEGER NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `Payment` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW();

-- AlterTable
ALTER TABLE `PreOrder` DROP COLUMN `orderId`,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `Store` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_preOrderId_fkey` FOREIGN KEY (`preOrderId`) REFERENCES `PreOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
