import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/* ============================================================
   DATABASE CONFIGURATION
============================================================ */

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is missing!');
  console.error(
    'Add DATABASE_URL to your deployment environment variables.'
  );
}

/* ============================================================
   POSTGRES POOL
============================================================ */

export const pool = new Pool({
  connectionString: databaseUrl,

  ssl: databaseUrl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,

  // Keep connections healthy in production
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/* ============================================================
   DATABASE ERROR HANDLER
============================================================ */

pool.on('error', (err) => {
  console.error(
    '❌ Unexpected PostgreSQL pool error:',
    err.message
  );
});

/* ============================================================
   TEST DATABASE CONNECTION
============================================================ */

const testDatabaseConnection = async () => {
  let client;

  try {
    client = await pool.connect();

    const result = await client.query(
      'SELECT NOW() AS current_time'
    );

    console.log('==========================================');
    console.log('✅ Connected to Neon PostgreSQL');
    console.log(`🕒 Database time: ${result.rows[0].current_time}`);
    console.log('==========================================');
  } catch (error) {
    console.error('==========================================');
    console.error('❌ Failed to connect to PostgreSQL');
    console.error(`❌ ${error.message}`);
    console.error('==========================================');
  } finally {
    if (client) {
      client.release();
    }
  }
};

testDatabaseConnection();

/* ============================================================
   QUERY HELPER
============================================================ */

export const query = (text, params) => {
  return pool.query(text, params);
};