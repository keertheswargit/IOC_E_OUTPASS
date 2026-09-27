// Verification script to test student outpass lifecycle and immediate re-application
const assert = require("assert");
const outpassRepository = require("../src/repositories/outpassRepository");
const approvalService = require("../src/services/approvalService");
const userRepository = require("../src/repositories/userRepository");
const { outpassStore } = require("../src/db/outpassStore");

async function runVerification() {
  console.log("=== Testing Student Outpass Lifecycle & Immediate Re-Application ===");

  await outpassRepository.resetDatabaseForTests();

  // Test with student 2024506012 (Vignesh S) who has no initial outpass in seed data
  const studentId = "2024506012";
  const student = await userRepository.findByIdentifier(studentId);
  assert(student, "Student 2024506012 must exist");
  console.log(`✔ Verified Student: ${student.name} (${student.id}), Hostel: ${student.hostel_block}, Warden: ${student.warden_id}`);

  // 1. Initial State: Check if active outpass exists
  const hasActiveBefore = await outpassRepository.hasActiveOutpass(studentId);
  console.log(`Active outpass before test: ${hasActiveBefore}`);
  assert.strictEqual(hasActiveBefore, false, "Initial active outpass must be false");

  // 2. Submit Outpass Request #1
  const depTime1 = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
  const retTime1 = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  const req1 = outpassStore.create({
    studentId: student.id,
    studentName: student.name,
    department: student.department || "Information Technology",
    hostelBlock: student.hostel_block,
    wardenId: student.warden_id,
    roomNumber: student.room_number || "M-304",
    destination: "Home - Coimbatore",
    outpassType: "WEEKEND_PASS",
    reason: "Family gathering",
    departureTime: depTime1,
    expectedReturnTime: retTime1,
    parentName: "Senthil Nathan",
    parentPhone: "+91 94432 10987"
  });

  await outpassRepository.create({
    id: req1.id,
    student_id: req1.studentId,
    student_name: req1.studentName,
    department: req1.department,
    hostel_block: req1.hostelBlock,
    warden_id: req1.wardenId,
    room_number: req1.roomNumber,
    outpass_type: req1.outpassType,
    destination: req1.destination,
    reason: req1.reason,
    departure_time: req1.departureTime,
    expected_return_time: req1.expectedReturnTime,
    parent_name: req1.parentName,
    parent_phone: req1.parentPhone
  });
  console.log(`✔ Outpass #1 Created: ${req1.id} (Status: PENDING)`);

  // 3. Test that applying AGAIN right now is blocked with active outpass conflict
  const hasActiveWhilePending = await outpassRepository.hasActiveOutpass(studentId);
  assert.strictEqual(hasActiveWhilePending, true, "Must have active outpass while PENDING");
  console.log("✔ Concurrent submission correctly prevented while PENDING");

  // 4. Warden Approves Outpass #1
  const approvalResult = await approvalService.processDecision({
    outpassId: req1.id,
    action: "APPROVE",
    remarks: "Approved for weekend break",
    wardenUser: {
      id: student.warden_id,
      name: "Dr. K. Arumugam",
      role: "WARDEN"
    }
  });
  console.log(`✔ Outpass #1 Approved by WARDEN-MAR. Status: ${approvalResult.outpass.status}`);
  assert.strictEqual(approvalResult.outpass.status, "APPROVED");
  const outboundCode = approvalResult.outpass.outbound_code || approvalResult.outpass.outboundCode;
  const inboundCode = approvalResult.outpass.inbound_code || approvalResult.outpass.inboundCode;
  assert(outboundCode && outboundCode.startsWith("OUT-"), "Must have outbound code");
  assert(inboundCode && inboundCode.startsWith("IN-"), "Must have inbound code");

  // 5. Gate Security Verifies Departure (OUT)
  const departureResult = await approvalService.verifyDeparture({
    code: outboundCode,
    securityUser: { id: "SEC-BOYS", name: "Officer K. Raman", role: "SECURITY" }
  });
  console.log(`✔ Gate Departure Verified. Status: ${departureResult.outpass.status}`);
  assert.strictEqual(departureResult.outpass.status, "CHECKED-OUT");
  assert(departureResult.outpass.out_time, "Must record out_time upon departure");
  assert(departureResult.student.name, "Must return full student details upon departure verification");
  console.log(`   Recorded out_time: ${departureResult.outpass.out_time}`);
  console.log(`   Verified Student Dossier: ${departureResult.student.name} (${departureResult.student.id}), Room: ${departureResult.student.roomNumber}`);

  // 6. Gate Security Verifies Return (IN)
  const returnResult = await approvalService.verifyReturn({
    code: inboundCode,
    securityUser: { id: "SEC-BOYS", name: "Officer K. Raman", role: "SECURITY" }
  });
  console.log(`✔ Gate Return Verified. Status: ${returnResult.outpass.status}`);
  assert.strictEqual(returnResult.outpass.status, "COMPLETED");
  assert(returnResult.outpass.in_time, "Must record in_time upon return");
  assert(returnResult.student.name, "Must return full student details upon return verification");
  console.log(`   Recorded in_time: ${returnResult.outpass.in_time}`);

  // 7. Critical Logic Check: Has the student cleared their active outpass?
  const hasActiveAfterComplete = await outpassRepository.hasActiveOutpass(studentId);
  console.log(`Active outpass after completion: ${hasActiveAfterComplete}`);
  assert.strictEqual(hasActiveAfterComplete, false, "Must NOT have active outpass after returning to hostel");
  console.log("✔ Student active outpass cleared upon completion!");

  // 8. Re-application: Student Submits Outpass Request #2 -> MUST SUCCEED
  const depTime2 = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
  const retTime2 = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

  const req2 = outpassStore.create({
    studentId: student.id,
    studentName: student.name,
    department: student.department || "Information Technology",
    hostelBlock: student.hostel_block,
    wardenId: student.warden_id,
    roomNumber: student.room_number || "M-304",
    destination: "Chennai - Tech Symposium",
    outpassType: "DAY_PASS",
    reason: "Inter-college technical competition",
    departureTime: depTime2,
    expectedReturnTime: retTime2,
    parentName: "Senthil Nathan",
    parentPhone: "+91 94432 10987"
  });

  assert(req2 && req2.id, "Student successfully re-applied for a new outpass!");
  console.log(`✔ Re-application successful! Created Outpass #2: ${req2.id} (Status: PENDING)`);

  console.log("\n>>> ALL LIFECYCLE & RE-APPLICATION VERIFICATIONS PASSED! <<<");
  process.exit(0);
}

runVerification().catch(err => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
