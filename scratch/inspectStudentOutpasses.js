const db = require("../src/config/db");
const { outpassStore } = require("../src/db/outpassStore");

async function check() {
  const studentId = "2024506057";
  console.log("Checking DB records for student:", studentId);
  if (db.isPostgresConnected()) {
    const res = await db.query("SELECT id, student_id, status, departure_time, expected_return_time, out_time, in_time FROM outpass_requests WHERE UPPER(student_id) = $1 OR UPPER(student_id) = '23IT101'", [studentId]);
    console.log("Postgres records:", res.rows);
  }
  const storeRecords = outpassStore.getAll().filter(r => r.studentId === studentId || r.studentId === "23IT101");
  console.log("JSON/Store records:", storeRecords.map(r => ({ id: r.id, studentId: r.studentId, status: r.status, out_time: r.out_time, in_time: r.in_time })));
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
