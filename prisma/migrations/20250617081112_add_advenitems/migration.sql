-- CreateTable
CREATE TABLE `AdvenItems` (
    `adventure_name` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `taecho` INTEGER NOT NULL DEFAULT 0,
    `taecho_ratio` VARCHAR(191) NOT NULL DEFAULT '0%',
    `epic` INTEGER NOT NULL DEFAULT 0,
    `legendary` INTEGER NOT NULL DEFAULT 0,
    `jar_epic` INTEGER NOT NULL DEFAULT 0,
    `jar_legend` INTEGER NOT NULL DEFAULT 0,
    `top_character` VARCHAR(191) NULL,
    `abyss_worshipper` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `AdvenItems_adventure_name_user_name_key`(`adventure_name`, `user_name`),
    PRIMARY KEY (`adventure_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdvenItems` ADD CONSTRAINT `AdvenItems_adventure_name_user_name_fkey` FOREIGN KEY (`adventure_name`, `user_name`) REFERENCES `AdventureTeam`(`adventure_name`, `user_name`) ON DELETE CASCADE ON UPDATE CASCADE;
