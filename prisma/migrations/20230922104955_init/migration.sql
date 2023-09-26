/*
  Warnings:

  - You are about to alter the column `price` on the `Menu` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `mileage` on the `Mileage` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `optionPrice` on the `Option` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `totalPrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `useMileage` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `saveMileage` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.

*/
-- DropForeignKey
ALTER TABLE `OptionOrderItem` DROP FOREIGN KEY `OptionOrderItem_orderItemId_fkey`;

-- AlterTable
ALTER TABLE `Menu` MODIFY `price` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `Mileage` MODIFY `mileage` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `Option` MODIFY `optionPrice` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `OptionOrderItem` ADD COLUMN `preOrderItemId` INTEGER NULL,
    MODIFY `orderItemId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `preOrderId` INTEGER NULL,
    MODIFY `totalPrice` DECIMAL(65, 30) NOT NULL,
    MODIFY `useMileage` DECIMAL(65, 30) NULL,
    MODIFY `saveMileage` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `Payment` MODIFY `price` DECIMAL(65, 30) NOT NULL;

-- CreateTable
CREATE TABLE `PreOrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `count` INTEGER NOT NULL,
    `detail` VARCHAR(191) NULL,
    `menuId` INTEGER NOT NULL,
    `preOrderId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `totalPrice` DECIMAL(65, 30) NOT NULL,
    `reservationDateTime` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `cancelledAt` DATETIME(3) NULL,
    `storeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OptionOrderItem` ADD CONSTRAINT `OptionOrderItem_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OptionOrderItem` ADD CONSTRAINT `OptionOrderItem_preOrderItemId_fkey` FOREIGN KEY (`preOrderItemId`) REFERENCES `PreOrderItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreOrderItem` ADD CONSTRAINT `PreOrderItem_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreOrderItem` ADD CONSTRAINT `PreOrderItem_preOrderId_fkey` FOREIGN KEY (`preOrderId`) REFERENCES `PreOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreOrder` ADD CONSTRAINT `PreOrder_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
