import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon cloud SSL connections
  },
});

// Test connection on load
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to Neon PostgreSQL:', err.message);
  } else {
    console.log(' Connected to Neon PostgreSQL database');
    release();
  }
});

export const query = (text, params) => pool.query(text, params);