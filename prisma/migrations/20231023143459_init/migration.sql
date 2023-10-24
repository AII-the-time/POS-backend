/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `deletedAt`;
