/**
 * Comprehensive Automated Test Suite (28 Tests)
 * 
 * Category A: Portal-Level Role Segregation (Tests 1 - 10)
 * Category B: Outpass Request Validations (Tests 11 - 17)
 * Category C: Warden Approval & Code Generation (Tests 18 - 21)
 * Category D: 2-Phase Gate Verification Workflow (Tests 22 - 28)
 */

const assert = require("assert");
const http = require("http");
const app = require("../src/server");
const outpassRepository = require("../src/repositories/outpassRepository");
const statusHistoryRepository = require("../src/repositories/statusHistoryRepository");

const TEST_PORT = 3005;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers
    };
    if (dataString) {
      reqHeaders["Content-Length"] = Buffer.byteLength(dataString);
    }

    const options = {
      hostname: "127.0.0.1",
      port: TEST_PORT,
      path,
      method,
      headers: reqHeaders
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
    if (dataString) req.write(dataString);
    req.end();
  });
}

const server = app.listen(TEST_PORT, async () => {
  console.log(`\n======================================================================`);
  console.log(`  COMPREHENSIVE 28-TEST AUTOMATION SUITE: HOSTEL E-OUTPASS SYSTEM     `);
  console.log(`======================================================================\n`);

  let passedCount = 0;
  let failedCount = 0;

  async function runTest(testNum, name, testFn) {
    try {
      process.stdout.write(`▶ TEST ${testNum.toString().padStart(2, "0")}: ${name}... `);
      await testFn();
      console.log(`✔ PASS`);
      passedCount++;
    } catch (err) {
      console.log(`❌ FAIL`);
      console.error(`   Error: ${err.message}`);
      failedCount++;
      throw err;
    }
  }

  try {
    // Reset DB and stores to pristine initial state
    await outpassRepository.resetDatabaseForTests();
    statusHistoryRepository._clearMemoryStore();

    // =========================================================================
    // CATEGORY A: PORTAL-LEVEL ROLE SEGREGATION (Tests 1 - 10)
    // =========================================================================
    console.log(`\n--- CATEGORY A: PORTAL-LEVEL ROLE SEGREGATION (Tests 1-10) ---`);

    // Test 1: Valid student credentials on Student Portal (200 OK)
    await runTest(1, "Valid student credentials on Student Portal (/student-login.html)", async () => {
      const res = await makeRequest("POST", "/api/auth/login", {
        portalRole: "student",
        identifier: "23IT101",
        password: "student123"
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.role, "STUDENT");
      assert(res.body.redirectUrl.includes("student") || res.body.redirectUrl.includes("index"));
    });

    // Test 2: Valid student credentials on Warden Portal (403 Forbidden)
    await runTest(2, "Valid student credentials on Warden Portal (403 Role Segregation)", async () => {
      const res = await makeRequest("POST", "/api/auth/login", {
        portalRole: "warden",
        identifier: "23IT101",
        password: "student123"
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert(
        res.body.error.startsWith("Access Denied: You are not authorized to log in through the Warden portal. Please use your designated login page.")
      );
    });

    // Test 3: Valid student credentials on Security Portal (403 Forbidden)
    await runTest(3, "Valid student credentials on Security Portal (403 Role Segregation)", async () => {
      const res = await makeRequest("POST", "/api/auth/login", {
        portalRole: "security",
        identifier: "23IT101",
        password: "student123"
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert(
        res.body.error.startsWith("Access Denied: You are not authorized to log in through the Security portal. Please use your designated login page.")
      );
    });

    // Test 4: Valid warden credentials on Warden Portal (200 OK)
    await runTest(4, "Valid warden credentials on Warden Portal (/warden-login.html)", async () => {
      const res = await makeRequest("POST", "/api/auth/login", {
        portalRole: "warden",
        identifier: "sundaram@hostel.college.edu",
        password: "warden123"
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.role, "WARDEN");
      assert.strictEqual(res.body.user.name, "Dr. R. Sundaram");
    });

    // Test 5: Valid warden credentials on Student Portal (403 Forbidden)
    await runTest(5, "Valid warden credentials on Student Portal (403 Role Segregation)", async () => {
      const res = await makeRequest("POST", "/api/auth/login", {
        portalRole: "student",
        identifier: "sundaram@hostel.college.edu",
        password: "warden123"
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert(
        res.body.error.startsWith("Access Denied: You are not authorized to log in through the Student portal. Please use your designated login page.")
      );
    });

    // Test 6: Valid warden credentials on Security Portal (403 Forbidden)
    await runTest(6, "Valid warden credentials on Security Portal (403 Role Segregation)", async () => {
      const res = await makeRequest("POST", "/api/auth/login", {
        portalRole: "security",
        identifier: "sundaram@hostel.college.edu",
        password: "warden123"
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert(
        res.body.error.startsWith("Access Denied: You are not authorized to log in through the Security portal. Please use your designated login page.")
      );
    });

    // Test 7: Valid security credentials on Security Portal (200 OK)
    await runTest(7, "Valid security credentials on Security Gate Portal (/security-login.html)", async () => {
      const res = await makeRequest("POST", "/api/auth/login", {
        portalRole: "security",
        identifier: "security.gate@college.edu",
        password: "gate123"
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.role, "SECURITY");
      assert.strictEqual(res.body.redirectUrl, "/security-gate.html");
    });

    // Test 8: Valid security credentials on Student Portal (403 Forbidden)
    await runTest(8, "Valid security credentials on Student Portal (403 Role Segregation)", async () => {
      const res = await makeRequest("POST", "/api/auth/login", {
        portalRole: "student",
        identifier: "security.gate@college.edu",
        password: "gate123"
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert(
        res.body.error.startsWith("Access Denied: You are not authorized to log in through the Student portal. Please use your designated login page.")
      );
    });

    // Test 9: Valid security credentials on Warden Portal (403 Forbidden)
    await runTest(9, "Valid security credentials on Warden Portal (403 Role Segregation)", async () => {
      const res = await makeRequest("POST", "/api/auth/login", {
        portalRole: "warden",
        identifier: "security.gate@college.edu",
        password: "gate123"
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert(
        res.body.error.startsWith("Access Denied: You are not authorized to log in through the Warden portal. Please use your designated login page.")
      );
    });

    // Test 10: Invalid credentials (wrong password / nonexistent user)
    await runTest(10, "Invalid credentials reject with 401/404 (Never 200 or 403)", async () => {
      // 10a. Wrong password
      const wrongPassRes = await makeRequest("POST", "/api/auth/login", {
        portalRole: "student",
        identifier: "23IT101",
        password: "definitelywrongpassword"
      });
      assert.strictEqual(wrongPassRes.status, 401);
      assert.strictEqual(wrongPassRes.body.success, false);

      // 10b. Nonexistent user
      const nonExistentRes = await makeRequest("POST", "/api/auth/login", {
        portalRole: "warden",
        identifier: "ghost.warden@college.edu",
        password: "password123"
      });
      assert.strictEqual(nonExistentRes.status, 404);
      assert.strictEqual(nonExistentRes.body.success, false);
    });

    // =========================================================================
    // CATEGORY B: OUTPASS REQUEST VALIDATIONS (Tests 11 - 17)
    // =========================================================================
    console.log(`\n--- CATEGORY B: OUTPASS REQUEST VALIDATIONS (Tests 11-17) ---`);

    const now = new Date();
    const futureDepDate = new Date(now.getTime() + 2 * 3600 * 1000); // +2 hours
    const futureRetDate = new Date(now.getTime() + 26 * 3600 * 1000); // +26 hours

    // Test 11: Missing required field (e.g. reason missing) -> 400
    await runTest(11, "Missing required field (reason) rejects with HTTP 400", async () => {
      const res = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT901",
        studentName: "Test Student",
        destination: "City Center",
        outpassType: "DAY_PASS",
        departureTime: futureDepDate.toISOString(),
        expectedReturnTime: futureRetDate.toISOString(),
        parentPhone: "9876543210"
        // missing reason
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("reason"));
    });

    // Test 12: Malformed phone number (< 10 digits) -> 400
    await runTest(12, "Malformed / incomplete parent phone number (< 10 digits) rejects with HTTP 400", async () => {
      const res = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT902",
        studentName: "Test Student",
        destination: "City Center",
        outpassType: "DAY_PASS",
        reason: "Visiting family",
        departureTime: futureDepDate.toISOString(),
        expectedReturnTime: futureRetDate.toISOString(),
        parentPhone: "12345" // invalid phone
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("phone"));
    });

    // Test 13: Departure date in the past -> 400
    await runTest(13, "Departure date in the past rejects with HTTP 400", async () => {
      const pastDep = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
      const res = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT903",
        studentName: "Test Student",
        destination: "Hometown",
        outpassType: "DAY_PASS",
        reason: "Visiting hometown",
        departureTime: pastDep,
        expectedReturnTime: futureRetDate.toISOString(),
        parentPhone: "9876543210"
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("past") || res.body.error.toLowerCase().includes("departure"));
    });

    // Test 14: Return date earlier than departure date -> 400
    await runTest(14, "Return date earlier than departure date rejects with HTTP 400", async () => {
      const depTime = new Date(now.getTime() + 48 * 3600 * 1000).toISOString();
      const earlierRetTime = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
      const res = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT904",
        studentName: "Test Student",
        destination: "Event Venue",
        outpassType: "DAY_PASS",
        reason: "Attending event",
        departureTime: depTime,
        expectedReturnTime: earlierRetTime,
        parentPhone: "9876543210"
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("return") || res.body.error.toLowerCase().includes("departure"));
    });

    // Test 15: Return date equal to departure date (same minute) -> 400
    await runTest(15, "Return date equal to departure date (0 min duration) rejects with HTTP 400", async () => {
      const sameTime = new Date(now.getTime() + 10 * 3600 * 1000).toISOString();
      const res = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT905",
        studentName: "Test Student",
        destination: "Local Store",
        outpassType: "DAY_PASS",
        reason: "Quick errand",
        departureTime: sameTime,
        expectedReturnTime: sameTime,
        parentPhone: "9876543210"
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("return") || res.body.error.toLowerCase().includes("later"));
    });

    // Test 16: Outpass duration exceeding max policy (> 14 days) -> 400
    await runTest(16, "Outpass duration exceeding max policy (> 14 days) rejects with HTTP 400", async () => {
      const excessiveRetTime = new Date(futureDepDate.getTime() + 18 * 24 * 3600 * 1000).toISOString(); // 18 days
      const res = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT906",
        studentName: "Test Student",
        destination: "Tour",
        outpassType: "VACATION_PASS",
        reason: "Semester vacation trip",
        departureTime: futureDepDate.toISOString(),
        expectedReturnTime: excessiveRetTime,
        parentPhone: "9876543210"
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("14 days") || res.body.error.toLowerCase().includes("duration"));
    });

    // Test 17: Concurrent active outpass for same student -> 409 Conflict
    await runTest(17, "Concurrent active outpass for same student returns HTTP 409 Conflict", async () => {
      // 17a: Initial pass submission (succeeds)
      const res1 = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT888",
        studentName: "Active Student",
        destination: "Native Home",
        outpassType: "WEEKEND_PASS",
        reason: "First valid outpass",
        departureTime: futureDepDate.toISOString(),
        expectedReturnTime: futureRetDate.toISOString(),
        parentPhone: "9876543210"
      });
      assert.strictEqual(res1.status, 201);
      assert.strictEqual(res1.body.success, true);

      // 17b: Second pass submission for same student while first is still PENDING (fails with 409)
      const res2 = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT888",
        studentName: "Active Student",
        destination: "Native Home",
        outpassType: "DAY_PASS",
        reason: "Second overlapping outpass attempt",
        departureTime: futureDepDate.toISOString(),
        expectedReturnTime: futureRetDate.toISOString(),
        parentPhone: "9876543210"
      });
      assert.strictEqual(res2.status, 409);
      assert.strictEqual(res2.body.success, false);
      assert(res2.body.error.toLowerCase().includes("active outpass"));
    });

    // =========================================================================
    // CATEGORY C: WARDEN APPROVAL & CODE GENERATION (Tests 18 - 21)
    // =========================================================================
    console.log(`\n--- CATEGORY C: WARDEN APPROVAL & CODE GENERATION (Tests 18-21) ---`);

    // Create a fresh outpass to be approved
    const createRes = await makeRequest("POST", "/api/outpasses", {
      studentId: "23IT701",
      studentName: "Keertheswar S",
      hostelBlock: "Block A (Boys)",
      roomNumber: "A-304",
      outpassType: "WEEKEND_PASS",
      destination: "Trichy",
      reason: "Family function",
      departureTime: futureDepDate.toISOString(),
      expectedReturnTime: futureRetDate.toISOString(),
      parentPhone: "+91 94432 10987"
    });
    assert.strictEqual(createRes.status, 201);
    const targetOutpassId = createRes.body.data.id;

    let targetOutboundCode = null;
    let targetInboundCode = null;

    // Test 18: Warden approves valid pending outpass -> 200, status APPROVED
    await runTest(18, "Warden approves valid pending outpass (HTTP 200, status APPROVED)", async () => {
      const res = await makeRequest(
        "POST",
        `/api/outpasses/${targetOutpassId}/approve`,
        { remarks: "Approved for weekend visit. Travel safely." },
        { "x-user-id": "WARDEN-001", "x-user-role": "WARDEN", "x-user-name": "Dr. R. Sundaram" }
      );
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.outpass.status, "APPROVED");

      targetOutboundCode = res.body.data.outpass.outbound_code || res.body.data.outpass.outboundCode;
      targetInboundCode = res.body.data.outpass.inbound_code || res.body.data.outpass.inboundCode;
    });

    // Test 19: Approved outpass contains outbound_code (6-10 chars alphanumeric e.g. OUT-XXXX)
    await runTest(19, "Approved outpass generates outbound_code (6-10 alphanumeric chars e.g. OUT-XXXX)", async () => {
      assert(targetOutboundCode, "outbound_code must be generated and returned");
      assert(/^OUT-[A-Z0-9]{4,6}$/.test(targetOutboundCode), `outbound_code ${targetOutboundCode} must match /^OUT-[A-Z0-9]{4,6}$/`);
      assert(targetOutboundCode.length >= 6 && targetOutboundCode.length <= 10, "outbound_code must be between 6 and 10 characters");
    });

    // Test 20: Approved outpass contains inbound_code (6-10 chars alphanumeric e.g. IN-XXXX)
    await runTest(20, "Approved outpass generates inbound_code (6-10 alphanumeric chars e.g. IN-XXXX)", async () => {
      assert(targetInboundCode, "inbound_code must be generated and returned");
      assert(/^IN-[A-Z0-9]{4,6}$/.test(targetInboundCode), `inbound_code ${targetInboundCode} must match /^IN-[A-Z0-9]{4,6}$/`);
      assert(targetInboundCode.length >= 6 && targetInboundCode.length <= 10, "inbound_code must be between 6 and 10 characters");
    });

    // Test 21: Outbound code and inbound code are distinct and non-null
    await runTest(21, "Outbound code and Inbound code are distinct, non-null, and cryptographically separated", async () => {
      assert(targetOutboundCode != null, "outbound_code cannot be null");
      assert(targetInboundCode != null, "inbound_code cannot be null");
      assert.notStrictEqual(targetOutboundCode, targetInboundCode, "outbound_code and inbound_code must be distinct");
      assert(targetOutboundCode.startsWith("OUT-"), "Departure code must have OUT- prefix");
      assert(targetInboundCode.startsWith("IN-"), "Return code must have IN- prefix");
    });

    // =========================================================================
    // CATEGORY D: 2-PHASE GATE VERIFICATION WORKFLOW (Tests 22 - 28)
    // =========================================================================
    console.log(`\n--- CATEGORY D: 2-PHASE GATE VERIFICATION WORKFLOW (Tests 22-28) ---`);

    // Test 22: Valid departure verification via outbound_code -> 200, status CHECKED-OUT
    await runTest(22, "Valid departure verification via outbound_code (HTTP 200, status CHECKED-OUT)", async () => {
      const res = await makeRequest("POST", "/api/verify/departure", {
        code: targetOutboundCode,
        securityId: "SEC-001",
        securityName: "Officer K. Raman"
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.status, "CHECKED-OUT");
      const depTime = res.body.data.departure_verified_at || res.body.data.departureVerifiedAt;
      assert(depTime, "Must record departure verification timestamp");
    });

    // Test 23: Departure verification using inbound_code -> 400, rejected
    await runTest(23, "Departure verification using inbound_code rejects with HTTP 400", async () => {
      // Create and approve a secondary pass
      const secPass = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT702",
        studentName: "Priya Dharshini",
        destination: "Library",
        outpassType: "DAY_PASS",
        reason: "Library visit",
        departureTime: futureDepDate.toISOString(),
        expectedReturnTime: futureRetDate.toISOString(),
        parentPhone: "9876543210"
      });
      const secApproved = await makeRequest(
        "POST",
        `/api/outpasses/${secPass.body.data.id}/approve`,
        { remarks: "Approved" },
        { "x-user-id": "WARDEN-001", "x-user-role": "WARDEN" }
      );
      const secInboundCode = secApproved.body.data.outpass.inbound_code || secApproved.body.data.outpass.inboundCode;

      // Attempt departure with inbound code
      const res = await makeRequest("POST", "/api/verify/departure", {
        code: secInboundCode
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("return") || res.body.error.toLowerCase().includes("inbound"));
    });

    // Test 24: Duplicate departure verification on already checked-out pass -> 400, rejected
    await runTest(24, "Duplicate departure verification on already checked-out pass rejects with HTTP 400", async () => {
      const res = await makeRequest("POST", "/api/verify/departure", {
        code: targetOutboundCode
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("already checked out"));
    });

    // Test 25: Valid return verification via inbound_code -> 200, status COMPLETED
    await runTest(25, "Valid return verification via inbound_code (HTTP 200, status COMPLETED)", async () => {
      const res = await makeRequest("POST", "/api/verify/return", {
        code: targetInboundCode,
        securityId: "SEC-001",
        securityName: "Officer K. Raman"
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.status, "COMPLETED");
      const retTime = res.body.data.return_verified_at || res.body.data.returnVerifiedAt;
      assert(retTime, "Must record return verification timestamp");
    });

    // Test 26: Return verification using outbound_code -> 400, rejected
    await runTest(26, "Return verification using outbound_code rejects with HTTP 400", async () => {
      // Create and check out a third pass
      const pass3 = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT703",
        studentName: "Mohammed Faizal",
        destination: "Health Clinic",
        outpassType: "DAY_PASS",
        reason: "Medical checkup",
        departureTime: futureDepDate.toISOString(),
        expectedReturnTime: futureRetDate.toISOString(),
        parentPhone: "9876543210"
      });
      const approved3 = await makeRequest(
        "POST",
        `/api/outpasses/${pass3.body.data.id}/approve`,
        { remarks: "Approved" },
        { "x-user-id": "WARDEN-001", "x-user-role": "WARDEN" }
      );
      const out3 = approved3.body.data.outpass.outbound_code || approved3.body.data.outpass.outboundCode;

      // Check out first
      await makeRequest("POST", "/api/verify/departure", { code: out3 });

      // Now attempt return using outbound code
      const res = await makeRequest("POST", "/api/verify/return", {
        code: out3
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("departure") || res.body.error.toLowerCase().includes("outbound"));
    });

    // Test 27: Return verification attempted on pass that is not checked-out -> 400, rejected
    await runTest(27, "Return verification attempted on pass that is not checked out rejects with HTTP 400", async () => {
      // Create and approve a pass, but DO NOT check out
      const pass4 = await makeRequest("POST", "/api/outpasses", {
        studentId: "23IT704",
        studentName: "Ananya Ramesh",
        destination: "Hometown Bangalore",
        outpassType: "WEEKEND_PASS",
        reason: "Hometown visit",
        departureTime: futureDepDate.toISOString(),
        expectedReturnTime: futureRetDate.toISOString(),
        parentPhone: "9876543210"
      });
      const approved4 = await makeRequest(
        "POST",
        `/api/outpasses/${pass4.body.data.id}/approve`,
        { remarks: "Approved" },
        { "x-user-id": "WARDEN-001", "x-user-role": "WARDEN" }
      );
      const in4 = approved4.body.data.outpass.inbound_code || approved4.body.data.outpass.inboundCode;

      // Attempt to return before departing
      const res = await makeRequest("POST", "/api/verify/return", {
        code: in4
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(res.body.error.toLowerCase().includes("not checked out"));
    });

    // Test 28: Verification with nonexistent / invalid code -> 404 Not Found
    await runTest(28, "Verification with nonexistent / invalid code returns HTTP 404 Not Found", async () => {
      // 28a: POST /api/verify/departure with fake code
      const depRes = await makeRequest("POST", "/api/verify/departure", {
        code: "OUT-GHOST999"
      });
      assert.strictEqual(depRes.status, 404);
      assert.strictEqual(depRes.body.success, false);

      // 28b: POST /api/verify/return with fake code
      const retRes = await makeRequest("POST", "/api/verify/return", {
        code: "IN-GHOST999"
      });
      assert.strictEqual(retRes.status, 404);
      assert.strictEqual(retRes.body.success, false);

      // 28c: GET /api/verify/code/:code with fake code
      const lookupRes = await makeRequest("GET", "/api/verify/code/FAKE-CODE-123");
      assert.strictEqual(lookupRes.status, 404);
      assert.strictEqual(lookupRes.body.success, false);
    });

    console.log(`\n======================================================================`);
    console.log(`  🎉 ALL 28 AUTOMATED TESTS PASSED SUCCESSFULLY! (28/28)              `);
    console.log(`======================================================================\n`);
  } catch (err) {
    console.error(`\nTest suite stopped due to error.`);
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
