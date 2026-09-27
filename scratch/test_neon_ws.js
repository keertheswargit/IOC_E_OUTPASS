const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

async function testNeon() {
  const neonUrl = 'postgresql://neondb_owner:npg_YG3o9EgsplVw@ep-wild-field-b5uzdaza.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
  console.log('Connecting to Neon via WebSocket (HTTPS Port 443)...');
  const pool = new Pool({ connectionString: neonUrl });

  try {
    const res = await pool.query('SELECT current_database(), current_user, version()');
    console.log('>>> SUCCESSFULLY CONNECTED TO NEON CLOUD OVER WEBSOCKET! <<<');
    console.log('DB Info:', res.rows[0]);
    await pool.end();
    return true;
  } catch (err) {
    console.error('Neon connection failed:', err);
    await pool.end();
    return false;
  }
}

testNeon().then(success => process.exit(success ? 0 : 1));
