-- AlterTable
ALTER TABLE `User` ADD COLUMN `bookmarkToken` VARCHAR(64) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_bookmarkToken_key` ON `User`(`bookmarkToken`);
