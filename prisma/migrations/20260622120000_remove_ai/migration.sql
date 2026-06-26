-- DropForeignKey
ALTER TABLE `AiMessage` DROP FOREIGN KEY `AiMessage_conversationId_fkey`;

-- DropForeignKey
ALTER TABLE `AiConversation` DROP FOREIGN KEY `AiConversation_userId_fkey`;

-- DropTable
DROP TABLE `AiMessage`;

-- DropTable
DROP TABLE `AiConversation`;

-- DropTable (may exist from db:push without migration)
DROP TABLE IF EXISTS `AiConfig`;
