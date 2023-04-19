import { PostgresDriver } from "./postgres-driver.ts";
import { PostgresIntrospector } from "./postgres-introspector.ts";
import { PostgresQueryCompiler } from "./postgres-query-compiler.ts";
import { PostgresAdapter } from "./postgres-adapter.ts";
import type { PostgresDialectConfig } from "./postgres-dialect-config.ts";
import { Kysely } from "../deps/kysely.ts";
import type {
  Driver,
  DialectAdapter,
  DatabaseIntrospector,
  Dialect,
  QueryCompiler,
} from "../deps/kysely.ts";

export class PostgresDialect implements Dialect {
  readonly #config: PostgresDialectConfig;

  constructor(config: PostgresDialectConfig) {
    this.#config = config;
  }

  createDriver(): Driver {
    return new PostgresDriver(this.#config);
  }

  createQueryCompiler(): QueryCompiler {
    return new PostgresQueryCompiler();
  }

  createAdapter(): DialectAdapter {
    return new PostgresAdapter();
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new PostgresIntrospector(db);
  }
}
