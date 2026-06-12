/**
 * Simple migration runner.
 * Usage: npm run migrate
 * Reads schema.sql and executes it against the configured database.
 */
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function migrate() {
  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Running migrations...');
    await client.query(sql);
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
