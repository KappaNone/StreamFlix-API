import { execSync } from 'child_process';

function readEnvFromApiContainer(varName: string): string | undefined {
  try {
    const value = execSync(
      `docker exec streamflix-api-server-1 node -e "process.stdout.write(process.env.${varName} || '')"`,
      { encoding: 'utf8' },
    );
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  } catch {
    return undefined;
  }
}

function toHostAccessibleDatabaseUrl(containerUrl: string): string | undefined {
  try {
    const url = new URL(containerUrl);
    // When tests run on the host machine, 'postgres_db' won't resolve.
    // docker-compose exposes Postgres as localhost:5432.
    url.hostname = 'localhost';
    url.port = url.port || '5432';
    return url.toString();
  } catch {
    return undefined;
  }
}

export function ensureE2EEnv(): void {
  // Prefer local env (e.g. teacher sets .env), fallback to values from the running docker container.
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = readEnvFromApiContainer('JWT_SECRET') || 'e2e-test-secret';
  }

  if (!process.env.DATABASE_URL) {
    const dockerUrl = readEnvFromApiContainer('DATABASE_URL');
    if (dockerUrl) {
      process.env.DATABASE_URL = toHostAccessibleDatabaseUrl(dockerUrl) || dockerUrl;
    }
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is required for e2e tests. Start the stack (e.g. `npm run docker`) or set DATABASE_URL in your environment before running `npm run test:e2e`.',
    );
  }
}
