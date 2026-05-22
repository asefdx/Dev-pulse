// src/config/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  
  },
  max: 20,           
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log(' NeonDB connected');
});

pool.on('error', (err) => {
  console.error(' DB error:', err);
  process.exit(1);
});

export default pool;