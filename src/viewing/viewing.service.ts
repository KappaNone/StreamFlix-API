import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecordViewingDto } from './dto/record-viewing.dto';
import { AddToWatchlistDto } from './dto/add-to-watchlist.dto';

@Injectable()
export class ViewingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record viewing progress for a title or episode
   * Updates position, completion status, and last viewed timestamp
   */
  async recordViewing(userId: number, recordViewingDto: RecordViewingDto) {
    const { titleId, episodeId, positionSeconds, totalDurationSeconds, isCompleted, autoPlayNextEpisode } = recordViewingDto;

    // Validate title exists
    const title = await this.prisma.title.findUnique({
      where: { id: titleId },
    });
    if (!title) {
      throw new NotFoundException(`Title with id ${titleId} not found`);
    }

    // Validate episode exists if provided
    if (episodeId) {
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
      });
      if (!episode || episode.titleId !== titleId) {
        throw new NotFoundException(`Episode with id ${episodeId} not found for title ${titleId}`);
      }
    }

    // Create or update viewing progress
    const viewingProgress = await this.prisma.viewingProgress.upsert({
      where: {
        userId_titleId_episodeId: {
          userId,
          titleId,
          episodeId: episodeId || null,
        },
      },
      update: {
        positionSeconds,
        totalDurationSeconds,
        isCompleted,
        autoPlayNextEpisode: autoPlayNextEpisode ?? true,
        lastViewedAt: new Date(),
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId,
        titleId,
        episodeId,
        positionSeconds,
        totalDurationSeconds,
        isCompleted,
        autoPlayNextEpisode: autoPlayNextEpisode ?? true,
        lastViewedAt: new Date(),
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        title: true,
        episode: true,
      },
    });

    // If viewing is completed, remove from watchlist
    if (isCompleted) {
      await this.prisma.watchlist.updateMany({
        where: {
          userId,
          titleId,
        },
        data: {
          removedAt: new Date(),
        },
      });
    }

    return viewingProgress;
  }

  /**
   * Get viewing progress for a specific title
   */
  async getViewingProgress(userId: number, titleId: number) {
    const title = await this.prisma.title.findUnique({
      where: { id: titleId },
    });
    if (!title) {
      throw new NotFoundException(`Title with id ${titleId} not found`);
    }

    return this.prisma.viewingProgress.findMany({
      where: {
        userId,
        titleId,
      },
      include: {
        episode: true,
      },
    });
  }

  /**
   * Get all viewing progress for a user
   */
  async getUserViewingHistory(userId: number) {
    return this.prisma.viewingProgress.findMany({
      where: { userId },
      include: {
        title: true,
        episode: true,
      },
      orderBy: { lastViewedAt: 'desc' },
    });
  }

  /**
   * Add a title to user's watchlist
   */
  async addToWatchlist(userId: number, addToWatchlistDto: AddToWatchlistDto) {
    const { titleId } = addToWatchlistDto;

    // Validate title exists
    const title = await this.prisma.title.findUnique({
      where: { id: titleId },
    });
    if (!title) {
      throw new NotFoundException(`Title with id ${titleId} not found`);
    }

    // Check if already in watchlist (not removed)
    const existingWatchlist = await this.prisma.watchlist.findUnique({
      where: {
        userId_titleId: {
          userId,
          titleId,
        },
      },
    });

    if (existingWatchlist && !existingWatchlist.removedAt) {
      throw new BadRequestException('Title is already in your watchlist');
    }

    // Create new watchlist entry or restore removed one
    const watchlist = await this.prisma.watchlist.upsert({
      where: {
        userId_titleId: {
          userId,
          titleId,
        },
      },
      update: {
        removedAt: null,
      },
      create: {
        userId,
        titleId,
      },
      include: {
        title: true,
      },
    });

    return watchlist;
  }

  /**
   * Get user's watchlist (only active items, not removed)
   */
  async getWatchlist(userId: number) {
    return this.prisma.watchlist.findMany({
      where: {
        userId,
        removedAt: null,
      },
      include: {
        title: true,
      },
      orderBy: { addedAt: 'desc' },
    });
  }

  /**
   * Remove a title from user's watchlist
   */
  async removeFromWatchlist(userId: number, titleId: number) {
    const watchlist = await this.prisma.watchlist.findUnique({
      where: {
        userId_titleId: {
          userId,
          titleId,
        },
      },
    });

    if (!watchlist) {
      throw new NotFoundException(
        `Title with id ${titleId} not found in watchlist for user ${userId}`,
      );
    }

    if (watchlist.removedAt) {
      throw new BadRequestException('Title is already removed from watchlist');
    }

    return this.prisma.watchlist.update({
      where: {
        id: watchlist.id,
      },
      data: {
        removedAt: new Date(),
      },
      include: {
        title: true,
      },
    });
  }

  /**
   * Continue watching - get titles the user was watching with unfinished progress
   */
  async getContinueWatching(userId: number, limit: number = 10) {
    return this.prisma.viewingProgress.findMany({
      where: {
        userId,
        isCompleted: false,
      },
      include: {
        title: true,
        episode: true,
      },
      orderBy: { lastViewedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get recently completed titles for a user
   */
  async getRecentlyCompleted(userId: number, limit: number = 10) {
    return this.prisma.viewingProgress.findMany({
      where: {
        userId,
        isCompleted: true,
      },
      include: {
        title: true,
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Clear viewing progress for a title
   */
  async clearViewingProgress(userId: number, titleId: number) {
    const title = await this.prisma.title.findUnique({
      where: { id: titleId },
    });
    if (!title) {
      throw new NotFoundException(`Title with id ${titleId} not found`);
    }

    return this.prisma.viewingProgress.deleteMany({
      where: {
        userId,
        titleId,
      },
    });
  }
}
