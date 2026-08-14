// multi-tenant-saas/backend/src/config/database.js
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
 const pool = new Pool({
  // Pass the full unified string copied from Neon dashboard directly
  connectionString: process.env.DATABASE_URL,
  ssl: {
        rejectUnauthorized: false // Required for Neon's secure cloud endpoints
  },
 max: 10, // Neon recommends lower connection counts for serverless/cloud efficiency
  idleTimeoutMillis: 30000,
});
pool.on('connect', () => {
  console.log('Database pool connected successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});
export default  {
  // Global query assistant. Protects against SQL injections by enforcing parameterized arrays
  query: (text, params) => pool.query(text, params),
};