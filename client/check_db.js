const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'corsair_entities'")
  .then(r => console.log('entities columns:', r.rows.map(c => c.column_name)))
  .catch(console.error);
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'corsair_accounts'")
  .then(r => console.log('accounts columns:', r.rows.map(c => c.column_name)))
  .catch(console.error)
  .finally(() => pool.end());
