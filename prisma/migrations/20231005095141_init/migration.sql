/*
  Warnings:

  - A unique constraint covering the columns `[preOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Order_preOrderId_key` ON `Order`(`preOrderId`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_preOrderId_fkey` FOREIGN KEY (`preOrderId`) REFERENCES `PreOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
