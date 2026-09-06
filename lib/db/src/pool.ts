import pg from "pg";

const { Pool } = pg;

const databaseUrl = (
  process.env.DATABASE_URL
  || process.env.NEON_DATABASE_URL
  || process.env.POSTGRES_URL
  || process.env.POSTGRES_PRISMA_URL
)?.trim();

const configuredPool = databaseUrl
  ? new Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  })
  : undefined;

// The Vercel auth function only needs SQL queries, not Drizzle metadata.
// Keeping this module dependency-light prevents a schema import failure from
// crashing the function before its request-level error handling runs.
export const pool = configuredPool as InstanceType<typeof Pool>;