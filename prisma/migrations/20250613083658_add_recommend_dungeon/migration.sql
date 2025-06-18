-- CreateTable
CREATE TABLE `recommend_dungeon` (
    `user_name` VARCHAR(191) NOT NULL,
    `character_name` VARCHAR(191) NOT NULL,
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

    PRIMARY KEY (`user_name`, `character_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `recommend_dungeon` ADD CONSTRAINT `recommend_dungeon_user_name_character_name_fkey` FOREIGN KEY (`user_name`, `character_name`) REFERENCES `UserCharacter`(`user_name`, `character_name`) ON DELETE CASCADE ON UPDATE CASCADE;
