/*
  Warnings:

  - You are about to drop the column `profilePreferenceId` on the `Genre` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Genre" DROP CONSTRAINT "Genre_profilePreferenceId_fkey";

-- AlterTable
ALTER TABLE "Genre" DROP COLUMN "profilePreferenceId";

-- CreateTable
CREATE TABLE "GenreProfilePreference" (
    "id" SERIAL NOT NULL,
    "genreId" INTEGER NOT NULL,
    "profilePreferenceId" INTEGER NOT NULL,

    CONSTRAINT "GenreProfilePreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GenreProfilePreference_genreId_profilePreferenceId_key" ON "GenreProfilePreference"("genreId", "profilePreferenceId");

-- AddForeignKey
ALTER TABLE "GenreProfilePreference" ADD CONSTRAINT "GenreProfilePreference_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreProfilePreference" ADD CONSTRAINT "GenreProfilePreference_profilePreferenceId_fkey" FOREIGN KEY ("profilePreferenceId") REFERENCES "ProfilePreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
