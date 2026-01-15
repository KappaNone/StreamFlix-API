import {
  PrismaClient,
  TitleType,
  QualityName,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const HAS_TMDB_KEY = Boolean(TMDB_API_KEY);

const SUBSCRIPTION_PLANS = [
  {
    code: 'basic_sd',
    name: 'Basic SD',
    priceCents: 799,
    currency: 'EUR',
    maxQuality: QualityName.SD,
    concurrentStreams: 1,
    trialDays: 7,
  },
  {
    code: 'standard_hd',
    name: 'Standard HD',
    priceCents: 1199,
    currency: 'EUR',
    maxQuality: QualityName.HD,
    concurrentStreams: 2,
    trialDays: 7,
  },
  {
    code: 'premium_uhd',
    name: 'Premium UHD',
    priceCents: 1599,
    currency: 'EUR',
    maxQuality: QualityName.UHD,
    concurrentStreams: 4,
    trialDays: 7,
  },
];

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
}

interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  number_of_seasons: number;
}

interface TMDBSeason {
  season_number: number;
  episode_count: number;
  episodes?: TMDBEpisode[];
}

interface TMDBEpisode {
  episode_number: number;
  name: string;
  overview: string;
  runtime: number;
}

async function fetchFromTMDB(endpoint: string) {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  return response.json();
}

async function getPopularMovies(count: number = 20): Promise<TMDBMovie[]> {
  const data = await fetchFromTMDB('/movie/popular');
  return data.results.slice(0, count);
}

async function getPopularTVShows(count: number = 10): Promise<TMDBTVShow[]> {
  const data = await fetchFromTMDB('/tv/popular');
  return data.results.slice(0, count);
}

async function getTVShowDetails(tvId: number): Promise<TMDBTVShow> {
  return await fetchFromTMDB(`/tv/${tvId}`);
}

async function getSeasonDetails(tvId: number, seasonNumber: number): Promise<TMDBSeason> {
  return await fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

function getRandomQualities(): QualityName[] {
  const numQualities = Math.floor(Math.random() * 3) + 1; // 1-2 qualities
  const shuffled = Object.values(QualityName).sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numQualities);
}

