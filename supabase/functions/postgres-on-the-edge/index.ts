// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

console.log(`Function "postgres-on-the-edge" up and running!`);

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(
  {
    tls: { caCertificates: [Deno.env.get("DB_SSL_CERT")!] },
    database: "postgres",
    hostname: "db.bljghubhkofddfrezkhn.supabase.co",
    user: "postgres",
    port: 5432,
    password: Deno.env.get("DB_PASSWORD"),
  },
  3,
  true
);

serve(async (_req) => {
  try {
    // Grab a connection from the pool
    const connection = await pool.connect();

    try {
      // Run a query
      const result = await connection.queryObject`SELECT * FROM animals`;
      const animals = result.rows; // [{ id: 1, name: "Lion" }, ...]

      // Encode the result as pretty printed JSON
      const body = JSON.stringify(
        animals,
        (key, value) => (typeof value === "bigint" ? value.toString() : value),
        2
      );

      // Return the response with the correct content type header
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    } finally {
      // Release the connection back into the pool
      connection.release();
    }
  } catch (err) {
    console.error(err);
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
