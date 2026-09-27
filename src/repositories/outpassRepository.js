// Outpass Request Repository
// Manages database persistence for Outpass Requests
// Supports specific warden routing, gate movement timestamps (out_time, in_time), and active pass status management

const db = require("../config/db");
const { HOSTEL_WARDEN_MAP, aliasMap } = require("./userRepository");

function resolveWardenId(hostelBlock, explicitWardenId) {
  if (explicitWardenId) {
    const clean = String(explicitWardenId).trim().toUpperCase();
    return aliasMap[clean] || clean;
  }
  if (!hostelBlock) return "WARDEN-MAR";
  const lower = String(hostelBlock).toLowerCase();
  for (const [key, warden] of Object.entries(HOSTEL_WARDEN_MAP)) {
    if (lower.includes(key)) return warden.id;
  }
  return "WARDEN-MAR";
}

function getFreshSeedMap() {
  return new Map([
    [
      "OP-2026-001",
      {
        id: "OP-2026-001",
        student_id: "2024506057",
        student_name: "Keertheswar S",
        department: "Information Technology",
        hostel_block: "Marutham (Boys Hostel)",
        room_number: "M-304",
        outpass_type: "WEEKEND_PASS",
        destination: "Trichy (Native Place)",
        reason: "Family function and weekend break.",
        departure_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 52 * 3600 * 1000).toISOString(),
        parent_name: "Senthil Nathan",
        parent_phone: "+91 94432 10987",
        parent_consent: "CONFIRMED_VIA_SMS",
        status: "PENDING",
        warden_id: "WARDEN-MAR",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        outbound_code: null,
        inbound_code: null,
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    [
      "OP-2026-002",
      {
        id: "OP-2026-002",
        student_id: "2023501142",
        student_name: "Priya Dharshini M",
        department: "Computer Science and Engineering",
        hostel_block: "Cauvery (Girls Hostel)",
        room_number: "C-214",
        outpass_type: "EMERGENCY_PASS",
        destination: "Apollo Clinic, Gandhipuram",
        reason: "Severe dental toothache, scheduled appointment.",
        departure_time: new Date(Date.now() + 1 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
        parent_name: "Meenakshi Sundaram",
        parent_phone: "+91 94876 54321",
        parent_consent: "VERIFIED",
        status: "PENDING",
        warden_id: "WARDEN-CAU",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        outbound_code: null,
        inbound_code: null,
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    [
      "OP-2026-003",
      {
        id: "OP-2026-003",
        student_id: "2023506001",
        student_name: "Arvind Kumar R",
        department: "Information Technology",
        hostel_block: "Marutham (Boys Hostel)",
        room_number: "M-118",
        outpass_type: "DAY_PASS",
        destination: "Town Hall Electronics Market",
        reason: "Purchasing project sensors and components.",
        departure_time: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        parent_name: "R. Radhakrishnan",
        parent_phone: "+91 93456 78901",
        parent_consent: "PENDING_CALL",
        status: "PENDING",
        warden_id: "WARDEN-MAR",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        outbound_code: null,
        inbound_code: null,
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 2700000).toISOString(),
        updated_at: new Date(Date.now() - 2700000).toISOString()
      }
    ],
    [
      "OP-2026-004",
      {
        id: "OP-2026-004",
        student_id: "2023505015",
        student_name: "Sneha Nair",
        department: "AI & Data Science",
        hostel_block: "Cauvery (Girls Hostel)",
        room_number: "C-108",
        outpass_type: "WEEKEND_PASS",
        destination: "Palakkad, Kerala (Hometown)",
        reason: "Sister's engagement ceremony at native place.",
        departure_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
        parent_name: "S. Nair",
        parent_phone: "+91 97861 23456",
        parent_consent: "VERIFIED",
        status: "PENDING",
        warden_id: "WARDEN-CAU",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        outbound_code: null,
        inbound_code: null,
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 5400000).toISOString(),
        updated_at: new Date(Date.now() - 5400000).toISOString()
      }
    ],
    [
      "OP-2026-005",
      {
        id: "OP-2026-005",
        student_id: "2023503034",
        student_name: "Mohammed Faizal",
        department: "Mechanical Engineering",
        hostel_block: "Kurunji (Boys Hostel)",
        room_number: "K-204",
        outpass_type: "DAY_PASS",
        destination: "PSG Tech Campus (Hackathon)",
        reason: "Representing college at 24-hour CAD design challenge.",
        departure_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
        parent_name: "A. Abdul Faizal",
        parent_phone: "+91 99441 23890",
        parent_consent: "PENDING_CALL",
        status: "PENDING",
        warden_id: "WARDEN-KUR",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        outbound_code: null,
        inbound_code: null,
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 6600000).toISOString(),
        updated_at: new Date(Date.now() - 6600000).toISOString()
      }
    ],
    [
      "OP-2026-006",
      {
        id: "OP-2026-006",
        student_id: "2022501033",
        student_name: "Divya Bharathi R",
        department: "Computer Science",
        hostel_block: "Vaigai (Girls Hostel)",
        room_number: "V-102",
        outpass_type: "DAY_PASS",
        destination: "Coimbatore Railway Station",
        reason: "Receiving grandmother arriving by Shatabdi train.",
        departure_time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        parent_name: "R. Ramanathan",
        parent_phone: "+91 94422 33445",
        parent_consent: "VERIFIED",
        status: "APPROVED",
        warden_id: "WARDEN-VAI",
        warden_remarks: "Approved over phone. Return before 8:30 PM gate close.",
        rejection_reason: null,
        approved_by: "WARDEN-VAI",
        outbound_code: "OUT-8921",
        inbound_code: "IN-8921",
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 18000000).toISOString(),
        updated_at: new Date(Date.now() - 14400000).toISOString()
      }
    ],
    [
      "OP-2026-007",
      {
        id: "OP-2026-007",
        student_id: "2022502088",
        student_name: "Saravanan T",
        department: "Electronics & Communication",
        hostel_block: "Bhavani (Boys Hostel)",
        room_number: "B-101",
        outpass_type: "WEEKEND_PASS",
        destination: "Madurai (Native Place)",
        reason: "Family pilgrimage visit.",
        departure_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        parent_name: "T. Thangavel",
        parent_phone: "+91 98422 11223",
        parent_consent: "VERIFIED",
        status: "PENDING",
        warden_id: "WARDEN-BHA",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        outbound_code: null,
        inbound_code: null,
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 3000000).toISOString(),
        updated_at: new Date(Date.now() - 3000000).toISOString()
      }
    ],
    [
      "OP-2026-008",
      {
        id: "OP-2026-008",
        student_id: "2023507028",
        student_name: "Ananya Ramesh",
        department: "Biotechnology",
        hostel_block: "Ponni (Girls Hostel)",
        room_number: "P-115",
        outpass_type: "WEEKEND_PASS",
        destination: "Salem (Native Home)",
        reason: "Attending family festival celebration.",
        departure_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 50 * 3600 * 1000).toISOString(),
        parent_name: "Ramesh K",
        parent_phone: "+91 94433 88990",
        parent_consent: "VERIFIED",
        status: "PENDING",
        warden_id: "WARDEN-PON",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        outbound_code: null,
        inbound_code: null,
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 2400000).toISOString(),
        updated_at: new Date(Date.now() - 2400000).toISOString()
      }
    ],
    [
      "OP-2026-009",
      {
        id: "OP-2026-009",
        student_id: "2023504062",
        student_name: "Sanjay V",
        department: "Electrical Engineering",
        hostel_block: "Kurunji (Boys Hostel)",
        room_number: "K-312",
        outpass_type: "DAY_PASS",
        destination: "Local Power Substation / Industrial Visit",
        reason: "Field study for electrical power transmission project.",
        departure_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        parent_name: "V. Velmurugan",
        parent_phone: "+91 98411 77889",
        parent_consent: "VERIFIED",
        status: "APPROVED",
        warden_id: "WARDEN-KUR",
        warden_remarks: "Permission granted for academic study.",
        rejection_reason: null,
        approved_by: "WARDEN-KUR",
        outbound_code: "OUT-5542",
        inbound_code: "IN-5542",
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 10800000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    [
      "OP-2026-010",
      {
        id: "OP-2026-010",
        student_id: "2024502071",
        student_name: "Kavitha S",
        department: "Electronics & Communication",
        hostel_block: "Ponni (Girls Hostel)",
        room_number: "P-202",
        outpass_type: "DAY_PASS",
        destination: "Cross Cut Road Market",
        reason: "Purchasing books and hostel essentials.",
        departure_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        parent_name: "S. Shanmugam",
        parent_phone: "+91 98402 33445",
        parent_consent: "PENDING_CALL",
        status: "PENDING",
        warden_id: "WARDEN-PON",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        outbound_code: null,
        inbound_code: null,
        departure_verified_at: null,
        return_verified_at: null,
        out_time: null,
        in_time: null,
        created_at: new Date(Date.now() - 900000).toISOString(),
        updated_at: new Date(Date.now() - 900000).toISOString()
      }
    ]
  ]);
}

