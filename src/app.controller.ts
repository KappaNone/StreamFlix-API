import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Query,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User as UserModel, Post as PostModel, Prisma } from '@prisma/client';

import { SignupDto } from './dto/signup.dto';
import { ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) { }

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.prismaService.post.findUnique({ where: { id: Number(id) } });
  }

  @Get('/')
  async getHello(): Promise<string> {
    return 'Hello World!';
  }

  @Get('feed')
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'searchString', required: false, type: String })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['asc', 'desc'] })
  async getFilteredPosts(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('searchString') searchString?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
  ): Promise<PostModel[]> {
    const or = searchString
      ? {
        OR: [
          { title: { contains: searchString } },
          { content: { contains: searchString } },
        ],
      }
      : {};

    return this.prismaService.extendedPrismaClient().post.findMany({
      where: {
        published: true,
        ...or,
      },
      include: { author: true },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    });
  }

  @Get('users')
  async getAllUsers(): Promise<UserModel[]> {
    return this.prismaService.extendedPrismaClient().user.findMany();
  }

  @Get('user/:id/drafts')
  async getDraftsByUser(@Param('id') id: string): Promise<PostModel[]> {
    return this.prismaService.extendedPrismaClient().post.findMany({
      where: { authorId: Number(id), published: false },
    });
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string; authorEmail: string },
  ): Promise<PostModel> {
    const { title, content, authorEmail } = postData;
    return this.prismaService.extendedPrismaClient().post.create({
      data: {
        title,
        content,
        author: {
          connect: { email: authorEmail },
        },
      },
    });
  }

  @Post('signup')
  @ApiBody({ type: SignupDto })
  async signupUser(
    @Body()
    userData: SignupDto,
  ): Promise<UserModel> {
    const existingUser = await this.prismaService
      .extendedPrismaClient()
      .user.findUnique({
        where: { email: userData.email },
      });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const postData = userData.posts?.map((post) => {
      return { title: post?.title, content: post?.content };
    });
    return this.prismaService.extendedPrismaClient().user.create({
      data: {
        name: userData?.name,
        email: userData.email,
        posts: {
          create: postData,
        },
      },
    });
  }

  @Put('publish/:id')
  async togglePublishPost(@Param('id') id: string): Promise<PostModel> {
    if (isNaN(Number(id)))
    {
      throw new ConflictException('Invalid post ID');
    }
    const postData = await this.prismaService
      .extendedPrismaClient()
      .post.findUnique({
        where: { id: Number(id) },
        select: {
          published: true,
        },
      });
    
    if (!postData) {
      throw new NotFoundException('Post not found');
    }

    return this.prismaService.extendedPrismaClient().post.update({
      where: { id: Number(id) || undefined },
      data: { published: !postData?.published },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.prismaService
      .extendedPrismaClient()
      .post.delete({ where: { id: Number(id) } });
  }

  @Put('/post/:id/views')
  async incrementPostViewCount(@Param('id') id: string): Promise<PostModel> {
    return this.prismaService.extendedPrismaClient().post.update({
      where: { id: Number(id) },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }
}
