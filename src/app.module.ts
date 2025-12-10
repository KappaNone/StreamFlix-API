import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TitleModule } from './title/title.module';
import { SeasonModule } from './season/season.module';
import { EpisodeModule } from './episode/episode.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, TitleModule, SeasonModule, EpisodeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
