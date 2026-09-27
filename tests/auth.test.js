// Automated Test Suite for Student & Warden Authentication
const assert = require("assert");
const http = require("http");
const app = require("../src/server");

const TEST_PORT = 3003;

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(body);
    const options = {
      hostname: "127.0.0.1",
      port: TEST_PORT,
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(dataString)
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on("error", reject);
    req.write(dataString);
    req.end();
  });
}

const server = app.listen(TEST_PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`  RUNNING AUTHENTICATION TESTS (STUDENT & WARDEN)      `);
  console.log(`======================================================\n`);

  try {
    // 1. Valid Warden Login
    console.log("▶ TEST 1: Valid Warden Login");
    const wardenLogin = await postJson("/api/auth/login", {
      identifier: "WARDEN-001",
      password: "warden123",
      role: "WARDEN"
    });
    assert.strictEqual(wardenLogin.status, 200);
    assert.strictEqual(wardenLogin.body.success, true);
    assert.strictEqual(wardenLogin.body.user.role, "WARDEN");
    assert.strictEqual(wardenLogin.body.user.name, "Dr. R. Sundaram");
    console.log("  ✔ Warden logged in successfully\n");

    // 2. Valid Student Login
    console.log("▶ TEST 2: Valid Student Login");
    const studentLogin = await postJson("/api/auth/login", {
      identifier: "23IT101",
      password: "student123",
      role: "STUDENT"
    });
    assert.strictEqual(studentLogin.status, 200);
    assert.strictEqual(studentLogin.body.success, true);
    assert.strictEqual(studentLogin.body.user.role, "STUDENT");
    assert.strictEqual(studentLogin.body.user.name, "Keertheswar S");
    console.log("  ✔ Student logged in successfully\n");

    // 3. Unregistered User Login Rejection
    console.log("▶ TEST 3: Unregistered User Rejection");
    const unregistered = await postJson("/api/auth/login", {
      identifier: "RANDOM_USER_999",
      password: "password123",
      role: "STUDENT"
    });
    assert.strictEqual(unregistered.status, 404);
    assert.strictEqual(unregistered.body.success, false);
    assert(unregistered.body.message.includes("not found in database") || (unregistered.body.error && unregistered.body.error.includes("not found")));
    console.log("  ✔ Unregistered user blocked with 404 Not Found\n");

    // 4. Incorrect Password Rejection
    console.log("▶ TEST 4: Incorrect Password Rejection");
    const wrongPass = await postJson("/api/auth/login", {
      identifier: "23IT101",
      password: "wrongpassword!",
      role: "STUDENT"
    });
    assert.strictEqual(wrongPass.status, 401);
    assert.strictEqual(wrongPass.body.success, false);
    assert(wrongPass.body.error.toLowerCase().includes("incorrect") || wrongPass.body.error.includes("Authentication failed"));
    console.log("  ✔ Incorrect password rejected with 401 Unauthorized\n");

    // 5. Role Mismatch Rejection
    console.log("▶ TEST 5: Role Mismatch Rejection (Student trying to login as Warden)");
    const roleMismatch = await postJson("/api/auth/login", {
      identifier: "23IT101", // Student ID
      password: "student123",
      role: "WARDEN" // Attempting warden login!
    });
    assert.strictEqual(roleMismatch.status, 403);
    assert.strictEqual(roleMismatch.body.success, false);
    assert(roleMismatch.body.error.includes("registered as a STUDENT"));
    console.log("  ✔ Role mismatch blocked with 403 Forbidden\n");

    // 6. Valid Boys Block C Student Login
    console.log("▶ TEST 6: Valid Boys Block C Student Login (Mohammed Faizal)");
    const boyBlockCLogin = await postJson("/api/auth/login", {
      identifier: "23ME034",
      password: "student123",
      role: "STUDENT"
    });
    assert.strictEqual(boyBlockCLogin.status, 200);
    assert.strictEqual(boyBlockCLogin.body.success, true);
    assert.strictEqual(boyBlockCLogin.body.user.name, "Mohammed Faizal");
    assert(boyBlockCLogin.body.user.hostel_block.includes("Kurunji") || boyBlockCLogin.body.user.hostel_block.includes("Block C"));
    console.log("  ✔ Boys Block C student logged in successfully\n");

    // 7. Valid Girls Block D Student Login
    console.log("▶ TEST 7: Valid Girls Block D Student Login (Ananya Ramesh)");
    const girlBlockDLogin = await postJson("/api/auth/login", {
      identifier: "23BT028",
      password: "student123",
      role: "STUDENT"
    });
    assert.strictEqual(girlBlockDLogin.status, 200);
    assert.strictEqual(girlBlockDLogin.body.success, true);
    assert.strictEqual(girlBlockDLogin.body.user.name, "Ananya Ramesh");
    assert(girlBlockDLogin.body.user.hostel_block.includes("Ponni") || girlBlockDLogin.body.user.hostel_block.includes("Block D"));
    console.log("  ✔ Girls Block D student logged in successfully\n");

    // 8. Valid Girls Warden Login
    console.log("▶ TEST 8: Valid Girls Warden Login (Dr. S. Meenakshi)");
    const wardenGirlsLogin = await postJson("/api/auth/login", {
      identifier: "WARDEN-002",
      password: "warden123",
      role: "WARDEN"
    });
    assert.strictEqual(wardenGirlsLogin.status, 200);
    assert.strictEqual(wardenGirlsLogin.body.success, true);
    assert.strictEqual(wardenGirlsLogin.body.user.name, "Dr. S. Meenakshi");
    assert.strictEqual(wardenGirlsLogin.body.user.role, "WARDEN");
    console.log("  ✔ Girls Warden logged in successfully\n");

    console.log(`======================================================`);
    console.log(`  >>> ALL 8 AUTHENTICATION TESTS PASSED! <<<          `);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error("Auth Test Failed:", err);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      process.exit(process.exitCode || 0);
    });
    setTimeout(() => process.exit(process.exitCode || 0), 1000);
  }
});
