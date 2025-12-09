/*
  Warnings:

  - The values [FILM] on the enum `TitleType` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Episode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Episode` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TitleType_new" AS ENUM ('MOVIE', 'SERIES');
ALTER TABLE "Title" ALTER COLUMN "type" TYPE "TitleType_new" USING ("type"::text::"TitleType_new");
ALTER TYPE "TitleType" RENAME TO "TitleType_old";
ALTER TYPE "TitleType_new" RENAME TO "TitleType";
DROP TYPE "TitleType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_pkey",
DROP COLUMN "id",
ALTER COLUMN "name" DROP NOT NULL,
ADD CONSTRAINT "Episode_pkey" PRIMARY KEY ("titleId", "episodeNumber");
