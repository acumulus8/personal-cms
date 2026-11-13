/*
  Warnings:

  - The values [IMG_1_3_TXT_2_3,TXT_2_3_IMG_1_3,LIST_ITEM,GRID_ITEM,GALLERY_ITEM] on the enum `Section_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ContentMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SectionContent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ContentMedia` DROP FOREIGN KEY `ContentMedia_contentId_fkey`;

-- DropForeignKey
ALTER TABLE `ContentMedia` DROP FOREIGN KEY `ContentMedia_mediaId_fkey`;

-- DropForeignKey
ALTER TABLE `SectionContent` DROP FOREIGN KEY `SectionContent_contentId_fkey`;

-- DropForeignKey
ALTER TABLE `SectionContent` DROP FOREIGN KEY `SectionContent_sectionId_fkey`;

-- AlterTable
ALTER TABLE `Section` MODIFY `type` ENUM('HERO', 'BACKGROUND_IMAGE', 'BACKGROUND_VIDEO', 'SPLIT_IMAGE_TEXT', 'LIST', 'GRID', 'GALLERY', 'BANNER', 'CONTACT', 'CTA', 'TESTIMONIAL', 'OTHER') NOT NULL;

-- DropTable
DROP TABLE `ContentMedia`;

-- DropTable
DROP TABLE `SectionContent`;

-- CreateTable
CREATE TABLE `SectionContentItem` (
    `sectionId` INTEGER NOT NULL,
    `contentId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`sectionId`, `contentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SectionContentItem` ADD CONSTRAINT `SectionContentItem_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionContentItem` ADD CONSTRAINT `SectionContentItem_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `Content`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
