const assert = require("assert");
const outpassRepository = require("../src/repositories/outpassRepository");
const approvalService = require("../src/services/approvalService");
const { outpassStore } = require("../src/db/outpassStore");

async function testSecurityFastPass() {
  console.log("=== Testing Security Gate Rush-Hour 1-Click Fast Pass System ===");

  await outpassRepository.resetDatabaseForTests();

  // Create an approved pass ready for departure
  const depPass = outpassStore.create({
    studentId: "2024501045",
    studentName: "Dinesh B",
    department: "Computer Science",
    hostelBlock: "Marutham (Boys Hostel)",
    wardenId: "WARDEN-MAR",
    roomNumber: "M-201",
    destination: "Home - Salem",
    outpassType: "WEEKEND_PASS",
    reason: "Going home for weekend",
    departureTime: new Date(Date.now() + 1 * 3600 * 1000).toISOString(),
    expectedReturnTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    parentName: "Balasubramaniam",
    parentPhone: "+91 94433 22110"
  });

  await outpassRepository.create({
    id: depPass.id,
    student_id: depPass.studentId,
    student_name: depPass.studentName,
    department: depPass.department,
    hostel_block: depPass.hostelBlock,
    warden_id: depPass.wardenId,
    room_number: depPass.roomNumber,
    outpass_type: depPass.outpassType,
    destination: depPass.destination,
    reason: depPass.reason,
    departure_time: depPass.departureTime,
    expected_return_time: depPass.expectedReturnTime,
    parent_name: depPass.parentName,
    parent_phone: depPass.parentPhone
  });

  // Approve it
  await approvalService.processDecision({
    outpassId: depPass.id,
    action: "APPROVE",
    remarks: "Approved",
    wardenUser: { id: "WARDEN-MAR", role: "WARDEN", name: "Dr. R. Sundaram" }
  });

  // Check departure list
  const allRecords = await outpassRepository.getAll({});
  const departingToday = allRecords.filter(r => {
    const s = String(r.status).toUpperCase();
    return s === "APPROVED" && !r.out_time && !r.departure_verified_at;
  });

  const found = departingToday.find(r => r.id === depPass.id);
  assert(found, "Newly approved student must appear in 'Going Home Today' list");
  console.log(`✔ Student ${found.studentName} (${found.studentId}) is listed in 'Going Home Today' list!`);

  // Test 1-click Exit Permit by outpassId (without typing any code)
  const exitPermit = await approvalService.verifyDeparture({
    outpassId: depPass.id,
    securityUser: { id: "SEC-BOYS", name: "Officer K. Raman", role: "SECURITY" }
  });

  assert.strictEqual(exitPermit.outpass.status, "CHECKED-OUT");
  assert(exitPermit.outpass.out_time, "Must record out_time on 1-click clearance");
  console.log(`✔ 1-Click Departure Clearance Succeeded! Status: ${exitPermit.outpass.status}, out_time: ${exitPermit.outpass.out_time}`);

  // Now check returning list
  const allRecordsAfterExit = await outpassRepository.getAll({});
  const returningToday = allRecordsAfterExit.filter(r => {
    const s = String(r.status).toUpperCase();
    return s === "CHECKED-OUT" || (s === "APPROVED" && (r.out_time || r.departure_verified_at) && !r.return_verified_at);
  });

  const foundReturning = returningToday.find(r => r.id === depPass.id);
  assert(foundReturning, "Checked out student must immediately appear in 'Returning to Hostel' list");
  console.log(`✔ Student ${foundReturning.studentName} is now listed in 'Returning to Hostel' list!`);

  // Test 1-click Return Permit by outpassId (without typing any code)
  const entryPermit = await approvalService.verifyReturn({
    outpassId: depPass.id,
    securityUser: { id: "SEC-BOYS", name: "Officer K. Raman", role: "SECURITY" }
  });

  assert.strictEqual(entryPermit.outpass.status, "COMPLETED");
  assert(entryPermit.outpass.in_time, "Must record in_time on 1-click return clearance");
  console.log(`✔ 1-Click Return Entry Clearance Succeeded! Status: ${entryPermit.outpass.status}, in_time: ${entryPermit.outpass.in_time}`);

  console.log("\n>>> ALL RUSH-HOUR 1-CLICK FAST PASS TESTS PASSED! <<<");
  process.exit(0);
}

testSecurityFastPass().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
