import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [GenreController],
  providers: [GenreService, PrismaService],
  imports: [PrismaModule, UsersModule],
  exports: [GenreModule],
})
export class GenreModule {}