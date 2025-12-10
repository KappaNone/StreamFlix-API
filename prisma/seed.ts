import { PrismaClient, TitleType, QualityName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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

function getRandomQualities(qualityIds: number[]): number[] {
  const numQualities = Math.floor(Math.random() * 2) + 1; // 1-2 qualities
  const shuffled = [...qualityIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numQualities);
}

async function main() {
  console.log('Starting seed with TMDB API data...');

  // Clear existing data
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.titleQuality.deleteMany();
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

  // Create Qualities
  const sdQuality = await prisma.quality.create({
    data: { name: QualityName.SD },
  });

  const hdQuality = await prisma.quality.create({
    data: { name: QualityName.HD },
  });

  const uhdQuality = await prisma.quality.create({
    data: { name: QualityName.UHD },
  });

  const qualityIds = [sdQuality.id, hdQuality.id, uhdQuality.id];

  console.log('Created qualities');

  // Fetch and create Movies
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
            create: getRandomQualities(qualityIds).map((qualityId) => ({
              qualityId,
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
            create: getRandomQualities(qualityIds).map((qualityId) => ({
              qualityId,
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
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
          console.error(`  Error creating season ${seasonNum}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error creating series ${show.name}:`, error);
    }
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