-- AlterTable
ALTER TABLE `Recipe` ADD COLUMN `coldRegularAmount` INTEGER NULL,
    ADD COLUMN `coldSizeUpAmount` INTEGER NULL,
    ADD COLUMN `hotRegularAmount` INTEGER NULL,
    ADD COLUMN `hotSizeUpAmount` INTEGER NULL;
