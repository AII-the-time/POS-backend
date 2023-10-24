-- AlterTable
ALTER TABLE `MixedStock` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Stock` ADD COLUMN `deletedAt` DATETIME(3) NULL;
