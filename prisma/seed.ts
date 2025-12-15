import { PrismaClient, TitleType, QualityName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const HAS_TMDB_KEY = Boolean(TMDB_API_KEY);

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

async function main() {
  console.log('Starting seed process...');

  // Clear existing data
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.quality.deleteMany();
  await prisma.title.deleteMany();
  await prisma.quality.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await prisma.user.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: hashedPassword,
      },
    ],
  });

  console.log(`Created ${users.count} users`);

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