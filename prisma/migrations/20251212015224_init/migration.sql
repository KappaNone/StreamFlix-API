-- CreateEnum
CREATE TYPE "TitleType" AS ENUM ('MOVIE', 'SERIES');

-- CreateEnum
CREATE TYPE "QualityName" AS ENUM ('SD', 'HD', 'UHD');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Title" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TitleType" NOT NULL,
    "description" TEXT NOT NULL,
    "releaseYear" INTEGER NOT NULL,

    CONSTRAINT "Title_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quality" (
    "titleId" INTEGER NOT NULL,
    "name" "QualityName" NOT NULL,

    CONSTRAINT "Quality_pkey" PRIMARY KEY ("titleId","name")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "titleId" INTEGER NOT NULL,
    "seasonNumber" INTEGER NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" SERIAL NOT NULL,
    "titleId" INTEGER NOT NULL,
    "seasonId" INTEGER,
    "episodeNumber" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "durationSeconds" INTEGER NOT NULL,
    "videoUrl" TEXT NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_seasonId_episodeNumber_key" ON "Episode"("seasonId", "episodeNumber");

-- AddForeignKey
ALTER TABLE "Quality" ADD CONSTRAINT "Quality_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
