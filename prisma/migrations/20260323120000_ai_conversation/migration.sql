-- CreateTable
CREATE TABLE `AiConversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL DEFAULT '新话题',
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversationId` INTEGER NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AiConversation_userId_idx` ON `AiConversation`(`userId`);

-- CreateIndex
CREATE INDEX `AiConversation_userId_updatedAt_idx` ON `AiConversation`(`userId`, `updatedAt`);

-- CreateIndex
CREATE INDEX `AiMessage_conversationId_idx` ON `AiMessage`(`conversationId`);

-- CreateIndex
CREATE INDEX `AiMessage_conversationId_createdAt_idx` ON `AiMessage`(`conversationId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `AiConversation` ADD CONSTRAINT `AiConversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiMessage` ADD CONSTRAINT `AiMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `AiConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
