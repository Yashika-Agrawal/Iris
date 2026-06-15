require('dotenv/config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const msgRes = await pool.query(
    `SELECT data->>'threadId' as t FROM corsair_entities WHERE entity_type = 'messages'`
  );
  console.log(msgRes.rows);
  await pool.end();
}

main().catch(console.error);
