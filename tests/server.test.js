// Integration test suite for Express Server and REST APIs
const assert = require("assert");
const http = require("http");
const app = require("../src/server");

const TEST_PORT = 3004;
const server = app.listen(TEST_PORT, async () => {
  console.log(`Test server running on port ${TEST_PORT}`);

  function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "localhost",
        port: TEST_PORT,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", chunk => { data += chunk; });
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
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

  try {
    const outpassRepository = require("../src/repositories/outpassRepository");
    await outpassRepository.resetDatabaseForTests();
    console.log("=== Running API Integration Tests ===");

    // 1. Test Static Index serving
    const indexRes = await request("GET", "/");
    assert.strictEqual(indexRes.status, 200);
    assert(typeof indexRes.body === "string" && indexRes.body.includes("Warden Pending-Requests Review"), "Should serve index.html with review screen");
    console.log("✔ GET / (static index.html) passed");

    // 2. Test GET /api/stats
    const statsRes = await request("GET", "/api/stats");
    assert.strictEqual(statsRes.status, 200);
    assert.strictEqual(statsRes.body.success, true);
    assert(typeof statsRes.body.data.pendingCount === "number");
    console.log("✔ GET /api/stats passed");

    // 3. Test GET /api/outpasses/pending
    const pendingRes = await request("GET", "/api/outpasses/pending");
    assert.strictEqual(pendingRes.status, 200);
    assert.strictEqual(pendingRes.body.success, true);
    assert(Array.isArray(pendingRes.body.data));
    console.log("✔ GET /api/outpasses/pending passed. Found:", pendingRes.body.count);

    // 4. Test POST /api/outpasses (Student submit simulator)
    const newOutpass = {
      studentId: "23IT777",
      studentName: "Manoj Kumar",
      department: "Information Technology",
      year: "3rd Year",
      hostelBlock: "Block A (Boys)",
      roomNumber: "A-304",
      studentPhone: "+91 91234 56789",
      parentName: "Velusamy (Father)",
      parentPhone: "+91 94444 33333",
      parentConsent: "PENDING_CALL",
      outpassType: "DAY_PASS",
      destination: "PSG Hospital Coimbatore",
      reason: "Emergency blood test and consultation.",
      departureTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      expectedReturnTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString()
    };

    const postRes = await request("POST", "/api/outpasses", newOutpass);
    assert.strictEqual(postRes.status, 201);
    assert.strictEqual(postRes.body.success, true);
    const createdId = postRes.body.data.id;
    console.log("✔ POST /api/outpasses passed. Created ID:", createdId);

    // 5. Test PATCH /api/outpasses/:id/status (Warden review decision)
    const approveRes = await request("PATCH", `/api/outpasses/${createdId}/status`, {
      status: "APPROVED",
      wardenRemarks: "Approved for medical reasons. Keep warden informed on return.",
      reviewedBy: "Chief Warden Dr. R. Sundaram"
    }, {
      "x-user-id": "WARDEN-001",
      "x-user-role": "WARDEN",
      "x-user-name": "Dr. R. Sundaram"
    });
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.body.success, true);
    const updatedOutpass = approveRes.body.data.outpass || approveRes.body.data;
    assert.strictEqual(updatedOutpass.status, "APPROVED");
    console.log("✔ PATCH /api/outpasses/:id/status (APPROVED) passed.");

    // 6. Test GET /api/outpasses/:id
    const getSingleRes = await request("GET", `/api/outpasses/${createdId}`);
    assert.strictEqual(getSingleRes.status, 200);
    assert.strictEqual(getSingleRes.body.data.id, createdId);
    console.log("✔ GET /api/outpasses/:id passed");

    console.log("\n>>> ALL SERVER INTEGRATION TESTS PASSED! <<<");
  } catch (err) {
    console.error("Test failed:", err);
    process.exitCode = 1;
  } finally {
    server.close(() => process.exit(process.exitCode || 0));
    setTimeout(() => process.exit(process.exitCode || 0), 1000);
  }
});
