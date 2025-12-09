import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TitlesModule } from './titles/titles.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, TitlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
