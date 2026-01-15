import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ViewingService } from './viewing.service';
import { RecordViewingDto, AddToWatchlistDto } from './dto';
import { ViewingProgressEntity, WatchlistEntity } from './entities';
import { ApiOkResponse, ApiCreatedResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('viewing')
@ApiTags('viewing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ViewingController {
  constructor(private readonly viewingService: ViewingService) {}

  /**
   * Record viewing progress for a title or episode
   */
  @Post('progress')
  @ApiCreatedResponse({ type: ViewingProgressEntity })
  recordViewing(
    @Request() req,
    @Body() recordViewingDto: RecordViewingDto,
  ) {
    return this.viewingService.recordViewing(req.user.id, recordViewingDto);
  }

  /**
   * Get viewing progress for a specific title
   */
  @Get('progress/title/:titleId')
  @ApiOkResponse({ type: ViewingProgressEntity, isArray: true })
  getViewingProgress(
    @Request() req,
    @Param('titleId', ParseIntPipe) titleId: number,
  ) {
    return this.viewingService.getViewingProgress(req.user.id, titleId);
  }

  /**
   * Get all viewing history for current user
   */
  @Get('history')
  @ApiOkResponse({ type: ViewingProgressEntity, isArray: true })
  getUserViewingHistory(@Request() req) {
    return this.viewingService.getUserViewingHistory(req.user.id);
  }

  /**
   * Add a title to watchlist
   */
  @Post('watchlist')
  @ApiCreatedResponse({ type: WatchlistEntity })
  addToWatchlist(
    @Request() req,
    @Body() addToWatchlistDto: AddToWatchlistDto,
  ) {
    return this.viewingService.addToWatchlist(req.user.id, addToWatchlistDto);
  }

  /**
   * Get user's watchlist
   */
  @Get('watchlist')
  @ApiOkResponse({ type: WatchlistEntity, isArray: true })
  getWatchlist(@Request() req) {
    return this.viewingService.getWatchlist(req.user.id);
  }

  /**
   * Remove a title from watchlist
   */
  @Delete('watchlist/:titleId')
  @ApiOkResponse({ type: WatchlistEntity })
  removeFromWatchlist(
    @Request() req,
    @Param('titleId', ParseIntPipe) titleId: number,
  ) {
    return this.viewingService.removeFromWatchlist(req.user.id, titleId);
  }

  /**
   * Get continue watching - titles with unfinished progress
   */
  @Get('continue-watching')
  @ApiOkResponse({ type: ViewingProgressEntity, isArray: true })
  getContinueWatching(
    @Request() req,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.viewingService.getContinueWatching(req.user.id, limit);
  }

  /**
   * Get recently completed titles
   */
  @Get('recently-completed')
  @ApiOkResponse({ type: ViewingProgressEntity, isArray: true })
  getRecentlyCompleted(
    @Request() req,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.viewingService.getRecentlyCompleted(req.user.id, limit);
  }

  /**
   * Clear viewing progress for a title
   */
  @Delete('progress/title/:titleId')
  @ApiOkResponse()
  clearViewingProgress(
    @Request() req,
    @Param('titleId', ParseIntPipe) titleId: number,
  ) {
    return this.viewingService.clearViewingProgress(req.user.id, titleId);
  }
}
