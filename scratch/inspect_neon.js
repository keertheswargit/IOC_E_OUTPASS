const db = require('../src/config/db');

async function checkDetails() {
  await db.testConnection();

  const reqCols = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='outpass_requests' AND column_name IN ('out_time', 'in_time')
  `);
  console.log('outpass_requests columns in Neon:');
  console.table(reqCols.rows);

  const histCols = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='outpass_status_history' AND column_name IN ('out_time', 'in_time')
  `);
  console.log('outpass_status_history columns in Neon:');
  console.table(histCols.rows);

  const usersCount = await db.query('SELECT role, count(*) FROM users GROUP BY role ORDER BY role');
  console.log('Users in Neon by role:');
  console.table(usersCount.rows);

  const totalUsers = await db.query('SELECT count(*) FROM users');
  console.log('Total users in Neon:', totalUsers.rows[0].count);

  const sampleStudents = await db.query(`
    SELECT s.id, s.name, s.gender, h.name as hostel_name 
    FROM students s 
    JOIN hostels h ON s.hostel_id = h.id 
    LIMIT 6
  `);
  console.log('Sample students linked to hostels via Foreign Key in Neon:');
  console.table(sampleStudents.rows);

  await db.pool.end();
}

checkDetails().catch(console.error);
