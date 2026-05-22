// src/server.ts
import 'dotenv/config';
import app from './app';
import pool from './config/db';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await pool.query('SELECT 1'); 
    console.log('✅ Database connected');
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(' Failed to start:', err);
    process.exit(1);
  }
};

start();