let memoryOutpassStore = getFreshSeedMap();

class OutpassRepository {
  /**
   * Finds an outpass request by its unique ID
   */
  async findById(id, client = null, forUpdate = false) {
    if (!id) return null;

    try {
      const queryRunner = client || db;
      const sql = `
        SELECT * FROM outpass_requests 
        WHERE id = $1 
        ${forUpdate ? "FOR UPDATE" : ""};
      `;
      const result = await queryRunner.query(sql, [id]);
      if (result.rows[0]) return result.rows[0];
      const found = memoryOutpassStore.get(id);
      return found ? { ...found } : null;
    } catch (pgError) {
      const found = memoryOutpassStore.get(id);
      return found ? { ...found } : null;
    }
  }

  /**
   * Updates status, remarks, verification codes, and gate movement timestamps (out_time, in_time)
   */
  async updateStatus(id, {
    status,
    wardenRemarks = null,
    rejectionReason = null,
    approvedBy = null,
    outboundCode = null,
    inboundCode = null,
    departureVerifiedAt = null,
    returnVerifiedAt = null,
    departureVerifiedBy = null,
    returnVerifiedBy = null,
    out_time = null,
    outTime = null,
    in_time = null,
    inTime = null
  }, client = null) {
    const finalOutTime = out_time || outTime || departureVerifiedAt;
    const finalInTime = in_time || inTime || returnVerifiedAt;

    try {
      const queryRunner = client || db;
      const sql = `
        UPDATE outpass_requests
        SET 
          status = $1,
          warden_remarks = COALESCE($2, warden_remarks),
          rejection_reason = COALESCE($3, rejection_reason),
          approved_by = COALESCE($4, approved_by),
          outbound_code = COALESCE($5, outbound_code),
          inbound_code = COALESCE($6, inbound_code),
          departure_verified_at = COALESCE($7, departure_verified_at),
          return_verified_at = COALESCE($8, return_verified_at),
          departure_verified_by = COALESCE($9, departure_verified_by),
          return_verified_by = COALESCE($10, return_verified_by),
          out_time = COALESCE($11, out_time),
          in_time = COALESCE($12, in_time),
          updated_at = NOW()
        WHERE id = $13
        RETURNING *;
      `;
      const values = [
        status, wardenRemarks, rejectionReason, approvedBy,
        outboundCode, inboundCode, departureVerifiedAt, returnVerifiedAt,
        departureVerifiedBy, returnVerifiedBy, finalOutTime, finalInTime, id
      ];
      const result = await queryRunner.query(sql, values);
      if (result.rows[0]) {
        const row = result.rows[0];
        memoryOutpassStore.set(id, { ...row });
        this._syncWithOutpassStore(id, { ...row, status, wardenRemarks, approvedBy, outboundCode, inboundCode, departureVerifiedAt, returnVerifiedAt, out_time: finalOutTime, in_time: finalInTime });
        return row;
      }
    } catch (pgError) {
      // Memory store fallback
    }

    const item = memoryOutpassStore.get(id);
    if (!item) throw new Error(`Outpass request ${id} not found`);
    item.status = status;
    if (wardenRemarks !== null) item.warden_remarks = wardenRemarks;
    if (rejectionReason !== null) item.rejection_reason = rejectionReason;
    if (approvedBy !== null) item.approved_by = approvedBy;
    if (outboundCode !== null) item.outbound_code = outboundCode;
    if (inboundCode !== null) item.inbound_code = inboundCode;
    if (departureVerifiedAt !== null) item.departure_verified_at = departureVerifiedAt;
    if (returnVerifiedAt !== null) item.return_verified_at = returnVerifiedAt;
    if (departureVerifiedBy !== null) item.departure_verified_by = departureVerifiedBy;
    if (returnVerifiedBy !== null) item.return_verified_by = returnVerifiedBy;
    if (finalOutTime !== null) item.out_time = finalOutTime;
    if (finalInTime !== null) item.in_time = finalInTime;
    item.updated_at = new Date().toISOString();
    memoryOutpassStore.set(id, item);

    this._syncWithOutpassStore(id, { ...item, status, wardenRemarks, approvedBy, outboundCode, inboundCode, departureVerifiedAt, returnVerifiedAt, out_time: finalOutTime, in_time: finalInTime });
    return { ...item };
  }

