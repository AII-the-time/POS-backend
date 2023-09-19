/*
  Warnings:

  - You are about to alter the column `price` on the `Menu` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.
  - You are about to alter the column `mileage` on the `Mileage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.
  - You are about to alter the column `optionPrice` on the `Option` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.
  - You are about to alter the column `totalPrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.
  - You are about to alter the column `useMileage` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.
  - You are about to alter the column `saveMileage` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE `Menu` MODIFY `price` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `Mileage` MODIFY `mileage` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `Option` MODIFY `optionPrice` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `Order` MODIFY `totalPrice` DECIMAL(65, 30) NOT NULL,
    MODIFY `useMileage` DECIMAL(65, 30) NULL,
    MODIFY `saveMileage` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `Payment` MODIFY `price` DECIMAL(65, 30) NOT NULL;
