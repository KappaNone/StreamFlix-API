import { execSync } from 'child_process';

function getDbUserAndName(): { user: string; db: string } {
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      const db = url.pathname.replace(/^\//, '') || 'postgres';
      return { user: url.username || 'postgres', db };
    } catch {
      // ignore
    }
  }

  return { user: 'admin', db: 'postgres' };
}

function runDockerPsql(sql: string): { ok: boolean; output: string } {
  try {
    const { user, db } = getDbUserAndName();
    const output = execSync(
      `docker exec -i -u postgres postgres_db psql -U ${user} -d ${db} -v ON_ERROR_STOP=1`,
      {
        encoding: 'utf8',
        input: sql.endsWith('\n') ? sql : `${sql}\n`,
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );
    return { ok: true, output };
  } catch (error: any) {
    const output =
      (error?.stdout ? String(error.stdout) : '') +
      (error?.stderr ? String(error.stderr) : '');
    return { ok: false, output };
  }
}

describe('DBMS Employee Access (smoke)', () => {
  jest.setTimeout(60_000);

  let canRun = false;

  beforeAll(() => {
    // Skip if docker isn't available or the expected container isn't running.
    try {
      const out = execSync('docker ps --format "{{.Names}}"', {
        encoding: 'utf8',
      });
      canRun = out.split(/\r?\n/).includes('postgres_db');
    } catch {
      canRun = false;
    }
  });

  it('junior: can read employee views, cannot read core tables', () => {
    if (!canRun) {
      return;
    }
    const okRead = runDockerPsql(
      [
        'SET ROLE streamflix_junior_role;',
        'SELECT COUNT(*) FROM public.employee_user_basic;',
        'SELECT COUNT(*) FROM public.employee_profile_basic;',
      ].join('\n'),
    );

    if (!okRead.ok) {
      // If roles are missing, make the failure actionable.
      throw new Error(`junior read check failed:\n${okRead.output}`);
    }

    const deniedUser = runDockerPsql(
      ['SET ROLE streamflix_junior_role;', 'SELECT COUNT(*) FROM "User";'].join(
        '\n',
      ),
    );
    expect(deniedUser.ok).toBe(false);
    expect(deniedUser.output).toMatch(/permission denied/i);

    const deniedSub = runDockerPsql(
      [
        'SET ROLE streamflix_junior_role;',
        'SELECT COUNT(*) FROM "Subscription";',
      ].join('\n'),
    );
    expect(deniedSub.ok).toBe(false);
    expect(deniedSub.output).toMatch(/permission denied/i);
  });

  it('mid: can activate/deactivate users, cannot access subscriptions', () => {
    if (!canRun) {
      return;
    }
    const okUpdate = runDockerPsql(
      [
        'SET ROLE streamflix_mid_role;',
        'UPDATE "User" SET "isActive" = true WHERE "id" = (SELECT "id" FROM public.employee_user_basic ORDER BY "id" LIMIT 1);',
      ].join('\n'),
    );

    if (!okUpdate.ok) {
      throw new Error(`mid update check failed:\n${okUpdate.output}`);
    }

    const deniedSub = runDockerPsql(
      [
        'SET ROLE streamflix_mid_role;',
        'SELECT COUNT(*) FROM "Subscription";',
      ].join('\n'),
    );
    expect(deniedSub.ok).toBe(false);
    expect(deniedSub.output).toMatch(/permission denied/i);
  });

  it('senior: can access subscriptions and viewing history', () => {
    if (!canRun) {
      return;
    }
    const ok = runDockerPsql(
      [
        'SET ROLE streamflix_senior_role;',
        'SELECT COUNT(*) FROM "Subscription";',
        'SELECT COUNT(*) FROM "ViewingProgress";',
      ].join('\n'),
    );

    if (!ok.ok) {
      throw new Error(`senior access check failed:\n${ok.output}`);
    }
  });
});
