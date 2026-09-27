// Automated Test Suite for:
// 1. [SCRUM06B-F002-DB-001] Outpass Status History
// 2. [SCRUM06B-F002-BE-001] Outpass Approval/Rejection API

const assert = require("assert");
const http = require("http");
const app = require("../src/server");
const outpassRepository = require("../src/repositories/outpassRepository");
const statusHistoryRepository = require("../src/repositories/statusHistoryRepository");

const TEST_PORT = 3002;

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers
    };

    const options = {
      hostname: "127.0.0.1",
      port: TEST_PORT,
      path,
      method,
      headers: defaultHeaders
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const server = app.listen(TEST_PORT, async () => {
  console.log(`\n=============================================================`);
  console.log(`  RUNNING TEST SUITE: SCRUM06B-F002-BE-001 & DB-001          `);
  console.log(`=============================================================\n`);

  try {
    // Reset test repositories and PostgreSQL test records to clean initial state
    await outpassRepository.resetDatabaseForTests();
    statusHistoryRepository._clearMemoryStore();

    // -------------------------------------------------------------
    // TEST 1: Successful Approval
    // -------------------------------------------------------------
    console.log("▶ TEST 1: Successful Outpass Approval");
    const approveRes = await makeRequest(
      "POST",
      "/api/outpasses/OP-2026-001/approve",
      {
        "x-user-id": "WARDEN-001",
        "x-user-role": "WARDEN",
        "x-user-name": "Dr. R. Sundaram"
      },
      {
        remarks: "Approved for weekend leave. Report back before Sunday 8:00 PM."
      }
    );

    assert.strictEqual(approveRes.status, 200, "Should return HTTP 200 OK");
    assert.strictEqual(approveRes.body.success, true, "Body success should be true");
    assert.strictEqual(approveRes.body.data.outpass.status, "APPROVED", "Status must be updated to APPROVED");
    assert(["WARDEN-001", "WARDEN-MAR"].includes(approveRes.body.data.outpass.approved_by), "Approved_by must match warden ID");
    assert.strictEqual(approveRes.body.data.statusHistory.new_status, "APPROVED", "History new_status must be APPROVED");
    assert.strictEqual(approveRes.body.data.statusHistory.previous_status, "PENDING", "History previous_status must be PENDING");
    console.log("  ✔ Status updated to APPROVED");
    console.log("  ✔ Status history record linked successfully\n");

    // -------------------------------------------------------------
    // TEST 2: Successful Rejection
    // -------------------------------------------------------------
    console.log("▶ TEST 2: Successful Outpass Rejection with Mandatory Reason");
    const rejectionReasonText = "Curfew restriction: General night permissions suspended during mid-term exam week.";
    const rejectRes = await makeRequest(
      "POST",
      "/api/outpasses/OP-2026-002/reject",
      {
        "x-user-id": "WARDEN-001",
        "x-user-role": "WARDEN"
      },
      {
        rejectionReason: rejectionReasonText,
        remarks: "Please apply for regular day pass instead."
      }
    );

    assert.strictEqual(rejectRes.status, 200, "Should return HTTP 200 OK");
    assert.strictEqual(rejectRes.body.success, true, "Body success should be true");
    assert.strictEqual(rejectRes.body.data.outpass.status, "REJECTED", "Status must be updated to REJECTED");
    assert.strictEqual(rejectRes.body.data.outpass.rejection_reason, rejectionReasonText, "Rejection reason must be stored");
    assert.strictEqual(rejectRes.body.data.statusHistory.new_status, "REJECTED", "History new_status must be REJECTED");
    assert.strictEqual(rejectRes.body.data.statusHistory.rejection_reason, rejectionReasonText, "History must record rejection reason");
    console.log("  ✔ Status updated to REJECTED");
    console.log("  ✔ Rejection reason stored in request and status history\n");

    // -------------------------------------------------------------
    // TEST 3: Invalid Outpass ID
    // -------------------------------------------------------------
    console.log("▶ TEST 3: Invalid / Non-Existent Outpass ID");
    const notFoundRes = await makeRequest(
      "POST",
      "/api/outpasses/OP-9999-NOTFOUND/approve",
      {
        "x-user-id": "WARDEN-001",
        "x-user-role": "WARDEN"
      },
      { remarks: "Testing not found" }
    );

    assert.strictEqual(notFoundRes.status, 404, "Should return HTTP 404 Not Found");
    assert.strictEqual(notFoundRes.body.success, false, "Success should be false");
    assert(notFoundRes.body.error.includes("not found"), "Error message should mention outpass not found");
    console.log("  ✔ Correctly returned 404 Not Found with descriptive error\n");

    // -------------------------------------------------------------
    // TEST 4: Unauthorized Access Control (Non-Warden)
    // -------------------------------------------------------------
    console.log("▶ TEST 4: Unauthorized / Non-Warden Access Control");
    
    // 4a: Student role attempting to approve
    const studentRes = await makeRequest(
      "POST",
      "/api/outpasses/OP-2026-003/approve",
      {
        "x-user-id": "23IT101",
        "x-user-role": "STUDENT" // Student attempting warden action!
      },
      { remarks: "Trying to self-approve" }
    );

    assert.strictEqual(studentRes.status, 403, "Should return HTTP 403 Forbidden for STUDENT role");
    assert.strictEqual(studentRes.body.success, false);
    assert(studentRes.body.error.includes("not authorized"), "Error should explain unauthorized role");
    console.log("  ✔ Blocked student attempt with 403 Forbidden");

    // 4b: Missing authentication headers
    const unauthRes = await makeRequest(
      "POST",
      "/api/outpasses/OP-2026-003/approve",
      {},
      { remarks: "No credentials" }
    );

    assert.strictEqual(unauthRes.status, 401, "Should return HTTP 401 Unauthorized when unauthenticated");
    console.log("  ✔ Blocked unauthenticated attempt with 401 Unauthorized\n");

    // -------------------------------------------------------------
    // TEST 5: Invalid Status Transition & Validation Rules
    // -------------------------------------------------------------
    console.log("▶ TEST 5: Invalid Status Transitions & Validation Rules");

    // 5a: Attempting to approve an already approved outpass
    const reApproveRes = await makeRequest(
      "POST",
      "/api/outpasses/OP-2026-001/approve", // Already approved in Test 1
      {
        "x-user-id": "WARDEN-001",
        "x-user-role": "WARDEN"
      },
      { remarks: "Trying to approve again" }
    );

    assert.strictEqual(reApproveRes.status, 400, "Should return HTTP 400 Bad Request for invalid transition");
    assert(reApproveRes.body.error.includes("already APPROVED"), "Error must state outpass is already APPROVED");
    console.log("  ✔ Prevented re-approving an already approved request (400 Bad Request)");

    // 5b: Attempting to reject without providing mandatory rejection reason
    const rejectNoReasonRes = await makeRequest(
      "POST",
      "/api/outpasses/OP-2026-003/reject",
      {
        "x-user-id": "WARDEN-001",
        "x-user-role": "WARDEN"
      },
      { rejectionReason: "" } // Empty reason
    );

    assert.strictEqual(rejectNoReasonRes.status, 400, "Should return HTTP 400 when rejection reason is missing");
    assert(rejectNoReasonRes.body.error.includes("rejection reason is mandatory"), "Error must enforce mandatory rejection reason");
    console.log("  ✔ Enforced mandatory rejection reason requirement\n");

    // -------------------------------------------------------------
    // TEST 6: Status-History Record Creation & Chronological Retrieval
    // -------------------------------------------------------------
    console.log("▶ TEST 6: Status-History Record Creation & Chronological Retrieval");
    const historyRes = await makeRequest(
      "GET",
      "/api/outpasses/OP-2026-001/history"
    );

    assert.strictEqual(historyRes.status, 200, "Should return HTTP 200 OK");
    assert.strictEqual(historyRes.body.success, true);
    const historyList = historyRes.body.data.history;
    assert(Array.isArray(historyList), "History must be an array");
    assert(historyList.length >= 1, "Must contain at least 1 history record");

    const record = historyList.find(h => h.new_status === "APPROVED") || historyList[historyList.length - 1];
    assert.strictEqual(record.outpass_id, "OP-2026-001", "Must match outpass_id");
    assert.strictEqual(record.previous_status, "PENDING", "Must record previous_status");
    assert.strictEqual(record.new_status, "APPROVED", "Must record new_status");
    assert(["WARDEN-001", "WARDEN-MAR"].includes(record.changed_by), "Must record changed_by");
    assert.strictEqual(record.changed_by_role, "WARDEN", "Must record changed_by_role");
    assert(record.changed_at, "Must have valid changed_at timestamp");
    assert(record.remarks.includes("weekend leave"), "Must preserve warden remarks");

    // Verify chronological ordering if multiple entries exist
    for (let i = 0; i < historyList.length - 1; i++) {
      const t1 = new Date(historyList[i].changed_at).getTime();
      const t2 = new Date(historyList[i + 1].changed_at).getTime();
      assert(t1 <= t2, "History records must be strictly ordered chronologically (ASC)");
    }
    console.log("  ✔ Verified complete status history fields (outpass_id, previous_status, new_status, changed_by, timestamp, remarks)");
    console.log("  ✔ Verified strict chronological ordering (oldest to newest)\n");

    console.log(`=============================================================`);
    console.log(`  >>> ALL 6 REQUIRED TEST CASES PASSED SUCCESSFULLY! <<<    `);
    console.log(`=============================================================\n`);
  } catch (err) {
    console.error("Test Suite Failure:", err);
    process.exitCode = 1;
  } finally {
    try {
      await outpassRepository.resetDatabaseForTests();
    } catch (cleanErr) {}
    server.close(() => {
      process.exit(process.exitCode || 0);
    });
    setTimeout(() => process.exit(process.exitCode || 0), 1000);
  }
});
