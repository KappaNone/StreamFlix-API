import { PrismaClient, TitleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (delete in correct order due to FK constraints)
  await prisma.episode.deleteMany({});
  await prisma.season.deleteMany({});
  await prisma.title.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing data');

  // Create Users
  await prisma.user.createMany({
    data: [
      { name: 'Alice', email: 'alice@example.com', password: 'password1' },
      { name: 'Bob', email: 'bob@example.com', password: 'password2' },
    ],
  });

  console.log('Users created');

  // Create Movie
  const movie1 = await prisma.title.create({
    data: {
      name: 'The Great Movie',
      type: TitleType.MOVIE,
      description: 'An epic standalone film.',
      releaseYear: 2020,
    },
  });

  console.log('Movie created:', movie1.id);

  // Create Series
  const series1 = await prisma.title.create({
    data: {
      name: 'Amazing Series',
      type: TitleType.SERIES,
      description: 'A serialized drama with multiple episodes.',
      releaseYear: 2021,
    },
  });

  console.log('Series created:', series1.id);

  // Create Seasons for Series
  const season1 = await prisma.season.create({
    data: {
      titleId: series1.id,
      seasonNumber: 1,
    },
  });

  const season2 = await prisma.season.create({
    data: {
      titleId: series1.id,
      seasonNumber: 2,
    },
  });

  console.log('Seasons created');

  // Create Episodes for Movie (no season)
  await prisma.episode.create({
    data: {
      titleId: movie1.id,
      episodeNumber: 1,
      name: 'The Great Movie',
      description: 'Full movie.',
      durationSeconds: 7200,
      videoUrl: 'https://cdn.example.com/the-great-movie.mp4',
      seasonId: null,
    },
  });

  console.log('Movie episode created');

  // Create Episodes for Series Season 1
  await prisma.episode.create({
    data: {
      titleId: series1.id,
      seasonId: season1.id,
      episodeNumber: 1,
      name: 'Episode 1 - Pilot',
      description: 'Pilot episode.',
      durationSeconds: 2700,
      videoUrl: 'https://cdn.example.com/amazing-series/s01e01.mp4',
    },
  });

  await prisma.episode.create({
    data: {
      titleId: series1.id,
      seasonId: season1.id,
      episodeNumber: 2,
      name: 'Episode 2 - The Next Step',
      description: 'Second episode.',
      durationSeconds: 2800,
      videoUrl: 'https://cdn.example.com/amazing-series/s01e02.mp4',
    },
  });

  console.log('Season 1 episodes created');

  // Create Episodes for Series Season 2
  await prisma.episode.create({
    data: {
      titleId: series1.id,
      seasonId: season2.id,
      episodeNumber: 1,
      name: 'Episode 1 - New Beginnings',
      description: 'First episode of Season 2.',
      durationSeconds: 2900,
      videoUrl: 'https://cdn.example.com/amazing-series/s02e01.mp4',
    },
  });

  await prisma.episode.create({
    data: {
      titleId: series1.id,
      seasonId: season2.id,
      episodeNumber: 2,
      name: 'Episode 2 - The Journey Continues',
      description: 'Second episode of Season 2.',
      durationSeconds: 3000,
      videoUrl: 'https://cdn.example.com/amazing-series/s02e02.mp4',
    },
  });

  console.log('Season 2 episodes created');
  console.log('Seeding finished successfully');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });