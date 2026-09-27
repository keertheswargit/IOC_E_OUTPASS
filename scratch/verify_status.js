const db = require('../src/config/db');

async function check() {
  await db.testConnection();
  const users = await db.query('SELECT id, name, email, role FROM users ORDER BY role, id');
  console.log('All Users in DB:');
  console.table(users.rows);

  const secCols = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='securities'");
  console.log('Securities columns:', secCols.rows);

  const secRows = await db.query("SELECT * FROM securities");
  console.log('Securities rows:', secRows.rows);

  const studentsNotInTable = await db.query(`
    SELECT u.id, u.name, u.email 
    FROM users u 
    LEFT JOIN students s ON u.id = s.id 
    WHERE u.role = 'STUDENT' AND s.id IS NULL
  `);
  console.log('Students in users table but NOT in students table:', studentsNotInTable.rows);

  await db.pool.end();
}

check().catch(console.error);