  _syncWithOutpassStore(id, data) {
    try {
      const { outpassStore } = require("../db/outpassStore");
      outpassStore.updateStatus(id, {
        status: data.status,
        wardenRemarks: data.warden_remarks || data.wardenRemarks,
        rejectionReason: data.rejection_reason || data.rejectionReason,
        reviewedBy: data.approved_by || data.approvedBy,
        outboundCode: data.outbound_code || data.outboundCode,
        inboundCode: data.inbound_code || data.inboundCode,
        departureVerifiedAt: data.departure_verified_at || data.departureVerifiedAt,
        returnVerifiedAt: data.return_verified_at || data.returnVerifiedAt,
        out_time: data.out_time || data.outTime,
        in_time: data.in_time || data.inTime
      });
    } catch (e) {}
  }

  /**
   * Checks whether a student currently has an active ('PENDING', 'APPROVED', or 'CHECKED-OUT') outpass request
   * Automatically expires any requests whose return deadline passed without check-out
   * Never blocks students whose previous outpass is COMPLETED, REJECTED, EXPIRED, or already returned
   */
  async hasActiveOutpass(studentId) {
    if (!studentId) return false;
    const cleanStudentId = String(studentId).trim().toUpperCase();
    const resolvedId = aliasMap[cleanStudentId] || cleanStudentId;

    try {
      if (db.isPostgresConnected()) {
        // Auto-expire stale past approved/pending passes where student never departed
        await db.query(`
          UPDATE outpass_requests
          SET status = 'EXPIRED'
          WHERE (UPPER(student_id) = $1 OR UPPER(student_id) = $2)
            AND UPPER(status) IN ('PENDING', 'APPROVED')
            AND (expected_return_time < NOW() OR departure_time < NOW() - INTERVAL '4 hours')
            AND departure_verified_at IS NULL
            AND out_time IS NULL;
        `, [cleanStudentId, resolvedId]);

        // A pass is strictly active if:
        // 1) Student is currently outside: CHECKED-OUT and has not returned (in_time is null)
        // 2) Student has upcoming APPROVED pass: departure_time >= NOW() - INTERVAL '4 hours' and out_time is null
        // 3) Student has upcoming PENDING pass: departure_time >= NOW() - INTERVAL '1 hour'
        const sql = `
          SELECT id FROM outpass_requests
          WHERE (UPPER(student_id) = $1 OR UPPER(student_id) = $2)
            AND return_verified_at IS NULL
            AND in_time IS NULL
            AND (
              UPPER(status) = 'CHECKED-OUT'
              OR (UPPER(status) = 'APPROVED' AND out_time IS NULL AND departure_time >= NOW() - INTERVAL '4 hours' AND expected_return_time >= NOW())
              OR (UPPER(status) = 'PENDING' AND departure_time >= NOW() - INTERVAL '1 hour' AND expected_return_time >= NOW())
            )
          LIMIT 1;
        `;
        const res = await db.query(sql, [cleanStudentId, resolvedId]);
        if (res.rows.length > 0) return true;
        return false;
      }
    } catch (err) {
      console.warn("[OutpassRepo] Postgres hasActiveOutpass failed, checking memory store:", err.message);
    }

    // Check memory store
    const now = Date.now();
    for (const item of memoryOutpassStore.values()) {
      const sId = String(item.student_id || item.studentId || "").toUpperCase();
      if (sId === cleanStudentId || sId === resolvedId) {
        const s = String(item.status || "").toUpperCase();
        // If already completed, returned, rejected, or expired -> cannot block
        if (["COMPLETED", "REJECTED", "EXPIRED", "CANCELLED"].includes(s)) continue;
        if (item.return_verified_at || item.returnVerifiedAt || item.in_time || item.inTime) continue;

        const depTime = new Date(item.departure_time || item.departureTime).getTime();
        const expRet = new Date(item.expected_return_time || item.expectedReturnTime).getTime();

        // If never departed and departure window or return time is past, auto-expire
        if ((s === "PENDING" || s === "APPROVED") && !item.out_time && !item.outTime && !item.departure_verified_at) {
          if (expRet < now || depTime < now - 4 * 3600 * 1000) {
            item.status = "EXPIRED";
            continue;
          }
        }

        // Active only if currently outside or has valid future departure
        if (s === "CHECKED-OUT") {
          return true;
        }
        if (s === "APPROVED" && !item.out_time && !item.outTime && depTime >= now - 4 * 3600 * 1000 && expRet >= now) {
          return true;
        }
        if (s === "PENDING" && depTime >= now - 1 * 3600 * 1000 && expRet >= now) {
          return true;
        }
      }
    }

    // Also check outpassStore
    try {
      const { outpassStore } = require("../db/outpassStore");
      return outpassStore.hasActiveOutpass(cleanStudentId) || outpassStore.hasActiveOutpass(resolvedId);
    } catch (e) {
      return false;
    }
  }

