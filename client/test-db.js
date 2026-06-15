require('dotenv/config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query("SELECT data FROM corsair_entities WHERE entity_type = 'messages' LIMIT 1");
  console.log(JSON.stringify(res.rows[0].data, null, 2));
  await pool.end();
}

main().catch(console.error);
