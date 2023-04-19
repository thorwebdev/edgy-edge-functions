import { Pool } from "../deps/postgres.ts";
import type { PoolClient } from "../deps/postgres.ts";
import { PostgresDialectConfig } from "./postgres-dialect-config.ts";
import { CompiledQuery, PostgresCursorConstructor } from "../deps/kysely.ts";
import type {
  DatabaseConnection,
  QueryResult,
  Driver,
  TransactionSettings,
} from "../deps/kysely.ts";
import { extendStackTrace } from "../deps/kysely.ts";

const PRIVATE_RELEASE_METHOD = Symbol();

export class PostgresDriver implements Driver {
  readonly #config: PostgresDialectConfig;
  readonly #connections = new WeakMap<PoolClient, DatabaseConnection>();
  #pool: Pool | null = null;

  constructor(config: PostgresDialectConfig) {
    this.#config = config;
  }

  async init(): Promise<void> {
    this.#pool =
      typeof this.#config.pool === "function"
        ? await this.#config.pool()
        : this.#config.pool;
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    const client = await this.#pool!.connect();
    let connection = this.#connections.get(client);

    if (!connection) {
      connection = new PostgresConnection(client, { cursor: null });
      this.#connections.set(client, connection);

      // The driver must take care of calling `onCreateConnection` when a new
      // connection is created. The `pg` module doesn't provide an async hook
      // for the connection creation. We need to call the method explicitly.
      // if (this.#config.onCreateConnection) {
      //   await this.#config.onCreateConnection(connection);
      // }
    }

    return connection;
  }

  async beginTransaction(
    connection: DatabaseConnection,
    settings: TransactionSettings
  ): Promise<void> {
    if (settings.isolationLevel) {
      await connection.executeQuery(
        CompiledQuery.raw(
          `start transaction isolation level ${settings.isolationLevel}`
        )
      );
    } else {
      await connection.executeQuery(CompiledQuery.raw("begin"));
    }
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("commit"));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("rollback"));
  }

  // deno-lint-ignore require-await
  async releaseConnection(connection: DatabaseConnection): Promise<void> {
    const pgConnection = connection as PostgresConnection;
    pgConnection[PRIVATE_RELEASE_METHOD]();
  }

  async destroy(): Promise<void> {
    if (this.#pool) {
      const pool = this.#pool;
      this.#pool = null;
      await pool.end();
    }
  }
}

interface PostgresConnectionOptions {
  cursor: PostgresCursorConstructor | null;
}

class PostgresConnection implements DatabaseConnection {
  #client: PoolClient;
  #options: PostgresConnectionOptions;

  constructor(client: PoolClient, options: PostgresConnectionOptions) {
    this.#client = client;
    this.#options = options;
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    try {
      const result = await this.#client.queryObject<O>(compiledQuery.sql, [
        ...compiledQuery.parameters,
      ]);

      if (result.command === "UPDATE" || result.command === "DELETE") {
        return {
          numUpdatedOrDeletedRows: BigInt(result.rowCount!),
          rows: result.rows ?? [],
        };
      }

      return {
        rows: result.rows ?? [],
      };
    } catch (err) {
      throw extendStackTrace(err, new Error());
    }
  }

  async *streamQuery<O>(
    _compiledQuery: CompiledQuery,
    _chunkSize: number
  ): AsyncIterableIterator<QueryResult<O>> {
    if (!this.#options.cursor) {
      throw new Error(
        "'cursor' is not present in your postgres dialect config. It's required to make streaming work in postgres."
      );
    }

    // Deno postgress does not support streaming
  }

  [PRIVATE_RELEASE_METHOD](): void {
    this.#client.release();
  }
}
