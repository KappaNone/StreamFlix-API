import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TitleModule } from './title/title.module';
import { SeasonModule } from './season/season.module';
import { EpisodeModule } from './episode/episode.module';
import { QualityModule } from './quality/quality.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ProfileModule } from './profile/profile.module';
import { ProfilePreferenceModule } from './profile-preferences/profile-preference.module';
import { GenreModule } from './genre/genre.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    TitleModule,
    SeasonModule,
    EpisodeModule,
    QualityModule,
    SubscriptionModule,
    ProfileModule,
    ProfilePreferenceModule,
    GenreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