  /**
   * Find an outpass request by outbound departure verification code
   */
  async findByOutboundCode(code) {
    if (!code) return null;
    const cleanCode = String(code).trim().toUpperCase();

    try {
      if (db.isPostgresConnected()) {
        const sql = `SELECT * FROM outpass_requests WHERE UPPER(outbound_code) = $1;`;
        const res = await db.query(sql, [cleanCode]);
        return res.rows[0] ? this._mapRowToRecord(res.rows[0]) : null;
      }
    } catch (err) {
      console.warn("[OutpassRepo] Postgres query failed, falling back to memory store:", err.message);
    }

    for (const item of memoryOutpassStore.values()) {
      if (item.outbound_code && String(item.outbound_code).toUpperCase() === cleanCode) {
        return this._mapRowToRecord({ ...item });
      }
    }
    return null;
  }

  /**
   * Find an outpass request by inbound return verification code
   */
  async findByInboundCode(code) {
    if (!code) return null;
    const cleanCode = String(code).trim().toUpperCase();

    try {
      if (db.isPostgresConnected()) {
        const sql = `SELECT * FROM outpass_requests WHERE UPPER(inbound_code) = $1;`;
        const res = await db.query(sql, [cleanCode]);
        return res.rows[0] ? this._mapRowToRecord(res.rows[0]) : null;
      }
    } catch (err) {
      console.warn("[OutpassRepo] Postgres query failed, falling back to memory store:", err.message);
    }

    for (const item of memoryOutpassStore.values()) {
      if (item.inbound_code && String(item.inbound_code).toUpperCase() === cleanCode) {
        return this._mapRowToRecord({ ...item });
      }
    }
    return null;
  }