function addDays(base: Date, days: number) {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

async function seedSubscriptionPlans() {
  for (const plan of SUBSCRIPTION_PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }

  console.log(`Seeded ${SUBSCRIPTION_PLANS.length} subscription plans.`);
}

async function seedDemoInvitations(inviterEmail: string) {
  const inviter = await prisma.user.findUnique({ where: { email: inviterEmail } });
  if (!inviter) return;

  await prisma.invitation.create({
    data: {
      code: 'FRIENDPASS',
      inviterId: inviter.id,
      inviteeEmail: 'friend@example.com',
      expiresAt: addDays(new Date(), 30),
    },
  });

  console.log('Demo invitation created for friend@example.com');
}

async function seedFallbackContent() {
  console.warn('Seeding fallback demo content (TMDB API key missing or invalid).');

  const demoTitles = [
    {
      name: 'StreamFlix Originals: The Rise',
      type: TitleType.MOVIE,
      description: 'A thriller about a startup that takes over the streaming world.',
      releaseYear: 2024,
      durationSeconds: 7200,
  qualities: [QualityName.HD, QualityName.UHD],
    },
    {
      name: 'StreamFlix Originals: The Series',
      type: TitleType.SERIES,
      description: 'A mini-series following a team of developers shipping a hit platform.',
      releaseYear: 2025,
      qualities: [QualityName.SD, QualityName.HD],
      seasons: [
        {
          seasonNumber: 1,
          episodeCount: 3,
        },
      ],
    },
  ];

  for (const title of demoTitles) {
    const created = await prisma.title.create({
      data: {
        name: title.name,
        type: title.type,
        description: title.description,
        releaseYear: title.releaseYear,
        qualities: {
          create: (title.qualities ?? [QualityName.HD]).map((name) => ({ name })),
        },
        episodes:
          title.type === TitleType.MOVIE
            ? {
                create: {
                  episodeNumber: 1,
                  durationSeconds: title.durationSeconds ?? 5400,
                  videoUrl: 'https://cdn.example.com/demo/movie.mp4',
                },
              }
            : undefined,
      },
    });

    if (title.type === TitleType.SERIES && title.seasons) {
      for (const seasonDef of title.seasons) {
        const season = await prisma.season.create({
          data: {
            titleId: created.id,
            seasonNumber: seasonDef.seasonNumber,
          },
        });

        for (let episode = 1; episode <= (seasonDef.episodeCount ?? 4); episode++) {
          await prisma.episode.create({
            data: {
              titleId: created.id,
              seasonId: season.id,
              episodeNumber: episode,
              name: `Episode ${episode}`,
              description: `Season ${seasonDef.seasonNumber}, Episode ${episode}`,
              durationSeconds: 2700,
              videoUrl: `https://cdn.example.com/demo/series/s${seasonDef.seasonNumber}/e${episode}.mp4`,
            },
          });
        }
      }
    }
  }

  console.log('Fallback content seeded.');
}

async function seedTmdbContent() {
  console.log('Fetching movies from TMDB...');
  const tmdbMovies = await getPopularMovies(15);

  for (const movie of tmdbMovies) {
    if (!movie.overview || !movie.release_date) continue;

    const releaseYear = parseInt(movie.release_date.split('-')[0]);
    const randomDuration = 5400 + Math.floor(Math.random() * 3600); // 90-150 minutes

    try {
      const createdMovie = await prisma.title.create({
        data: {
          name: movie.title,
          type: TitleType.MOVIE,
          description: movie.overview,
          releaseYear: releaseYear,
          episodes: {
            create: {
              episodeNumber: 1,
              durationSeconds: randomDuration,
              videoUrl: `https://cdn.example.com/movies/${movie.id}.mp4`,
            },
          },
          qualities: {
            create: getRandomQualities().map((name) => ({
              name,
            })),
          },
        },
      });

      console.log(`Created movie: ${createdMovie.name} (${releaseYear})`);
    } catch (error) {
      console.error(`Error creating movie ${movie.title}:`, error);
    }
  }

  // Fetch and create TV Series
  console.log('Fetching TV shows from TMDB...');
  const tmdbTVShows = await getPopularTVShows(5);

  for (const show of tmdbTVShows) {
    if (!show.overview || !show.first_air_date) continue;

    const releaseYear = parseInt(show.first_air_date.split('-')[0]);

    try {
      // Get full TV show details
      const tvDetails = await getTVShowDetails(show.id);

      const createdSeries = await prisma.title.create({
        data: {
          name: tvDetails.name,
          type: TitleType.SERIES,
          description: tvDetails.overview,
          releaseYear: releaseYear,
          qualities: {
            create: getRandomQualities().map((name) => ({
              name,
            })),
          },
        },
      });

      console.log(`Created series: ${createdSeries.name} (${releaseYear})`);

      // Create seasons (limit to first 3 seasons for performance)
      const maxSeasons = Math.min(tvDetails.number_of_seasons, 3);

      for (let seasonNum = 1; seasonNum <= maxSeasons; seasonNum++) {
        try {
          const seasonDetails = await getSeasonDetails(show.id, seasonNum);

          const season = await prisma.season.create({
            data: {
              titleId: createdSeries.id,
              seasonNumber: seasonNum,
            },
          });

          // Create episodes from TMDB data
          if (seasonDetails.episodes && seasonDetails.episodes.length > 0) {
            for (const episode of seasonDetails.episodes) {
              const runtime = episode.runtime || 45; // Default to 45 minutes if not provided

              await prisma.episode.create({
                data: {
                  titleId: createdSeries.id,
                  seasonId: season.id,
                  episodeNumber: episode.episode_number,
                  name: episode.name || `Episode ${episode.episode_number}`,
                  description: episode.overview || `Season ${seasonNum}, Episode ${episode.episode_number}`,
                  durationSeconds: runtime * 60,
                  videoUrl: `https://cdn.example.com/series/${show.id}/s${seasonNum}/e${episode.episode_number}.mp4`,
                },
              });
            }

            console.log(`  Created season ${seasonNum} with ${seasonDetails.episodes.length} episodes`);
          } else {
            // Fallback if episode details aren't available
            const episodeCount = seasonDetails.episode_count || 10;
            for (let episodeNum = 1; episodeNum <= episodeCount; episodeNum++) {
              await prisma.episode.create({
                data: {
                  titleId: createdSeries.id,
                  seasonId: season.id,
                  episodeNumber: episodeNum,
                  name: `Episode ${episodeNum}`,
                  description: `Season ${seasonNum}, Episode ${episodeNum}`,
                  durationSeconds: 2700,
                  videoUrl: `https://cdn.example.com/series/${show.id}/s${seasonNum}/e${episodeNum}.mp4`,
                },
              });
            }

            console.log(`  Created season ${seasonNum} with ${episodeCount} episodes`);
          }

          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 250));
        } catch (error) {
          console.error(`  Error creating season ${seasonNum}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error creating series ${show.name}:`, error);
    }
  }
}

async function seedViewingData(users: any[], titles: any[]) {
  if (users.length === 0 || titles.length === 0) return;

  const user1 = await prisma.user.findUnique({ where: { email: 'john@example.com' } });
  const user2 = await prisma.user.findUnique({ where: { email: 'jane@example.com' } });

  if (!user1 || !user2) return;

  // Get some titles and episodes for seeding
  const moviesAndSeries = await prisma.title.findMany({
    take: Math.min(10, titles.length),
    include: {
      episodes: {
        include: { season: true },
      },
    },
  });

  if (moviesAndSeries.length === 0) return;

  // Add titles to watchlist
  for (let i = 0; i < Math.min(3, moviesAndSeries.length); i++) {
    await prisma.watchlist.create({
      data: {
        userId: user1.id,
        titleId: moviesAndSeries[i].id,
      },
    });

    await prisma.watchlist.create({
      data: {
        userId: user2.id,
        titleId: moviesAndSeries[i].id,
      },
    });
  }

  // Create viewing progress for user1 - partial watching
  for (let i = 0; i < Math.min(2, moviesAndSeries.length); i++) {
    const title = moviesAndSeries[i];
    const episode = title.episodes[0];

    if (episode) {
      await prisma.viewingProgress.create({
        data: {
          userId: user1.id,
          titleId: title.id,
          episodeId: episode.id,
          positionSeconds: Math.floor(episode.durationSeconds * 0.5), // 50% watched
          totalDurationSeconds: episode.durationSeconds,
          isCompleted: false,
          autoPlayNextEpisode: true,
          lastViewedAt: new Date(Date.now() - 3600000), // 1 hour ago
        },
      });
    }
  }

  // Create viewing progress for user2 - completed watching
  for (let i = 0; i < Math.min(3, moviesAndSeries.length); i++) {
    const title = moviesAndSeries[i];
    const episode = title.episodes[0];

    if (episode) {
      const completedDate = new Date(Date.now() - Math.random() * 604800000); // Random time within last week

      await prisma.viewingProgress.create({
        data: {
          userId: user2.id,
          titleId: title.id,
          episodeId: episode.id,
          positionSeconds: episode.durationSeconds,
          totalDurationSeconds: episode.durationSeconds,
          isCompleted: true,
          autoPlayNextEpisode: true,
          lastViewedAt: completedDate,
          completedAt: completedDate,
        },
      });

      // Remove completed title from watchlist
      await prisma.watchlist.updateMany({
        where: {
          userId: user2.id,
          titleId: title.id,
        },
        data: {
          removedAt: completedDate,
        },
      });
    }
  }

  console.log('Viewing data seeded successfully!');
}

async function main() {
  console.log('Starting seed process...');

  // Clear existing data
  await prisma.watchlist.deleteMany();
  await prisma.viewingProgress.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.quality.deleteMany();
  await prisma.title.deleteMany();
  await prisma.quality.deleteMany();
  await prisma.user.deleteMany();

  await seedSubscriptionPlans();

  // Create Users with verified emails
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await prisma.user.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        emailVerified: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        emailVerified: true,
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: hashedPassword,
        emailVerified: true,
      },
    ],
  });

  console.log(`Created ${users.count} users`);

  await seedDemoInvitations('john@example.com');

  if (HAS_TMDB_KEY) {
    try {
      await seedTmdbContent();
    } catch (error) {
      console.error('TMDB seeding failed, using fallback content instead.', error);
      await seedFallbackContent();
    }
  } else {
    console.warn('TMDB_API_KEY is not set. Falling back to local demo data.');
    await seedFallbackContent();
  }

  // Seed viewing data
  const allUsers = await prisma.user.findMany();
  const allTitles = await prisma.title.findMany();
  await seedViewingData(allUsers, allTitles);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });