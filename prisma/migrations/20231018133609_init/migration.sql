/*
  Warnings:

  - You are about to drop the column `storeId` on the `Mixing` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Recipe` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Mixing` DROP FOREIGN KEY `Mixing_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `Recipe` DROP FOREIGN KEY `Recipe_storeId_fkey`;

-- AlterTable
ALTER TABLE `Mixing` DROP COLUMN `storeId`;

-- AlterTable
ALTER TABLE `Recipe` DROP COLUMN `storeId`;

-- AlterTable
ALTER TABLE `Stock` ADD COLUMN `currentAmount` INTEGER NOT NULL DEFAULT 0;