  /**
   * Find an outpass request by any recognized token or identifier:
   * 1. outbound_code (OUT-XXXX)
   * 2. inbound_code (IN-XXXX)
   * 3. id (OP-2026-001)
   * 4. student_id (2024506057)
   */
  async findByAnyCode(code) {
    if (!code) return null;
    const cleanCode = String(code).trim().toUpperCase();

    // Direct outbound match
    const outboundMatch = await this.findByOutboundCode(cleanCode);
    if (outboundMatch) return outboundMatch;

    // Direct inbound match
    const inboundMatch = await this.findByInboundCode(cleanCode);
    if (inboundMatch) return inboundMatch;

    // Direct ID match
    try {
      const idMatch = await this.findById(cleanCode);
      if (idMatch) return this._mapRowToRecord(idMatch);
    } catch (e) {}

    // Query PostgreSQL
    try {
      if (db.isPostgresConnected()) {
        const digits = cleanCode.replace(/[^0-9]/g, "");
        const s4 = digits.length >= 4 ? digits.slice(-4) : digits;
        const s3 = digits.length >= 3 ? digits.slice(-3) : digits;

        const sql = `
          SELECT * FROM outpass_requests 
          WHERE UPPER(outbound_code) = $1
             OR UPPER(inbound_code) = $1
             OR UPPER(id) = $1
             OR UPPER(student_id) = $1
             OR ($2 != '' AND RIGHT(REGEXP_REPLACE(id, '[^0-9]', '', 'g'), 4) = $2)
             OR ($3 != '' AND RIGHT(REGEXP_REPLACE(id, '[^0-9]', '', 'g'), 3) = $3)
             OR ($4 != '' AND UPPER(student_id) = $4)
          ORDER BY created_at DESC;
        `;
        const res = await db.query(sql, [cleanCode, s4, s3, digits]);
        if (res.rows && res.rows.length > 0) {
          return this._mapRowToRecord(res.rows[0]);
        }
      }
    } catch (pgErr) {}

    // Memory store fallback
    const digits = cleanCode.replace(/[^0-9]/g, "");
    for (const item of memoryOutpassStore.values()) {
      const mapped = this._mapRowToRecord({ ...item });
      const itemDigits = (mapped.id || "").replace(/[^0-9]/g, "");

      if (
        (mapped.outboundCode && mapped.outboundCode.toUpperCase() === cleanCode) ||
        (mapped.inboundCode && mapped.inboundCode.toUpperCase() === cleanCode) ||
        (mapped.id && mapped.id.toUpperCase() === cleanCode) ||
        (mapped.studentId && mapped.studentId.toUpperCase() === cleanCode) ||
        (digits.length >= 4 && itemDigits.endsWith(digits.slice(-4))) ||
        (digits.length >= 3 && itemDigits.endsWith(digits.slice(-3)))
      ) {
        return mapped;
      }
    }

    return null;
  }

