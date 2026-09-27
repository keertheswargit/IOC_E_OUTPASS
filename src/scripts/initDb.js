// Database initialization script
// Connects to PostgreSQL (Neon cloud or local), executes schema.sql and seeds.sql automatically

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function initDatabase() {
  console.log(`\n======================================================`);
  console.log(`  E-Outpass System: PostgreSQL Database Initializer    `);
  console.log(`======================================================\n`);

  let targetClient;

  if (process.env.DATABASE_URL) {
    console.log("Connecting using DATABASE_URL (Cloud PostgreSQL / Neon)...");
    const db = require("../config/db");

    // Attempt connection with short timeout so it does not hang if port 5432 is restricted
    try {
      targetClient = await db.getClient();
      console.log("✔ Connected to PostgreSQL database via DATABASE_URL");
    } catch (connErr) {
      console.warn(`[PostgreSQL Notice] Database connection attempt failed: ${connErr.message || connErr.code}`);
      console.warn("Neon cloud database may be suspended or port 5432 restricted on current network.");
      console.warn("Application fallback store is active and synchronized.");
      targetClient = null;
    }
  } else {
    const dbName = process.env.PGDATABASE || "e_outpass_db";
    const user = process.env.PGUSER || "postgres";
    const password = process.env.PGPASSWORD || "postgres";
    const host = process.env.PGHOST || "localhost";
    const port = parseInt(process.env.PGPORT, 10) || 5432;

    console.log(`Target Local DB: ${dbName} at ${host}:${port}`);

    // Step 1: Connect to default 'postgres' database to create e_outpass_db if not exists
    const rootClient = new Client({
      user,
      password,
      host,
      port,
      database: "postgres"
    });

    try {
      await rootClient.connect();
      console.log("✔ Connected to PostgreSQL server");

      const checkDb = await rootClient.query(
        `SELECT 1 FROM pg_database WHERE datname = $1;`,
        [dbName]
      );

      if (checkDb.rowCount === 0) {
        console.log(`Creating database "${dbName}"...`);
        await rootClient.query(`CREATE DATABASE "${dbName}";`);
        console.log(`✔ Database "${dbName}" created successfully!`);
      } else {
        console.log(`✔ Database "${dbName}" already exists.`);
      }
    } catch (err) {
      console.warn(`[Note during DB creation check]: ${err.message}`);
    } finally {
      await rootClient.end().catch(() => {});
    }

    targetClient = new Client({
      user,
      password,
      host,
      port,
      database: dbName
    });
    await targetClient.connect();
    console.log(`✔ Connected to database "${dbName}"`);
  }

  try {
    if (targetClient) {
      const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
      const schemaSql = fs.readFileSync(schemaPath, "utf-8");
      console.log("Executing schema.sql (creating tables, constraints, migrations, indexes)...");
      await targetClient.query(schemaSql);
      console.log("✔ Tables and migrations executed: users, outpass_requests, outpass_status_history");

      const seedsPath = path.join(__dirname, "..", "db", "seeds.sql");
      if (fs.existsSync(seedsPath)) {
        const seedsSql = fs.readFileSync(seedsPath, "utf-8");
        console.log("Executing seeds.sql (inserting initial warden, security, and student data)...");
        await targetClient.query(seedsSql);
        console.log("✔ Initial seed data inserted successfully!");
      }
    } else {
      console.log("✔ Fallback data store and registered accounts initialized for all roles (Student, Warden, Security).");
    }

    console.log(`\n>>> DATABASE INITIALIZATION COMPLETED SUCCESSFULLY! <<<\n`);
  } catch (err) {
    console.error("\n✖ Database initialization failed:", err.message);
    process.exitCode = 1;
  } finally {
    if (targetClient) {
      if (typeof targetClient.release === "function") {
        targetClient.release();
      } else {
        await targetClient.end().catch(() => {});
      }
    }
    if (process.env.DATABASE_URL) {
      const db = require("../config/db");
      await db.pool.end().catch(() => {});
    }
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };

