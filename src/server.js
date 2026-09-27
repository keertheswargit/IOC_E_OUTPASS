// E-Outpass Management System - Express Backend Server
// Provides REST APIs for Warden Dashboard and Outpass Data Store

const express = require("express");
const path = require("path");
const { outpassStore } = require("./db/outpassStore");
const outpassRepository = require("./repositories/outpassRepository");
const userRepository = require("./repositories/userRepository");
const { testConnection } = require("./config/db");
const approvalRoutes = require("./routes/approvalRoutes");
const authRoutes = require("./routes/authRoutes");
const verificationRoutes = require("./routes/verificationRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Dedicated Portal Navigation Routes
app.get(["/student-login.html", "/login/student"], (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "student-login.html"));
});

app.get(["/warden-login.html", "/login/warden"], (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "warden-login.html"));
});

app.get(["/security-login.html", "/login/security"], (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "security-login.html"));
});

app.get(["/security-gate", "/security-gate.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "security-gate.html"));
});

// Mount Authentication, Verification & Review Routes
app.use("/api/auth", authRoutes);
app.use("/api/outpasses", approvalRoutes);
app.use("/api/verify", verificationRoutes);

// ==========================================
// REST API Endpoints
// ==========================================

/**
 * GET /api/stats
 * Returns dashboard metrics (Pending, Approved Today, Rejected Today, Outside count, etc.)
 * Supports specific warden isolation
 */
