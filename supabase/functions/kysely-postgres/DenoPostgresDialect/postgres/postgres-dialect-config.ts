import type { Pool } from "../deps/postgres.ts";

export interface PostgresDialectConfig {
  pool: Pool | (() => Promise<Pool>);
}
