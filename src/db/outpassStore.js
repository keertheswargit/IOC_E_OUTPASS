// [SCRUM06B-F001-DB-001] Outpass request data store
// Persistent data store for Hostel E-Outpass Management System
// Supports full CRUD, search, filtering, status transitions, and audit metrics.

const fs = require("fs");
const path = require("path");
const { initialOutpasses } = require("./seedData");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "outpass_records.json");

// Hostel to Warden lookup
const HOSTEL_WARDEN_MAP = {
  "marutham": "WARDEN-MAR",
  "kurunji": "WARDEN-KUR",
  "bhavani": "WARDEN-BHA",
  "cauvery": "WARDEN-CAU",
  "ponni": "WARDEN-PON",
  "vaigai": "WARDEN-VAI"
};

function resolveWardenId(hostelBlock, explicitWardenId) {
  if (explicitWardenId) return explicitWardenId;
  if (!hostelBlock) return "WARDEN-MAR";
  const lower = String(hostelBlock).toLowerCase();
  for (const [key, wId] of Object.entries(HOSTEL_WARDEN_MAP)) {
    if (lower.includes(key)) return wId;
  }
  return "WARDEN-MAR";
}

class OutpassStore {
  constructor() {
    this._ensureStorage();
  }

  /**
   * Initializes data directory and storage file with seed data if needed
   */
  _ensureStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        this._writeToFile(initialOutpasses);
      } else {
        const raw = fs.readFileSync(DB_FILE, "utf-8").trim();
        if (!raw) {
          this._writeToFile(initialOutpasses);
        }
      }
    } catch (err) {
      console.error("[OutpassStore] Storage initialization error:", err);
      throw err;
    }
  }

  /**
   * Reads all records from persistent JSON file
   * @returns {Array} Array of outpass request objects
   */
  _readFromFile() {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content || "[]");
    } catch (err) {
      console.error("[OutpassStore] File read error:", err);
      return [];
    }
  }

  /**
   * Writes all records atomically to persistent JSON file
   * @param {Array} records 
   */
  _writeToFile(records) {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(records, null, 2), "utf-8");
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error("[OutpassStore] File write error:", err);
      throw err;
    }
  }

  /**
   * Generates a unique, standardized Outpass ID
   * @returns {string} e.g. "OP-2026-008"
   */
  _generateId(records) {
    const currentYear = new Date().getFullYear();
    const prefix = `OP-${currentYear}-`;
    const numbers = records
      .map(r => {
        if (r.id && r.id.startsWith(prefix)) {
          const num = parseInt(r.id.replace(prefix, ""), 10);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = String(maxNum + 1).padStart(3, "0");
    return `${prefix}${nextNum}`;
  }

  /**
   * Generates a digital gate pass security token for approved passes
   */
  _generateGatePassToken() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let token = "EOP-SEC-";
    for (let i = 0; i < 4; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Creates a new Outpass Request in the data store
   * @param {Object} data 
   * @returns {Object} Created outpass record
   */
  create(data) {
    // Validation
    const required = [
      "studentId",
      "studentName",
      "hostelBlock",
      "roomNumber",
      "destination",
      "reason",
      "departureTime",
      "expectedReturnTime"
    ];

    for (const field of required) {
      if (!data[field] || String(data[field]).trim() === "") {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const depDate = new Date(data.departureTime);
    const retDate = new Date(data.expectedReturnTime);

    if (isNaN(depDate.getTime())) {
      throw new Error("Invalid departure time");
    }
    if (isNaN(retDate.getTime())) {
      throw new Error("Invalid expected return time");
    }
    if (retDate <= depDate) {
      throw new Error("Expected return time must be after departure time");
    }

    const records = this._readFromFile();
    const id = data.id || this._generateId(records);
    const nowIso = new Date().toISOString();
    const assignedWardenId = resolveWardenId(data.hostelBlock, data.wardenId || data.warden_id);

    const newRecord = {
      id,
      studentId: String(data.studentId || data.student_id).trim().toUpperCase(),
      studentName: String(data.studentName || data.student_name).trim(),
      department: data.department || "Information Technology",
      year: data.year || "3rd Year",
      hostelBlock: String(data.hostelBlock || data.hostel_block).trim(),
      roomNumber: String(data.roomNumber || data.room_number).trim().toUpperCase(),
      studentPhone: data.studentPhone || data.student_phone || "+91 90000 00000",
      parentName: data.parentName || data.parent_name || "Parent / Guardian",
      parentPhone: data.parentPhone || data.parent_phone || "+91 90000 00000",
      parentConsent: data.parentConsent || data.parent_consent || "PENDING_CALL",
      outpassType: data.outpassType || data.outpass_type || "DAY_PASS",
      destination: String(data.destination).trim(),
      reason: String(data.reason).trim(),
      departureTime: depDate.toISOString(),
      expectedReturnTime: retDate.toISOString(),
      actualReturnTime: null,
      outTime: null,
      inTime: null,
      out_time: null,
      in_time: null,
      departureVerifiedAt: null,
      departure_verified_at: null,
      returnVerifiedAt: null,
      return_verified_at: null,
      status: "PENDING",
      wardenId: assignedWardenId,
      warden_id: assignedWardenId,
      wardenRemarks: "",
      reviewedBy: "",
      reviewedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      gatePassToken: null,
      outboundCode: null,
      outbound_code: null,
      inboundCode: null,
      inbound_code: null,
      studentHistory: data.studentHistory || {
        totalOutpassesThisSem: 1,
        onTimeReturns: 1,
        overstays: 0,
        cgpa: "8.50",
        attendance: "90%"
      }
    };

    records.unshift(newRecord); // Place newest at front
    this._writeToFile(records);
    return newRecord;
  }

  /**
   * Retrieves an outpass by ID
   * @param {string} id 
   * @returns {Object|null}
   */
  getById(id) {
    if (!id) return null;
    const records = this._readFromFile();
    return records.find(r => r.id.toLowerCase() === id.toLowerCase()) || null;
  }

  /**
   * Checks whether a student currently has an active unreturned outpass
   * Auto-expires old unused passes where expected return time is in the past
   * @param {string} studentId 
   * @returns {boolean}
   */
  hasActiveOutpass(studentId) {
    if (!studentId) return false;
    const cleanId = String(studentId).trim().toUpperCase();
    const records = this._readFromFile();
    const now = Date.now();

    for (const r of records) {
      const sId = String(r.studentId || r.student_id || "").toUpperCase();
      if (sId === cleanId) {
        const s = String(r.status || "").toUpperCase();
        // If outpass is COMPLETED, REJECTED, EXPIRED, or already returned, it does not block
        if (["COMPLETED", "REJECTED", "EXPIRED", "CANCELLED"].includes(s)) {
          continue;
        }
        if (r.returnVerifiedAt || r.in_time || r.inTime) {
          continue;
        }

        const depTime = new Date(r.departureTime || r.departure_time).getTime();
        const expRet = new Date(r.expectedReturnTime || r.expected_return_time).getTime();

        // If never departed and return or departure window has passed, auto-expire
        if ((s === "PENDING" || s === "APPROVED") && !r.out_time && !r.outTime && !r.departureVerifiedAt) {
          if (expRet < now || depTime < now - 4 * 3600 * 1000) {
            r.status = "EXPIRED";
            continue;
          }
        }

        if (s === "CHECKED-OUT") {
          return true;
        }
        if (s === "APPROVED" && !r.out_time && !r.outTime && depTime >= now - 4 * 3600 * 1000 && expRet >= now) {
          return true;
        }
        if (s === "PENDING" && depTime >= now - 1 * 3600 * 1000 && expRet >= now) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Query outpass requests with filtering and search capabilities
   * @param {Object} filters 
   * @returns {Array} Filtered list
   */
  getAll(filters = {}) {
    let records = this._readFromFile();

    // Filter by Specific Warden ID
    if (filters.wardenId && filters.wardenId !== "ALL") {
      const wId = String(filters.wardenId).trim().toUpperCase();
      records = records.filter(r => {
        const rowWarden = (r.wardenId || r.warden_id || "").toUpperCase();
        return rowWarden === wId || (r.hostelBlock && filters.hostelBlock && r.hostelBlock.toLowerCase().includes(filters.hostelBlock.toLowerCase()));
      });
    }

    // Filter by Status
    if (filters.status && filters.status !== "ALL") {
      const targetStatus = filters.status.toUpperCase();
      records = records.filter(r => (r.status || "").toUpperCase() === targetStatus);
    }

    // Filter by Hostel Block
    if (filters.hostelBlock && filters.hostelBlock !== "ALL") {
      const hb = filters.hostelBlock.toLowerCase();
      records = records.filter(r => {
        if (!r.hostelBlock) return false;
        const rowHb = r.hostelBlock.toLowerCase();
        if (rowHb.includes(hb)) return true;
        if (hb.includes("block b") && (rowHb.includes("cauvery") || rowHb.includes("block b"))) return true;
        if (hb.includes("cauvery") && (rowHb.includes("cauvery") || rowHb.includes("block b"))) return true;
        if (hb.includes("block a") && (rowHb.includes("marutham") || rowHb.includes("block a"))) return true;
        if (hb.includes("marutham") && (rowHb.includes("marutham") || rowHb.includes("block a"))) return true;
        if (hb.includes("block c") && (rowHb.includes("kurunji") || rowHb.includes("bhavani"))) return true;
        if (hb.includes("block d") && (rowHb.includes("ponni") || rowHb.includes("vaigai"))) return true;
        return false;
      });
    }

    // Filter by Outpass Type
    if (filters.outpassType && filters.outpassType !== "ALL") {
      records = records.filter(r => r.outpassType === filters.outpassType);
    }

    // Filter by Student ID
    if (filters.studentId) {
      const sId = String(filters.studentId).trim().toUpperCase();
      records = records.filter(r => String(r.studentId || r.student_id).toUpperCase() === sId);
    }

    // Full-text / Multi-field Search
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      records = records.filter(r => 
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.studentId && r.studentId.toLowerCase().includes(q)) ||
        (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
        (r.destination && r.destination.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.parentPhone && r.parentPhone.includes(q))
      );
    }

    // Sort order: default by creation timestamp descending
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return records;
  }

  /**
   * Query all pending requests
   * @param {Object} filters 
   * @returns {Array}
   */
  getPending(filters = {}) {
    return this.getAll({ ...filters, status: "PENDING" });
  }

  /**
   * Updates review status (Approve / Reject / Checked-Out / Completed) with warden remarks and gate timestamps
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Object} Updated record
   */
  updateStatus(id, updateData = {}) {
    if (!id) throw new Error("Outpass ID is required");
    const {
      status,
      wardenRemarks = "",
      rejectionReason = null,
      reviewedBy = "Hostel Warden",
      outbound_code = null,
      inbound_code = null,
      outboundCode = null,
      inboundCode = null,
      departureVerifiedAt = null,
      departure_verified_at = null,
      returnVerifiedAt = null,
      return_verified_at = null,
      out_time = null,
      outTime = null,
      in_time = null,
      inTime = null
    } = updateData;

    const normalizedStatus = String(status || "").toUpperCase();

    if (!["APPROVED", "REJECTED", "PENDING", "COMPLETED", "CHECKED-OUT", "EXPIRED"].includes(normalizedStatus)) {
      throw new Error(`Invalid status: ${status}. Must be APPROVED, REJECTED, PENDING, CHECKED-OUT, COMPLETED, or EXPIRED.`);
    }

    const records = this._readFromFile();
    const index = records.findIndex(r => r.id.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      throw new Error(`Outpass request with ID ${id} not found.`);
    }

    const current = records[index];
    const nowIso = new Date().toISOString();

    current.status = normalizedStatus;
    if (wardenRemarks) current.wardenRemarks = String(wardenRemarks).trim();
    if (rejectionReason) current.rejectionReason = String(rejectionReason).trim();
    if (reviewedBy) current.reviewedBy = String(reviewedBy).trim();
    current.updatedAt = nowIso;

    const finalOutbound = outbound_code || outboundCode || current.outbound_code || current.outboundCode;
    const finalInbound = inbound_code || inboundCode || current.inbound_code || current.inboundCode;

    if (finalOutbound) {
      current.outbound_code = finalOutbound;
      current.outboundCode = finalOutbound;
    }
    if (finalInbound) {
      current.inbound_code = finalInbound;
      current.inboundCode = finalInbound;
    }

    if (normalizedStatus === "APPROVED") {
      current.reviewedAt = current.reviewedAt || nowIso;
      if (!current.gatePassToken) {
        current.gatePassToken = this._generateGatePassToken();
      }
    } else if (normalizedStatus === "REJECTED") {
      current.gatePassToken = null;
    } else if (normalizedStatus === "CHECKED-OUT") {
      const outTimestamp = out_time || outTime || departure_verified_at || departureVerifiedAt || nowIso;
      current.out_time = outTimestamp;
      current.outTime = outTimestamp;
      current.departure_verified_at = outTimestamp;
      current.departureVerifiedAt = outTimestamp;
    } else if (normalizedStatus === "COMPLETED") {
      const inTimestamp = in_time || inTime || return_verified_at || returnVerifiedAt || nowIso;
      current.in_time = inTimestamp;
      current.inTime = inTimestamp;
      current.return_verified_at = inTimestamp;
      current.returnVerifiedAt = inTimestamp;
      current.actualReturnTime = inTimestamp;
    }

    records[index] = current;
    this._writeToFile(records);
    return current;
  }

  /**
   * Calculates dashboard summary statistics and active metrics
   * @param {Object} filters (e.g. { wardenId: 'WARDEN-MAR' })
   * @returns {Object}
   */
  getStatistics(filters = {}) {
    const records = this.getAll(filters);
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
      // Pending
      if (r.status === "PENDING") {
        pendingCount++;
        const depTime = new Date(r.departureTime);
        if (depTime <= threeHoursFromNow) {
          urgentPending++;
        }
      }

      // Actioned today
      if (r.reviewedAt && String(r.reviewedAt).slice(0, 10) === todayDateStr) {
        if (r.status === "APPROVED") approvedToday++;
        if (r.status === "REJECTED") rejectedToday++;
      }

      // Currently Outside monitoring
      if (r.status === "CHECKED-OUT" || (r.status === "APPROVED" && r.departure_verified_at && !r.return_verified_at)) {
        currentlyOutside++;
      } else if (r.status === "APPROVED") {
        const depTime = new Date(r.departureTime);
        const expRet = new Date(r.expectedReturnTime);
        if (depTime <= now && (!r.actualReturnTime || expRet >= now)) {
          currentlyOutside++;
        }
      }

      // Block distribution
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
  }

  /**
   * Resets database back to default seed data
   */
  resetWithSeed() {
    this._writeToFile(initialOutpasses);
    return { message: "Database reset to initial seed data successfully", count: initialOutpasses.length };
  }
}

// Export singleton instance
const outpassStore = new OutpassStore();

module.exports = {
  OutpassStore,
  outpassStore
};