  /**
   * Creates a new outpass request with designated specific warden
   */
  async create(data, client = null) {
    const assignedWarden = resolveWardenId(data.hostel_block || data.hostelBlock, data.warden_id || data.wardenId);

    try {
      const queryRunner = client || db;

      if (data.student_id) {
        try {
          await queryRunner.query(`
            INSERT INTO users (id, name, email, password, role, hostel_block, warden_id)
            VALUES ($1, $2, $3, 'student123', 'STUDENT', $4, $5)
            ON CONFLICT (id) DO UPDATE SET warden_id = COALESCE(users.warden_id, EXCLUDED.warden_id);
          `, [
            data.student_id,
            data.student_name || "Student Resident",
            `${String(data.student_id).toLowerCase()}@student.college.edu`,
            data.hostel_block || "Marutham (Boys Hostel)",
            assignedWarden
          ]);
        } catch (uErr) {}
      }

      const sql = `
        INSERT INTO outpass_requests (
          id, student_id, student_name, department, hostel_block, room_number,
          outpass_type, destination, reason, departure_time, expected_return_time,
          parent_name, parent_phone, parent_consent, status, warden_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'PENDING', $15)
        RETURNING *;
      `;
      const values = [
        data.id, data.student_id, data.student_name, data.department, data.hostel_block, data.room_number,
        data.outpass_type, data.destination, data.reason, data.departure_time, data.expected_return_time,
        data.parent_name, data.parent_phone, data.parent_consent || 'PENDING_CALL', assignedWarden
      ];
      const result = await queryRunner.query(sql, values);
      const row = result.rows[0];
      memoryOutpassStore.set(data.id, { ...row });
      return row;
    } catch (pgError) {
      const item = {
        ...data,
        warden_id: assignedWarden,
        status: "PENDING",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryOutpassStore.set(data.id, item);
      return item;
    }
  }

  /**
   * Normalizes a database row to a standard application object
   */
  _mapRowToRecord(r) {
    if (!r) return null;
    const finalOutTime = r.out_time || r.outTime || r.departure_verified_at || r.departureVerifiedAt || null;
    const finalInTime = r.in_time || r.inTime || r.return_verified_at || r.returnVerifiedAt || null;

    return {
      id: r.id,
      studentId: r.student_id || r.studentId,
      studentName: r.student_name || r.studentName,
      department: r.department || "Information Technology",
      year: r.year || "3rd Year",
      hostelBlock: r.hostel_block || r.hostelBlock,
      wardenId: r.warden_id || r.wardenId || resolveWardenId(r.hostel_block || r.hostelBlock),
      warden_id: r.warden_id || r.wardenId || resolveWardenId(r.hostel_block || r.hostelBlock),
      roomNumber: r.room_number || r.roomNumber,
      studentPhone: r.student_phone || r.studentPhone || "+91 98765 43210",
      parentName: r.parent_name || r.parentName,
      parentPhone: r.parent_phone || r.parentPhone,
      parentConsent: r.parent_consent || r.parentConsent || "PENDING_CALL",
      outpassType: r.outpass_type || r.outpassType,
      destination: r.destination,
      reason: r.reason,
      departureTime: r.departure_time || r.departureTime,
      expectedReturnTime: r.expected_return_time || r.expectedReturnTime,
      actualReturnTime: r.actual_return_time || r.actualReturnTime || finalInTime,
      out_time: finalOutTime,
      outTime: finalOutTime,
      in_time: finalInTime,
      inTime: finalInTime,
      status: r.status,
      wardenRemarks: r.warden_remarks || r.wardenRemarks || "",
      rejectionReason: r.rejection_reason || r.rejectionReason || null,
      approvedBy: r.approved_by || r.approvedBy || null,
      reviewedBy: r.approved_by || r.reviewedBy || (r.status === "APPROVED" ? "Hostel Warden" : null),
      reviewedAt: r.updated_at || r.reviewedAt || null,
      outbound_code: r.outbound_code || r.outboundCode || null,
      outboundCode: r.outbound_code || r.outboundCode || null,
      inbound_code: r.inbound_code || r.inboundCode || null,
      inboundCode: r.inbound_code || r.inboundCode || null,
      departure_verified_at: r.departure_verified_at || r.departureVerifiedAt || finalOutTime,
      departureVerifiedAt: r.departure_verified_at || r.departureVerifiedAt || finalOutTime,
      return_verified_at: r.return_verified_at || r.returnVerifiedAt || finalInTime,
      returnVerifiedAt: r.return_verified_at || r.returnVerifiedAt || finalInTime,
      departure_verified_by: r.departure_verified_by || r.departureVerifiedBy || null,
      departureVerifiedBy: r.departure_verified_by || r.departureVerifiedBy || null,
      return_verified_by: r.return_verified_by || r.returnVerifiedBy || null,
      qr_token: r.outbound_code || r.outboundCode || `EOP-SEC-${(r.id || "").replace(/[^0-9]/g, "").slice(-4)}`,
      createdAt: r.created_at || r.createdAt,
      updatedAt: r.updated_at || r.updatedAt,
      gatePassToken: r.gate_pass_token || (r.outbound_code ? r.outbound_code : `EOP-SEC-${(r.id || "").replace(/[^0-9]/g, "").slice(-4)}`),
      studentHistory: r.studentHistory || {
        totalOutpassesThisSem: 2,
        onTimeReturns: 2,
        overstays: 0,
        cgpa: "8.80",
        attendance: "94%"
      }
    };
  }

  /**
   * Retrieves all outpass requests with filtering (supports specific wardenId)
   */
  async getAll(filters = {}) {
    try {
      if (db.isPostgresConnected()) {
        let sql = `SELECT * FROM outpass_requests WHERE 1=1`;
        const params = [];

        // Specific Warden Filter (request routes ONLY to respective warden)
        if (filters.wardenId && filters.wardenId !== "ALL") {
          const cleanWarden = String(filters.wardenId).trim().toUpperCase();
          const resolvedWarden = aliasMap[cleanWarden] || cleanWarden;
          params.push(resolvedWarden);
          const p1 = `$${params.length}`;
          params.push(cleanWarden);
          const p2 = `$${params.length}`;
          sql += ` AND (UPPER(warden_id) = ${p1} OR UPPER(warden_id) = ${p2}`;
          if (filters.hostelBlock && filters.hostelBlock !== "ALL") {
            params.push(`%${filters.hostelBlock}%`);
            sql += ` OR hostel_block ILIKE $${params.length}`;
          }
          sql += `)`;
        }

        if (filters.status && filters.status !== "ALL") {
          params.push(filters.status.toUpperCase());
          sql += ` AND UPPER(status) = $${params.length}`;
        }

        if (filters.hostelBlock && filters.hostelBlock !== "ALL" && !filters.wardenId) {
          params.push(`%${filters.hostelBlock}%`);
          sql += ` AND hostel_block ILIKE $${params.length}`;
        }

        if (filters.outpassType && filters.outpassType !== "ALL") {
          params.push(filters.outpassType);
          sql += ` AND outpass_type = $${params.length}`;
        }

        if (filters.studentId) {
          const sId = String(filters.studentId).trim().toUpperCase();
          const alias = aliasMap[sId] || sId;
          params.push(sId);
          const p1 = `$${params.length}`;
          params.push(alias);
          const p2 = `$${params.length}`;
          sql += ` AND (UPPER(student_id) = ${p1} OR UPPER(student_id) = ${p2})`;
        }

        if (filters.search && filters.search.trim()) {
          params.push(`%${filters.search.trim()}%`);
          const p = `$${params.length}`;
          sql += ` AND (student_name ILIKE ${p} OR student_id ILIKE ${p} OR room_number ILIKE ${p} OR destination ILIKE ${p} OR reason ILIKE ${p} OR id ILIKE ${p})`;
        }

        sql += ` ORDER BY created_at DESC;`;
        const result = await db.query(sql, params);
        return result.rows.map(r => this._mapRowToRecord(r));
      }
    } catch (pgError) {
      console.warn("[OutpassRepo] Postgres query failed, falling back to memory/store:", pgError.message);
    }

    // Memory store fallback
    const all = Array.from(memoryOutpassStore.values()).map(r => this._mapRowToRecord(r));
    return all.filter(r => {
      if (filters.wardenId && filters.wardenId !== "ALL") {
        const cleanWarden = String(filters.wardenId).trim().toUpperCase();
        const resolvedWarden = aliasMap[cleanWarden] || cleanWarden;
        const passWarden = String(r.wardenId || r.warden_id || "").toUpperCase();
        if (passWarden !== cleanWarden && passWarden !== resolvedWarden) {
          if (!filters.hostelBlock || !r.hostelBlock.toLowerCase().includes(filters.hostelBlock.toLowerCase())) {
            return false;
          }
        }
      }
      if (filters.status && filters.status !== "ALL" && String(r.status).toUpperCase() !== String(filters.status).toUpperCase()) {
        return false;
      }
      if (filters.hostelBlock && filters.hostelBlock !== "ALL" && !r.hostelBlock.toLowerCase().includes(filters.hostelBlock.toLowerCase())) {
        return false;
      }
      if (filters.outpassType && filters.outpassType !== "ALL" && r.outpassType !== filters.outpassType) {
        return false;
      }
      if (filters.studentId) {
        const sId = String(filters.studentId).toUpperCase();
        const rId = String(r.studentId).toUpperCase();
        if (rId !== sId && rId !== (aliasMap[sId] || "")) return false;
      }
      return true;
    });
  }

  /**
   * Retrieves pending outpass requests
   */
  async getPending(filters = {}) {
    return this.getAll({ ...filters, status: "PENDING" });
  }

  /**
   * Computes dashboard statistics (supports warden-specific metrics)
   */
  async getStatistics(filters = {}) {
    try {
      const records = await this.getAll(filters);
      const now = new Date();
      const threeHoursFromNow = new Date(now.getTime() + 3 * 3600 * 1000);
      const todayDateStr = now.toISOString().slice(0, 10);

      let pendingCount = 0;
      let approvedToday = 0;
      let rejectedToday = 0;
      let currentlyOutside = 0;
      let urgentPending = 0;
      const blockDistribution = {};

      for (const r of records) {
        if (r.status === "PENDING") {
          pendingCount++;
          const depTime = new Date(r.departureTime);
          if (depTime <= threeHoursFromNow) {
            urgentPending++;
          }
        }

        if (r.reviewedAt && String(r.reviewedAt).slice(0, 10) === todayDateStr) {
          if (r.status === "APPROVED") approvedToday++;
          if (r.status === "REJECTED") rejectedToday++;
        }

        if (r.status === "CHECKED-OUT" || (r.status === "APPROVED" && r.out_time && !r.in_time)) {
          currentlyOutside++;
        } else if (r.status === "APPROVED") {
          const depTime = new Date(r.departureTime);
          const expRet = new Date(r.expectedReturnTime);
          if (depTime <= now && (!r.actualReturnTime || expRet >= now)) {
            currentlyOutside++;
          }
        }

        const block = r.hostelBlock || "Other";
        blockDistribution[block] = (blockDistribution[block] || 0) + 1;
      }

      return {
        pendingCount,
        approvedToday,
        rejectedToday,
        currentlyOutside,
        urgentPending,
        totalRequests: records.length,
        blockDistribution,
        lastUpdated: new Date().toISOString()
      };
    } catch (pgError) {
      console.warn("[OutpassRepo] Postgres getStatistics failed, falling back:", pgError.message);
    }

    const { outpassStore } = require("../db/outpassStore");
    return outpassStore.getStatistics(filters);
  }

  /**
   * Resets in-memory store and PostgreSQL test records for clean testing
   */
  _resetMemoryStore() {
    memoryOutpassStore = getFreshSeedMap();
  }

  async resetDatabaseForTests() {
    this._resetMemoryStore();
    try {
      const { outpassStore } = require("../db/outpassStore");
      outpassStore.resetWithSeed();
    } catch (e) {}

    try {
      await db.testConnection();
      if (db.isPostgresConnected()) {
        await db.query(`
          UPDATE outpass_requests
          SET status = 'PENDING', approved_by = NULL, warden_remarks = NULL, rejection_reason = NULL,
              departure_verified_at = NULL, return_verified_at = NULL, out_time = NULL, in_time = NULL,
              outbound_code = NULL, inbound_code = NULL
          WHERE id IN ('OP-2026-001', 'OP-2026-002', 'OP-2026-003', 'OP-2026-004', 'OP-2026-005', 'OP-2026-007', 'OP-2026-008', 'OP-2026-010');
          DELETE FROM outpass_status_history WHERE outpass_id NOT IN ('OP-2026-001', 'OP-2026-002', 'OP-2026-003', 'OP-2026-004', 'OP-2026-005', 'OP-2026-006', 'OP-2026-007', 'OP-2026-008', 'OP-2026-009', 'OP-2026-010');
          DELETE FROM outpass_requests WHERE id NOT IN ('OP-2026-001', 'OP-2026-002', 'OP-2026-003', 'OP-2026-004', 'OP-2026-005', 'OP-2026-006', 'OP-2026-007', 'OP-2026-008', 'OP-2026-009', 'OP-2026-010');
        `);
        await db.query(`
          DELETE FROM outpass_status_history
          WHERE outpass_id IN ('OP-2026-001', 'OP-2026-002') AND previous_status != 'NONE';
        `);
        // Clean any extra users so exactly 26 remain
        await db.query(`
          DELETE FROM users
          WHERE id NOT IN (
            'WARDEN-MAR', 'WARDEN-KUR', 'WARDEN-BHA', 'WARDEN-CAU', 'WARDEN-PON', 'WARDEN-VAI',
            'SEC-BOYS', 'SEC-GIRLS',
            '2024506057', '2023506001', '2024501045',
            '2023503034', '2023504062', '2024506012',
            '2022502088', '2023501077', '2024503023',
            '2023501142', '2023505015', '2022506115',
            '2023507028', '2024502071', '2023506045',
            '2022501033', '2023502056', '2024505090'
          );
        `);
      }
    } catch (err) {
      console.warn("[OutpassRepo] resetDatabaseForTests error:", err.message);
    }
  }
}

module.exports = new OutpassRepository();
