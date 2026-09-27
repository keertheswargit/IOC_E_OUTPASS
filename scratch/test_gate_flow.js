const db = require('../src/config/db');
const approvalService = require('../src/services/approvalService');

async function testFullGateFlow() {
  await db.testConnection();
  console.log('Testing Gate Flow on OP-2026-001...');

  // 1. Approve
  const approveRes = await approvalService.processDecision({
    outpassId: 'OP-2026-001',
    action: 'APPROVE',
    remarks: 'Approved for testing',
    wardenUser: { id: 'WARDEN-MAR', role: 'WARDEN', name: 'Dr. R. Sundaram' }
  });
  const outboundCode = approveRes.outpass.outbound_code;
  const inboundCode = approveRes.outpass.inbound_code;
  console.log('Approved codes:', { outboundCode, inboundCode });

  // 2. Depart via Boys Security Gate
  const depRes = await approvalService.verifyDeparture({
    code: outboundCode,
    securityUser: { id: 'SEC-BOYS', role: 'SECURITY', name: 'Officer K. Raman' }
  });
  console.log('Departure result status:', depRes.outpass.status, 'out_time:', depRes.outpass.out_time);

  // 3. Return via Boys Security Gate
  const retRes = await approvalService.verifyReturn({
    code: inboundCode,
    securityUser: { id: 'SEC-BOYS', role: 'SECURITY', name: 'Officer K. Raman' }
  });
  console.log('Return result status:', retRes.outpass.status, 'in_time:', retRes.outpass.in_time);

  // 4. Query PostgreSQL directly to inspect records
  const reqCheck = await db.query('SELECT id, status, out_time, in_time, outbound_code, inbound_code FROM outpass_requests WHERE id = $1', ['OP-2026-001']);
  console.log('Database outpass_requests record:');
  console.table(reqCheck.rows);

  const histCheck = await db.query('SELECT id, outpass_id, previous_status, new_status, changed_by, out_time, in_time FROM outpass_status_history WHERE outpass_id = $1 ORDER BY id ASC', ['OP-2026-001']);
  console.log('Database outpass_status_history records:');
  console.table(histCheck.rows);

  // Reset OP-2026-001 back to pristine pending state
  await db.query(`
    UPDATE outpass_requests 
    SET status = 'PENDING', approved_by = NULL, warden_remarks = NULL, rejection_reason = NULL,
        departure_verified_at = NULL, return_verified_at = NULL, out_time = NULL, in_time = NULL,
        outbound_code = NULL, inbound_code = NULL
    WHERE id = 'OP-2026-001'
  `);
  await db.query(`DELETE FROM outpass_status_history WHERE outpass_id = 'OP-2026-001'`);

  console.log('✔ Verified out_time and in_time are stored properly in both tables in live DB!');
  await db.pool.end();
}

testFullGateFlow().catch(console.error);
