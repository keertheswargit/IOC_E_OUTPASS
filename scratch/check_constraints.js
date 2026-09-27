const db = require('../src/config/db');

async function checkConstraints() {
  await db.testConnection();
  const res = await db.query(`
    SELECT conname, pg_get_constraintdef(oid) as def 
    FROM pg_constraint 
    WHERE conrelid = 'outpass_status_history'::regclass
  `);
  console.log(res.rows);
  await db.pool.end();
}

checkConstraints().catch(console.error);
