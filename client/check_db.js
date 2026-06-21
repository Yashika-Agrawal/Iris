const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT config FROM corsair_accounts LIMIT 1")
  .then(r => console.log('account config:', JSON.stringify(r.rows[0]?.config, null, 2)))
  .catch(console.error)
  .finally(() => pool.end());
