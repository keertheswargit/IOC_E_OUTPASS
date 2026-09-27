// Automated test suite for [SCRUM06B-F001-DB-001] Outpass Request Data Store
const assert = require("assert");
const { outpassStore } = require("../src/db/outpassStore");

console.log("=== Running Outpass Data Store Verification Tests ===");

// 1. Reset to seed data
outpassStore.resetWithSeed();
const initialRecords = outpassStore.getAll();
assert(initialRecords.length >= 7, "Initial seed records count should be at least 7");
console.log("✔ Seed data initialization passed. Total records:", initialRecords.length);

// 2. Query Pending Requests
const pending = outpassStore.getPending();
assert(pending.length >= 5, "Pending records count should match initial pending requests");
for (const req of pending) {
  assert.strictEqual(req.status, "PENDING", "All records returned by getPending must have status PENDING");
}
console.log("✔ Pending requests query passed. Pending count:", pending.length);

// 3. Create a new Outpass Request with validation
const newRequest = outpassStore.create({
  studentId: "23IT999",
  studentName: "Manoj Kumar",
  department: "Information Technology",
  year: "3rd Year",
  hostelBlock: "Block A (Boys)",
  roomNumber: "A-412",
  studentPhone: "+91 98400 12345",
  parentName: "K. Mohan",
  parentPhone: "+91 94440 56789",
  parentConsent: "VERIFIED",
  outpassType: "DAY_PASS",
  destination: "Coimbatore Medical College Hospital",
  reason: "Routine eye checkup appointment with Dr. Murugan.",
  departureTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
  expectedReturnTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString()
});

assert(newRequest.id && newRequest.id.startsWith("OP-"), "New record must have an ID starting with OP-");
assert.strictEqual(newRequest.status, "PENDING", "Newly created record must be PENDING");
assert.strictEqual(newRequest.studentId, "23IT999");
console.log("✔ Create outpass request passed. Generated ID:", newRequest.id);

// 4. Test validation error on invalid return time
assert.throws(() => {
  outpassStore.create({
    studentId: "23CS000",
    studentName: "Test Student",
    hostelBlock: "Block A",
    roomNumber: "A-101",
    destination: "Test",
    reason: "Test",
    departureTime: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    expectedReturnTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString() // BEFORE departure
  });
}, /Expected return time must be after departure time/, "Expected validation error for invalid return time");
console.log("✔ Return time validation check passed");

// 5. Test Search by roll number and name
const searchByRoll = outpassStore.getAll({ search: "23IT999" });
assert.strictEqual(searchByRoll.length, 1, "Should find exactly 1 record for 23IT999");
assert.strictEqual(searchByRoll[0].studentName, "Manoj Kumar");

const searchByName = outpassStore.getAll({ search: "Priya" });
assert(searchByName.length >= 1, "Search by name Priya should return match");
console.log("✔ Search filtering passed");

// 6. Test Filter by Hostel Block and Outpass Type
const blockB = outpassStore.getAll({ hostelBlock: "Block B" });
assert(blockB.length > 0, "Should find records in Block B");
for (const r of blockB) {
  assert(r.hostelBlock.includes("Cauvery") || r.hostelBlock.includes("Block B"), "Record must belong to Block B/Cauvery");
}

const emergencyPasses = outpassStore.getAll({ outpassType: "EMERGENCY_PASS" });
assert(emergencyPasses.length > 0, "Should find emergency pass records");
console.log("✔ Filter by block and outpass type passed");

// 7. Test Status Update (Approve)
const approved = outpassStore.updateStatus(newRequest.id, {
  status: "APPROVED",
  wardenRemarks: "Permission granted. Take necessary prescription receipts.",
  reviewedBy: "Chief Warden Dr. R. Sundaram"
});

assert.strictEqual(approved.status, "APPROVED");
assert(approved.gatePassToken && approved.gatePassToken.startsWith("EOP-SEC-"), "Approved pass must have gate token");
assert.strictEqual(approved.wardenRemarks, "Permission granted. Take necessary prescription receipts.");
assert(approved.reviewedAt !== null, "Reviewed timestamp must be recorded");
console.log("✔ Status update to APPROVED passed. Gate pass token:", approved.gatePassToken);

// 8. Test Status Update (Reject)
const rejectTestRecord = outpassStore.create({
  studentId: "23CS555",
  studentName: "Dinesh B",
  hostelBlock: "Block A (Boys)",
  roomNumber: "A-201",
  destination: "Mall",
  reason: "Gaming arcade visit during study hours",
  departureTime: new Date(Date.now() + 1 * 3600 * 1000).toISOString(),
  expectedReturnTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString()
});

const rejected = outpassStore.updateStatus(rejectTestRecord.id, {
  status: "REJECTED",
  wardenRemarks: "Outpass not permitted during mandatory study hours.",
  reviewedBy: "Chief Warden Dr. R. Sundaram"
});
assert.strictEqual(rejected.status, "REJECTED");
assert.strictEqual(rejected.gatePassToken, null, "Rejected pass must not have gate token");
console.log("✔ Status update to REJECTED passed with remarks recorded");

// 9. Test Statistics calculation
const stats = outpassStore.getStatistics();
assert(typeof stats.pendingCount === "number", "pendingCount must be a number");
assert(typeof stats.approvedToday === "number", "approvedToday must be a number");
assert(typeof stats.currentlyOutside === "number", "currentlyOutside must be a number");
console.log("✔ Dashboard statistics calculation passed. Stats snapshot:", stats);

// Reset back to clean initial seed data
outpassStore.resetWithSeed();
console.log("✔ Database cleanly re-seeded.");
console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<");
