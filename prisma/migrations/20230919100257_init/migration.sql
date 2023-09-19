-- AlterTable
ALTER TABLE `Menu` MODIFY `price` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Mileage` MODIFY `mileage` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Option` MODIFY `optionPrice` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Order` MODIFY `totalPrice` VARCHAR(191) NOT NULL,
    MODIFY `useMileage` VARCHAR(191) NULL,
    MODIFY `saveMileage` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Payment` MODIFY `price` VARCHAR(191) NOT NULL;
