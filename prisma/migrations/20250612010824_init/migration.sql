-- CreateTable
CREATE TABLE `UserCharacter` (
    `user_name` VARCHAR(191) NOT NULL,
    `character_name` VARCHAR(191) NOT NULL,
    `job` VARCHAR(191) NULL,
    `fame` INTEGER NULL,
    `set_point` INTEGER NULL,
    `damage` INTEGER NULL,
    `buff_power` INTEGER NULL,
    `switching` VARCHAR(191) NULL,
    `detail_link` VARCHAR(191) NULL,

    INDEX `UserCharacter_user_name_idx`(`user_name`),
    INDEX `UserCharacter_character_name_idx`(`character_name`),
    PRIMARY KEY (`user_name`, `character_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdventureTeam` (
    `adventure_name` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `character_name` VARCHAR(191) NOT NULL,
    `server_name` VARCHAR(191) NULL,

    INDEX `AdventureTeam_user_name_character_name_idx`(`user_name`, `character_name`),
    PRIMARY KEY (`adventure_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterItems` (
    `user_name` VARCHAR(191) NOT NULL,
    `character_name` VARCHAR(191) NOT NULL,
    `taecho` INTEGER NULL,
    `epic` INTEGER NULL,
    `legendary` INTEGER NULL,
    `abyss_worshipper` INTEGER NULL,
    `jar_epic` INTEGER NULL,
    `jar_legend` INTEGER NULL,
    `detail_link` VARCHAR(191) NULL,

    INDEX `CharacterItems_user_name_character_name_idx`(`user_name`, `character_name`),
    PRIMARY KEY (`user_name`, `character_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdventureTeam` ADD CONSTRAINT `AdventureTeam_user_name_character_name_fkey` FOREIGN KEY (`user_name`, `character_name`) REFERENCES `UserCharacter`(`user_name`, `character_name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterItems` ADD CONSTRAINT `CharacterItems_user_name_character_name_fkey` FOREIGN KEY (`user_name`, `character_name`) REFERENCES `UserCharacter`(`user_name`, `character_name`) ON DELETE CASCADE ON UPDATE CASCADE;
