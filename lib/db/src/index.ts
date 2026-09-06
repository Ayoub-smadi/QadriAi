import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

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

// Keep the module loadable in serverless builds even when the deployment
// variable is missing; the request handler can then return a JSON error instead
// of Vercel replacing the response with its generic server-error page.
export const pool = configuredPool as InstanceType<typeof Pool>;

export const db = (configuredPool ? drizzle(configuredPool, { schema }) : undefined) as ReturnType<typeof drizzle>;

export * from "./schema/index.js";
