require("dotenv").config();

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes("neon.tech");
const isLocalhost = !process.env.DATABASE_URL || 
                    process.env.DATABASE_URL.includes("localhost") || 
                    process.env.DATABASE_URL.includes("127.0.0.1") ||
                    process.env.PGHOST === "localhost";

let pool;
let poolConfig;

if (isNeon) {
  const { Pool: NeonPool, neonConfig } = require("@neondatabase/serverless");
  const ws = require("ws");
  neonConfig.webSocketConstructor = ws;

  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20
  };
  pool = new NeonPool(poolConfig);
} else {
  const { Pool: PgPool } = require("pg");
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isLocalhost ? false : { rejectUnauthorized: false }
  };
  pool = new PgPool(poolConfig);
}

let isConnected = false;

pool.on("error", (err) => {
  console.warn("[PostgreSQL Pool Error]:", err.message);
});

async function query(text, params) {
  return pool.query(text, params);
}

async function getClient() {
  return pool.connect();
}

async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function testConnection() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await pool.query(
        "SELECT NOW() as now, version() as version;"
      );

      isConnected = true;
      console.log("[PostgreSQL] Connected to Neon PostgreSQL");
      return true;
    } catch (err) {
      if (attempt < 3) {
        console.warn(`[PostgreSQL Notice] Attempt ${attempt} failed, retrying in 2s: ${err.message}`);
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        isConnected = false;
        console.warn(
          `[PostgreSQL Notice] Could not connect to database after 3 attempts: ${err.message}`
        );
        return false;
      }
    }
  }
}

module.exports = {
  pool,
  query,
  getClient,
  withTransaction,
  testConnection,
  isPostgresConnected: () => isConnected,
  poolConfig
};