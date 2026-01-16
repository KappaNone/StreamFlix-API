import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { TitleModule } from './title/title.module';
import { SeasonModule } from './season/season.module';
import { EpisodeModule } from './episode/episode.module';
import { QualityModule } from './quality/quality.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ViewingModule } from './viewing/viewing.module';
import { ProfilePreferenceModule } from './profile-preference/profile-preference.module';
import { GenreModule } from './genre/genre.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    TitleModule,
    SeasonModule,
    EpisodeModule,
    QualityModule,
    SubscriptionModule,
    ViewingModule,
    ProfilePreferenceModule,
    GenreModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
