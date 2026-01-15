-- CreateTable
CREATE TABLE "ViewingProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "titleId" INTEGER NOT NULL,
    "episodeId" INTEGER,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "totalDurationSeconds" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "autoPlayNextEpisode" BOOLEAN NOT NULL DEFAULT true,
    "lastViewedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "titleId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ViewingProgress_userId_titleId_episodeId_key" ON "ViewingProgress"("userId", "titleId", "episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_titleId_key" ON "Watchlist"("userId", "titleId");

-- AddForeignKey
ALTER TABLE "ViewingProgress" ADD CONSTRAINT "ViewingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewingProgress" ADD CONSTRAINT "ViewingProgress_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewingProgress" ADD CONSTRAINT "ViewingProgress_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE;
