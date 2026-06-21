const { createCorsair } = require('corsair');
const { gmail } = require('@corsair-dev/gmail');
const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const corsair = createCorsair({ plugins: [gmail()], database: pool, kek: process.env.CORSAIR_KEK, multiTenancy: true });
  const res = await pool.query("SELECT tenant_id FROM corsair_accounts LIMIT 1");
  if(res.rows.length) {
    const tenant = corsair.withTenant(res.rows[0].tenant_id);
    console.log(Object.keys(tenant.gmail.keys));
  }
  pool.end();
}
main();
