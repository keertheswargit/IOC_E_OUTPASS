// Verification Routes
// 2-Phase Gate Security Verification (Departure & Return)
// Supports QR Code Scan, Gate Code verification, and 1-Click Rush Hour Clearance List

const express = require("express");
const router = express.Router();
const approvalService = require("../services/approvalService");
const outpassRepository = require("../repositories/outpassRepository");
const hostelRepository = require("../repositories/hostelRepository");

function getSecurityUser(req) {
  const id = req.headers["x-user-id"] || (req.user && req.user.id) || req.body.securityId || null;
  const name = req.headers["x-user-name"] || (req.user && req.user.name) || req.body.securityName || (id === "SEC-GIRLS" ? "Officer M. Valli" : "Officer K. Raman");
  const role = (req.headers["x-user-role"] || (req.user && req.user.role) || req.body.userRole || "SECURITY").toUpperCase();
  return { id, name, role };
}

/**
 * GET /api/verify/today-list
 * Returns list of students approved to go home today & students currently outside returning to hostel
 * Automatically filtered by gate terminal gender policy (Boys Gate -> Boys Hostels, Girls Gate -> Girls Hostels)
 * Used by gate security officers for fast 1-click clearance without code delay during rush hours
 */
router.get("/today-list", async (req, res) => {
  try {
    const { hostelBlock, search, gender } = req.query;
    const securityUser = getSecurityUser(req);
    const secPolicy = securityUser.id ? await hostelRepository.getSecurityPolicy(securityUser) : null;
    
    // Effective gender filter: query param ?gender= takes precedence, then securityUser's gate policy
    const effectiveGender = (gender || (secPolicy ? secPolicy.allowed_gender : null) || "").toUpperCase();

    const allRecords = await outpassRepository.getAll({ hostelBlock, search });

    // Filter by gender if effectiveGender is specified (BOYS or GIRLS)
    let matchedRecords = [];
    for (const r of allRecords) {
      const studentGender = r.student_gender || await hostelRepository.getStudentGender(r.student_id || r.studentId, r.hostel_block || r.hostelBlock);
      r.student_gender = studentGender || "BOYS";
      r.gender = r.student_gender;

      if (!effectiveGender || (studentGender && studentGender.toUpperCase() === effectiveGender)) {
        matchedRecords.push(r);
      }
    }

    // 1. Students going home today (Approved and waiting to depart)
    const departingToday = matchedRecords.filter(r => {
      const s = String(r.status).toUpperCase();
      return s === "APPROVED" && !r.out_time && !r.departure_verified_at;
    });

    // 2. Students currently outside (Checked-Out and expected to return to hostel)
    const returningToday = matchedRecords.filter(r => {
      const s = String(r.status).toUpperCase();
      return s === "CHECKED-OUT" || (s === "APPROVED" && (r.out_time || r.departure_verified_at) && !r.return_verified_at);
    });

    // 3. Recently completed today
    const completedToday = matchedRecords.filter(r => {
      const s = String(r.status).toUpperCase();
      return s === "COMPLETED";
    }).slice(0, 10);

    return res.status(200).json({
      success: true,
      gateInfo: secPolicy ? {
        id: secPolicy.id,
        name: secPolicy.name,
        gateName: secPolicy.gate_name,
        allowedGender: secPolicy.allowed_gender
      } : null,
      data: {
        departingCount: departingToday.length,
        returningCount: returningToday.length,
        departingToday,
        returningToday,
        completedToday
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/verify/departure
 * Phase 1: Verify student exit from campus gate ('APPROVED' -> 'CHECKED-OUT')
 * Supports both manual code / QR scan code AND outpassId for 1-click clearance
 */
router.post("/departure", async (req, res) => {
  try {
    const code = req.body.code || req.body.outbound_code || req.body.outboundCode;
    const outpassId = req.body.outpassId || req.body.id;
    const securityUser = getSecurityUser(req);

    const result = await approvalService.verifyDeparture({ code, outpassId, securityUser });
    return res.status(200).json({
      success: true,
      message: result.message || "Departure verified successfully. Student checked out.",
      data: result.outpass
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Departure verification failed.",
      error: err.message
    });
  }
});

/**
 * POST /api/verify/return
 * Phase 2: Verify student return to campus gate ('CHECKED-OUT' -> 'COMPLETED')
 * Supports both manual code / QR scan code AND outpassId for 1-click clearance
 */
router.post("/return", async (req, res) => {
  try {
    const code = req.body.code || req.body.inbound_code || req.body.inboundCode;
    const outpassId = req.body.outpassId || req.body.id;
    const securityUser = getSecurityUser(req);

    const result = await approvalService.verifyReturn({ code, outpassId, securityUser });
    return res.status(200).json({
      success: true,
      message: result.message || "Return verified successfully. Outpass completed.",
      data: result.outpass
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Return verification failed.",
      error: err.message
    });
  }
});

/**
 * GET /api/verify/code/:code
 * Looks up an outpass by either outbound or inbound code for gate screen preview
 * Returns full student details and photo initial
 */
router.get("/code/:code", async (req, res) => {
  try {
    const code = req.params.code;
    const securityUser = getSecurityUser(req);
    const secPolicy = securityUser.id ? await hostelRepository.getSecurityPolicy(securityUser) : null;

    let targetPass = null;
    let phase = "DEPARTURE";

    const outbound = await outpassRepository.findByOutboundCode(code);
    if (outbound) {
      targetPass = outbound;
      phase = "DEPARTURE";
    } else {
      const inbound = await outpassRepository.findByInboundCode(code);
      if (inbound) {
        targetPass = inbound;
        phase = "RETURN";
      } else {
        const anyPass = await outpassRepository.findByAnyCode(code);
        if (anyPass) {
          targetPass = anyPass;
          const status = String(anyPass.status).toUpperCase();
          if (status === "CHECKED-OUT") phase = "RETURN";
          else if (status === "COMPLETED") phase = "COMPLETED";
          else if (status === "PENDING") phase = "PENDING";
          else phase = "DEPARTURE";
        }
      }
    }

    if (!targetPass) {
      return res.status(404).json({ success: false, message: "No active outpass found for verification code." });
    }

    const studentGender = targetPass.student_gender || await hostelRepository.getStudentGender(targetPass.student_id || targetPass.studentId, targetPass.hostel_block || targetPass.hostelBlock);
    targetPass.student_gender = studentGender || "BOYS";
    targetPass.gender = targetPass.student_gender;

    let genderMismatch = false;
    let gatePolicyWarning = null;
    if (secPolicy && secPolicy.allowed_gender && studentGender && secPolicy.allowed_gender !== studentGender) {
      genderMismatch = true;
      gatePolicyWarning = secPolicy.allowed_gender === "BOYS"
        ? `Gate Policy Violation: This outpass belongs to a female student from Girls Hostel (${targetPass.hostel_block || targetPass.hostelBlock}). Female students must exit/enter via Girls Hostel Gate.`
        : `Gate Policy Violation: This outpass belongs to a male student from Boys Hostel (${targetPass.hostel_block || targetPass.hostelBlock}). Male students must exit/enter via Boys Hostel Gate.`;
    }

    return res.status(200).json({
      success: true,
      phase,
      genderMismatch,
      gatePolicyWarning,
      outpass: targetPass
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
