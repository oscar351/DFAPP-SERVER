/*
  Warnings:

  - Added the required column `server` to the `AdventureTeam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `adventureteam` ADD COLUMN `server` VARCHAR(191) NOT NULL;
