/*
  Warnings:

  - The primary key for the `adventureteam` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `character_name` on the `adventureteam` table. All the data in the column will be lost.
  - You are about to drop the column `server_name` on the `adventureteam` table. All the data in the column will be lost.
  - Added the required column `adventure_name` to the `UserCharacter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `adventureteam` DROP FOREIGN KEY `AdventureTeam_user_name_character_name_fkey`;

-- DropIndex
DROP INDEX `AdventureTeam_user_name_character_name_idx` ON `adventureteam`;

-- AlterTable
ALTER TABLE `adventureteam` DROP PRIMARY KEY,
    DROP COLUMN `character_name`,
    DROP COLUMN `server_name`,
    ADD PRIMARY KEY (`adventure_name`, `user_name`);

-- AlterTable
ALTER TABLE `characteritems` MODIFY `taecho` INTEGER NULL DEFAULT 0,
    MODIFY `epic` INTEGER NULL DEFAULT 0,
    MODIFY `legendary` INTEGER NULL DEFAULT 0,
    MODIFY `abyss_worshipper` INTEGER NULL DEFAULT 0,
    MODIFY `jar_epic` INTEGER NULL DEFAULT 0,
    MODIFY `jar_legend` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `usercharacter` ADD COLUMN `adventure_name` VARCHAR(191) NOT NULL,
    MODIFY `damage` BIGINT NULL,
    MODIFY `buff_power` BIGINT NULL;

-- CreateTable
CREATE TABLE `Homework` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `character_name` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `nabel_normal` BOOLEAN NOT NULL DEFAULT false,
    `nabel_match` BOOLEAN NOT NULL DEFAULT false,
    `mist` BOOLEAN NOT NULL DEFAULT false,
    `advent` BOOLEAN NOT NULL DEFAULT false,
    `stage2` BOOLEAN NOT NULL DEFAULT false,
    `stage1` BOOLEAN NOT NULL DEFAULT false,
    `goddess` BOOLEAN NOT NULL DEFAULT false,
    `azure` BOOLEAN NOT NULL DEFAULT false,
    `nightmare` BOOLEAN NOT NULL DEFAULT false,
    `moonlake` BOOLEAN NOT NULL DEFAULT false,
    `solidaris` BOOLEAN NOT NULL DEFAULT false,
    `whitevalley` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Homework_user_name_character_name_key`(`user_name`, `character_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserCharacter` ADD CONSTRAINT `UserCharacter_adventure_name_user_name_fkey` FOREIGN KEY (`adventure_name`, `user_name`) REFERENCES `AdventureTeam`(`adventure_name`, `user_name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Homework` ADD CONSTRAINT `Homework_user_name_character_name_fkey` FOREIGN KEY (`user_name`, `character_name`) REFERENCES `UserCharacter`(`user_name`, `character_name`) ON DELETE CASCADE ON UPDATE CASCADE;
