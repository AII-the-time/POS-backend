/*
  Warnings:

  - Made the column `reservationDateTime` on table `PreOrder` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `PreOrder` MODIFY `reservationDateTime` DATETIME(3) NOT NULL;