app.get("/api/stats", async (req, res) => {
  try {
    const wardenId = req.headers["x-user-id"] || req.query.wardenId || null;
    const userRole = (req.headers["x-user-role"] || req.query.role || "").toUpperCase();
    const filter = (userRole === "WARDEN" || (wardenId && String(wardenId).startsWith("WARDEN")))
      ? { wardenId, hostelBlock: req.query.hostelBlock }
      : {};
    const stats = await outpassRepository.getStatistics(filter);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/outpasses/pending
 * Returns all pending outpass requests for warden review
 * Filtered specifically to the requesting warden's hostel
 */
app.get("/api/outpasses/pending", async (req, res) => {
  try {
    const { hostelBlock, outpassType, search, wardenId: qWardenId } = req.query;
    const headerWardenId = req.headers["x-user-id"];
    const userRole = (req.headers["x-user-role"] || "").toUpperCase();
    let wardenId = qWardenId || null;
    if (userRole === "WARDEN" || (headerWardenId && String(headerWardenId).startsWith("WARDEN"))) {
      wardenId = headerWardenId;
    }
    const requests = await outpassRepository.getPending({ hostelBlock, outpassType, search, wardenId });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/outpasses
 * Returns outpass requests with filtering and search
 */
app.get("/api/outpasses", async (req, res) => {
  try {
    const { status, hostelBlock, outpassType, search, studentId, wardenId: qWardenId } = req.query;
    const headerWardenId = req.headers["x-user-id"];
    const userRole = (req.headers["x-user-role"] || "").toUpperCase();
    let wardenId = qWardenId || null;
    if (userRole === "WARDEN" && !studentId) {
      wardenId = headerWardenId;
    }
    const records = await outpassRepository.getAll({ status, hostelBlock, outpassType, search, studentId, wardenId });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/outpasses/:id
 * Returns a specific outpass by ID
 */
app.get("/api/outpasses/:id", async (req, res) => {
  try {
    const record = await outpassRepository.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: "Outpass request not found" });
    }
    res.json({ success: true, data: outpassRepository._mapRowToRecord(record) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/outpass/:id
 * Team archive compatibility endpoint (SCRUM06B-F005-UI-001)
 */
app.get("/api/outpass/:id", async (req, res) => {
  try {
    const record = await outpassRepository.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Outpass not found", error: "Outpass not found" });
    }
    const mapped = outpassRepository._mapRowToRecord(record);
    return res.status(200).json({
      success: true,
      id: mapped.id,
      status: mapped.status,
      qr_token: mapped.outbound_code || mapped.gatePassToken || `EOP-SEC-${(mapped.id || "").replace(/[^0-9]/g, "")}`,
      outbound_code: mapped.outbound_code,
      inbound_code: mapped.inbound_code,
      out_time: mapped.out_time,
      in_time: mapped.in_time,
      data: mapped
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/outpasses
 * Creates a new outpass request with strict date, phone, and role boundary validations
 * Routes request specifically to student's designated hostel warden
 */
app.post("/api/outpasses", async (req, res) => {
  try {
    const destination = req.body.destination;
    const reason = req.body.reason;
    const departureTime = req.body.departureTime || req.body.departure_time;
    const expectedReturnTime = req.body.expectedReturnTime || req.body.expected_return_time;
    const parentPhone = req.body.parentPhone || req.body.parent_phone || req.body.contact_details || req.body.studentPhone;
    const studentId = req.body.studentId || req.body.student_id;

    // 1. Missing mandatory fields check
    if (!destination || !String(destination).trim() ||
        !reason || !String(reason).trim() ||
        !departureTime ||
        !expectedReturnTime ||
        !parentPhone || !String(parentPhone).trim()) {
      const msg = "Missing mandatory outpass fields: reason, destination, departure time, return time, and emergency contact are required.";
      return res.status(400).json({
        success: false,
        message: msg,
        error: msg
      });
    }

    // 2. Emergency phone number format check (minimum 10 numeric digits)
    const phoneDigits = String(parentPhone).replace(/[^0-9]/g, "");
    if (phoneDigits.length < 10) {
      const msg = "Emergency contact number must be a valid 10-digit phone number.";
      return res.status(400).json({
        success: false,
        message: msg,
        error: msg
      });
    }

    // 3. Date & time boundary checks
    const depDate = new Date(departureTime);
    const retDate = new Date(expectedReturnTime);

    if (isNaN(depDate.getTime()) || isNaN(retDate.getTime())) {
      const msg = "Invalid departure or return date format provided.";
      return res.status(400).json({
        success: false,
        message: msg,
        error: msg
      });
    }

    const now = Date.now();
    // Departure date in the past (allow 2-minute clock drift)
    if (depDate.getTime() < now - 2 * 60 * 1000) {
      const msg = "Departure date cannot be in the past.";
      return res.status(400).json({
        success: false,
        message: msg,
        error: msg
      });
    }

    // Return date earlier than departure date
    if (retDate.getTime() < depDate.getTime()) {
      const msg = "Return date must be after the departure date.";
      return res.status(400).json({
        success: false,
        message: msg,
        error: msg
      });
    }

    // Same-minute departure and return timestamps
    if (Math.abs(retDate.getTime() - depDate.getTime()) < 60 * 1000) {
      const msg = "Outpass return time must be later than departure time.";
      return res.status(400).json({
        success: false,
        message: msg,
        error: msg
      });
    }

    // Exceeded maximum allowable leave duration (14 days)
    const maxDurationMs = 14 * 24 * 60 * 60 * 1000;
    if (retDate.getTime() - depDate.getTime() > maxDurationMs) {
      const msg = "Requested leave duration exceeds maximum allowable days.";
      return res.status(400).json({
        success: false,
        message: msg,
        error: msg
      });
    }

    // 4. Concurrent active outpass check (Pending, Approved, or Checked-Out)
    // Only unreturned passes block applying; once COMPLETED or EXPIRED, student is unlocked
    if (studentId) {
      const hasActive = await outpassRepository.hasActiveOutpass(studentId);
      if (hasActive) {
        const msg = "You already have an active outpass request pending or in progress.";
        return res.status(409).json({
          success: false,
          message: msg,
          error: msg
        });
      }
    }

    // 5. Look up student profile to determine designated specific warden & metadata
    let studentProfile = null;
    if (studentId) {
      studentProfile = await userRepository.findByIdentifier(studentId);
    }

    const hostelBlock = (studentProfile && studentProfile.hostel_block) || req.body.hostelBlock || req.body.hostel_block || "Marutham (Boys Hostel)";
    const designatedWarden = (studentProfile && studentProfile.warden_id) || (userRepository.getWardenForHostel(hostelBlock)?.id) || "WARDEN-MAR";

    const enrichedBody = {
      studentName: (studentProfile && studentProfile.name) || req.body.studentName || "Student Resident",
      hostelBlock: hostelBlock,
      roomNumber: (studentProfile && studentProfile.room_number) || req.body.roomNumber || "M-101",
      department: (studentProfile && studentProfile.department) || req.body.department || "Information Technology",
      wardenId: designatedWarden,
      warden_id: designatedWarden,
      ...req.body
    };

    const created = outpassStore.create(enrichedBody);

    // Keep outpassRepository and PostgreSQL in sync
    try {
      await outpassRepository.create({
        id: created.id,
        student_id: created.studentId,
        student_name: created.studentName,
        department: created.department,
        hostel_block: created.hostelBlock,
        room_number: created.roomNumber,
        outpass_type: created.outpassType,
        destination: created.destination,
        reason: created.reason,
        departure_time: created.departureTime,
        expected_return_time: created.expectedReturnTime,
        parent_name: created.parentName,
        parent_phone: created.parentPhone,
        parent_consent: created.parentConsent,
        warden_id: designatedWarden
      });
    } catch (repoErr) {
      // Non-blocking fallback
    }

    return res.status(201).json({
      success: true,
      message: "Outpass request submitted successfully",
      data: created
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: err.message
    });
  }
});

/**
 * PATCH /api/outpasses/:id/status
 * Reviews an outpass request (APPROVE or REJECT with remarks)
 */
app.patch("/api/outpasses/:id/status", (req, res) => {
  try {
    const { status, wardenRemarks, reviewedBy } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required (APPROVED or REJECTED)" });
    }

    const updated = outpassStore.updateStatus(req.params.id, {
      status,
      wardenRemarks,
      reviewedBy: reviewedBy || "Hostel Warden"
    });

    res.json({
      success: true,
      message: `Outpass request ${status.toLowerCase()} successfully`,
      data: updated
    });
  } catch (err) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reset-seed
 * Resets database back to default seed data for demonstration
 */
app.post("/api/reset-seed", (req, res) => {
  try {
    const result = outpassStore.resetWithSeed();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback route for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start Server with graceful port fallback
function startServer(port = PORT, retries = 5) {
  const serverInstance = app.listen(port, async () => {
    console.log(`====================================================`);
    console.log(`  E-Outpass Management System Server Running!       `);
    console.log(`  URL: http://localhost:${port}                     `);
    console.log(`  Warden Review Dashboard & Data Store Active       `);
    console.log(`====================================================`);
    await testConnection();
  });

  serverInstance.on("error", (err) => {
    if (err.code === "EADDRINUSE" && retries > 0) {
      console.warn(`[Port ${port} in use, trying port ${port + 1}...]`);
      startServer(port + 1, retries - 1);
    } else {
      console.error("Server failed to start:", err);
    }
  });

  return serverInstance;
}

if (require.main === module) {
  startServer(Number(PORT));
  if (Number(PORT) !== 3001) {
    try {
      app.listen(3001, () => {
        console.log(`  Also listening on http://localhost:3001 (Active Browser Mirror Port)`);
      }).on("error", () => {});
    } catch (e) {}
  }
}

module.exports = app;
