// User Repository
// Manages authentication and user profile queries against registered users in the database
// Exactly 26 System Users: 6 Hostels Wardens, 2 Gate Securities, 18 Students across 6 Hostels
// 10-digit Student Registration Numbers (YYYY + Dept + RollNo)

const db = require("../config/db");

// Specific Warden to Hostel Mapping
const HOSTEL_WARDEN_MAP = {
  "marutham": { id: "WARDEN-MAR", name: "Dr. R. Sundaram", hostel: "Marutham (Boys Hostel)", phone: "+91 94432 00001" },
  "kurunji": { id: "WARDEN-KUR", name: "Dr. K. Arumugam", hostel: "Kurunji (Boys Hostel)", phone: "+91 94432 00002" },
  "bhavani": { id: "WARDEN-BHA", name: "Dr. M. Selvam", hostel: "Bhavani (Boys Hostel)", phone: "+91 94432 00003" },
  "cauvery": { id: "WARDEN-CAU", name: "Dr. S. Meenakshi", hostel: "Cauvery (Girls Hostel)", phone: "+91 94432 00004" },
  "ponni": { id: "WARDEN-PON", name: "Dr. P. Lakshmi", hostel: "Ponni (Girls Hostel)", phone: "+91 94432 00005" },
  "vaigai": { id: "WARDEN-VAI", name: "Dr. V. Revathi", hostel: "Vaigai (Girls Hostel)", phone: "+91 94432 00006" }
};

// Registered seed users for testing / offline fallback (EXACTLY 26 USERS)
const registeredUsersStore = new Map([
  // ==========================================================================
  // 6 HOSTEL WARDENS
  // ==========================================================================
  [
    "WARDEN-MAR",
    {
      id: "WARDEN-MAR",
      name: "Dr. R. Sundaram",
      email: "warden.marutham@college.edu",
      password: "warden123",
      role: "WARDEN",
      hostel_block: "Marutham (Boys Hostel)",
      phone: "+91 94432 00001"
    }
  ],
  [
    "WARDEN-KUR",
    {
      id: "WARDEN-KUR",
      name: "Dr. K. Arumugam",
      email: "warden.kurunji@college.edu",
      password: "warden123",
      role: "WARDEN",
      hostel_block: "Kurunji (Boys Hostel)",
      phone: "+91 94432 00002"
    }
  ],
  [
    "WARDEN-BHA",
    {
      id: "WARDEN-BHA",
      name: "Dr. M. Selvam",
      email: "warden.bhavani@college.edu",
      password: "warden123",
      role: "WARDEN",
      hostel_block: "Bhavani (Boys Hostel)",
      phone: "+91 94432 00003"
    }
  ],
  [
    "WARDEN-CAU",
    {
      id: "WARDEN-CAU",
      name: "Dr. S. Meenakshi",
      email: "warden.cauvery@college.edu",
      password: "warden123",
      role: "WARDEN",
      hostel_block: "Cauvery (Girls Hostel)",
      phone: "+91 94432 00004"
    }
  ],
  [
    "WARDEN-PON",
    {
      id: "WARDEN-PON",
      name: "Dr. P. Lakshmi",
      email: "warden.ponni@college.edu",
      password: "warden123",
      role: "WARDEN",
      hostel_block: "Ponni (Girls Hostel)",
      phone: "+91 94432 00005"
    }
  ],
  [
    "WARDEN-VAI",
    {
      id: "WARDEN-VAI",
      name: "Dr. V. Revathi",
      email: "warden.vaigai@college.edu",
      password: "warden123",
      role: "WARDEN",
      hostel_block: "Vaigai (Girls Hostel)",
      phone: "+91 94432 00006"
    }
  ],

  // ==========================================================================
  // 2 DEDICATED GATE SECURITIES (BOYS & GIRLS)
  // ==========================================================================
  [
    "SEC-BOYS",
    {
      id: "SEC-BOYS",
      name: "Officer K. Raman",
      email: "security.boys@college.edu",
      password: "gate123",
      role: "SECURITY",
      hostel_block: "Boys Hostel Gate",
      phone: "+91 94432 00007",
      allowed_gender: "BOYS"
    }
  ],
  [
    "SEC-GIRLS",
    {
      id: "SEC-GIRLS",
      name: "Officer M. Valli",
      email: "security.girls@college.edu",
      password: "gate123",
      role: "SECURITY",
      hostel_block: "Girls Hostel Gate",
      phone: "+91 94432 00008",
      allowed_gender: "GIRLS"
    }
  ],

  // ==========================================================================
  // 18 STUDENTS: 10-DIGIT REGISTRATION NUMBERS (3 STUDENTS PER HOSTEL)
  // ==========================================================================

  // HOSTEL 1: MARUTHAM (BOYS HOSTEL) -> Warden: WARDEN-MAR
  [
    "2024506057",
    {
      id: "2024506057",
      name: "Keertheswar S",
      email: "keertheswar@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Information Technology",
      year: "3rd Year",
      hostel_block: "Marutham (Boys Hostel)",
      room_number: "M-304",
      phone: "+91 98765 43210",
      warden_id: "WARDEN-MAR"
    }
  ],
  [
    "2023506001",
    {
      id: "2023506001",
      name: "Arvind Kumar R",
      email: "arvind.it@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Information Technology",
      year: "4th Year",
      hostel_block: "Marutham (Boys Hostel)",
      room_number: "M-118",
      phone: "+91 91234 56780",
      warden_id: "WARDEN-MAR"
    }
  ],
  [
    "2024501045",
    {
      id: "2024501045",
      name: "Karthik Raja P",
      email: "karthik.cs@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Computer Science",
      year: "3rd Year",
      hostel_block: "Marutham (Boys Hostel)",
      room_number: "M-105",
      phone: "+91 98401 23456",
      warden_id: "WARDEN-MAR"
    }
  ],

  // HOSTEL 2: KURUNJI (BOYS HOSTEL) -> Warden: WARDEN-KUR
  [
    "2023503034",
    {
      id: "2023503034",
      name: "Mohammed Faizal",
      email: "faizal.me@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Mechanical Engineering",
      year: "4th Year",
      hostel_block: "Kurunji (Boys Hostel)",
      room_number: "K-204",
      phone: "+91 96551 23478",
      warden_id: "WARDEN-KUR"
    }
  ],
  [
    "2023504062",
    {
      id: "2023504062",
      name: "Sanjay V",
      email: "sanjay.ee@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Electrical Engineering",
      year: "4th Year",
      hostel_block: "Kurunji (Boys Hostel)",
      room_number: "K-312",
      phone: "+91 99440 98765",
      warden_id: "WARDEN-KUR"
    }
  ],
  [
    "2024506012",
    {
      id: "2024506012",
      name: "Vigneshwaran K",
      email: "vignesh.it@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Information Technology",
      year: "3rd Year",
      hostel_block: "Kurunji (Boys Hostel)",
      room_number: "K-109",
      phone: "+91 98840 12345",
      warden_id: "WARDEN-KUR"
    }
  ],

  // HOSTEL 3: BHAVANI (BOYS HOSTEL) -> Warden: WARDEN-BHA
  [
    "2022502088",
    {
      id: "2022502088",
      name: "Saravanan T",
      email: "saravanan.ec@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Electronics & Communication",
      year: "4th Year",
      hostel_block: "Bhavani (Boys Hostel)",
      room_number: "B-101",
      phone: "+91 97890 22334",
      warden_id: "WARDEN-BHA"
    }
  ],
  [
    "2023501077",
    {
      id: "2023501077",
      name: "Dinesh Babu R",
      email: "dinesh.cs@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Computer Science",
      year: "4th Year",
      hostel_block: "Bhavani (Boys Hostel)",
      room_number: "B-215",
      phone: "+91 98412 33445",
      warden_id: "WARDEN-BHA"
    }
  ],
  [
    "2024503023",
    {
      id: "2024503023",
      name: "Praveen Kumar M",
      email: "praveen.me@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Mechanical Engineering",
      year: "3rd Year",
      hostel_block: "Bhavani (Boys Hostel)",
      room_number: "B-305",
      phone: "+91 94451 99887",
      warden_id: "WARDEN-BHA"
    }
  ],

  // HOSTEL 4: CAUVERY (GIRLS HOSTEL) -> Warden: WARDEN-CAU
  [
    "2023501142",
    {
      id: "2023501142",
      name: "Priya Dharshini M",
      email: "priya.cs@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Computer Science",
      year: "4th Year",
      hostel_block: "Cauvery (Girls Hostel)",
      room_number: "C-214",
      phone: "+91 97890 12345",
      warden_id: "WARDEN-CAU"
    }
  ],
  [
    "2023505015",
    {
      id: "2023505015",
      name: "Sneha Nair",
      email: "sneha.ai@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "AI & Data Science",
      year: "4th Year",
      hostel_block: "Cauvery (Girls Hostel)",
      room_number: "C-108",
      phone: "+91 98945 61234",
      warden_id: "WARDEN-CAU"
    }
  ],
  [
    "2022506115",
    {
      id: "2022506115",
      name: "Deepa Lakshmi V",
      email: "deepa.it@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Information Technology",
      year: "4th Year",
      hostel_block: "Cauvery (Girls Hostel)",
      room_number: "C-305",
      phone: "+91 98421 98765",
      warden_id: "WARDEN-CAU"
    }
  ],

  // HOSTEL 5: PONNI (GIRLS HOSTEL) -> Warden: WARDEN-PON
  [
    "2023507028",
    {
      id: "2023507028",
      name: "Ananya Ramesh",
      email: "ananya.bt@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Biotechnology",
      year: "4th Year",
      hostel_block: "Ponni (Girls Hostel)",
      room_number: "P-115",
      phone: "+91 97900 11223",
      warden_id: "WARDEN-PON"
    }
  ],
  [
    "2024502071",
    {
      id: "2024502071",
      name: "Kavitha S",
      email: "kavitha.ec@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Electronics & Communication",
      year: "3rd Year",
      hostel_block: "Ponni (Girls Hostel)",
      room_number: "P-202",
      phone: "+91 94455 66778",
      warden_id: "WARDEN-PON"
    }
  ],
  [
    "2023506045",
    {
      id: "2023506045",
      name: "Harini Devi K",
      email: "harini.it@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Information Technology",
      year: "4th Year",
      hostel_block: "Ponni (Girls Hostel)",
      room_number: "P-310",
      phone: "+91 96001 22334",
      warden_id: "WARDEN-PON"
    }
  ],

  // HOSTEL 6: VAIGAI (GIRLS HOSTEL) -> Warden: WARDEN-VAI
  [
    "2022501033",
    {
      id: "2022501033",
      name: "Divya Bharathi R",
      email: "divya.cs@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Computer Science",
      year: "4th Year",
      hostel_block: "Vaigai (Girls Hostel)",
      room_number: "V-102",
      phone: "+91 98402 77889",
      warden_id: "WARDEN-VAI"
    }
  ],
  [
    "2023502056",
    {
      id: "2023502056",
      name: "Nandhini M",
      email: "nandhini.ec@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Electronics & Communication",
      year: "4th Year",
      hostel_block: "Vaigai (Girls Hostel)",
      room_number: "V-218",
      phone: "+91 94420 55667",
      warden_id: "WARDEN-VAI"
    }
  ],
  [
    "2024505090",
    {
      id: "2024505090",
      name: "Archana S",
      email: "archana.ai@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "AI & Data Science",
      year: "3rd Year",
      hostel_block: "Vaigai (Girls Hostel)",
      room_number: "V-307",
      phone: "+91 98845 33221",
      warden_id: "WARDEN-VAI"
    }
  ]
]);

// Map of legacy / convenient aliases to primary account keys
// Kept for backwards compatibility without storing duplicate rows in DB
const aliasMap = {
  "23IT101": "2024506057",
  "WARDEN-001": "WARDEN-MAR",
  "WARDEN-002": "WARDEN-CAU",
  "SEC-001": "SEC-BOYS",
  "22EC088": "2023506001",
  "24CS045": "2024501045",
  "23ME034": "2023503034",
  "23EE062": "2023504062",
  "23CS142": "2023501142",
  "23AI015": "2023505015",
  "22IT115": "2022506115",
  "23BT028": "2023507028",
  "24EC071": "2024502071",
  "SUNDARAM@HOSTEL.COLLEGE.EDU": "WARDEN-MAR",
  "MEENAKSHI@HOSTEL.COLLEGE.EDU": "WARDEN-CAU",
  "SECURITY.GATE@COLLEGE.EDU": "SEC-BOYS"
};

class UserRepository {
  /**
   * Get specific warden details assigned to a hostel block
   * @param {string} hostelBlock 
   * @returns {Object|null}
   */
  getWardenForHostel(hostelBlock) {
    if (!hostelBlock) return null;
    const lower = hostelBlock.toLowerCase();
    for (const [key, warden] of Object.entries(HOSTEL_WARDEN_MAP)) {
      if (lower.includes(key)) return { ...warden };
    }
    return null;
  }

  /**
   * Get hostel block managed by a specific warden ID
   * @param {string} wardenId 
   * @returns {string|null}
   */
  getHostelForWarden(wardenId) {
    if (!wardenId) return null;
    const cleanId = String(wardenId).trim().toUpperCase();
    const resolvedId = aliasMap[cleanId] || cleanId;
    for (const warden of Object.values(HOSTEL_WARDEN_MAP)) {
      if (warden.id === resolvedId) return warden.hostel;
    }
    return null;
  }

  /**
   * Find a user by their user ID or email
   * @param {string} identifier 
   * @returns {Promise<Object|null>}
   */
  async findByIdentifier(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim().toUpperCase();
    const resolvedAlias = aliasMap[cleanId] || cleanId;

    try {
      if (db.isPostgresConnected()) {
        const sql = `
          SELECT id, name, email, password, role, hostel_block, phone, warden_id
          FROM users
          WHERE UPPER(id) = $1 OR UPPER(email) = $1 OR UPPER(id) = $2 OR UPPER(email) = $2;
        `;
        const result = await db.query(sql, [cleanId, resolvedAlias]);
        if (result.rows[0]) {
          const user = result.rows[0];
          // If student has no explicit warden_id in DB row, determine it by hostel block
          if (user.role === 'STUDENT' && !user.warden_id && user.hostel_block) {
            const w = this.getWardenForHostel(user.hostel_block);
            if (w) user.warden_id = w.id;
          }
          return user;
        }
      }
    } catch (err) {
      console.warn("[UserRepo] Postgres query failed, falling back to local registered store:", err.message);
    }

    // Direct store check
    if (registeredUsersStore.has(cleanId)) {
      return { ...registeredUsersStore.get(cleanId) };
    }
    if (registeredUsersStore.has(resolvedAlias)) {
      return { ...registeredUsersStore.get(resolvedAlias) };
    }

    // Iterative store search across all fields and emails
    for (const [key, user] of registeredUsersStore.entries()) {
      if (
        key.toUpperCase() === cleanId ||
        user.email.toUpperCase() === cleanId ||
        key.toUpperCase() === resolvedAlias ||
        user.email.toUpperCase() === resolvedAlias
      ) {
        return { ...user };
      }
    }
    return null;
  }

  /**
   * Verify user credentials against database
   * @param {string} identifier - User ID (Roll No / Warden ID) or Email
   * @param {string} password - User password
   * @returns {Promise<Object|null>} User profile without password if matched, else null
   */
  async verifyCredentials(identifier, password) {
    if (!identifier || !password) return null;

    const user = await this.findByIdentifier(identifier);
    if (!user) return null; // Not registered in DB

    // Check password
    if (user.password !== password) {
      return null; // Invalid credentials
    }

    // Return safe user profile (omit password)
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Get all registered users (for admin / debugging / counting)
   * Guaranteed to return exactly the registered users (26 in production)
   * @returns {Promise<Array>}
   */
  async getAllUsers() {
    try {
      if (db.isPostgresConnected()) {
        const sql = `
          SELECT id, name, email, role, hostel_block, phone, warden_id, created_at
          FROM users
          WHERE id IN (
            'WARDEN-MAR', 'WARDEN-KUR', 'WARDEN-BHA', 'WARDEN-CAU', 'WARDEN-PON', 'WARDEN-VAI',
            'SEC-BOYS', 'SEC-GIRLS',
            '2024506057', '2023506001', '2024501045',
            '2023503034', '2023504062', '2024506012',
            '2022502088', '2023501077', '2024503023',
            '2023501142', '2023505015', '2022506115',
            '2023507028', '2024502071', '2023506045',
            '2022501033', '2023502056', '2024505090'
          )
          ORDER BY role, name ASC;
        `;
        const result = await db.query(sql);
        if (result.rows && result.rows.length > 0) {
          return result.rows;
        }
      }
    } catch (err) {
      console.warn("[UserRepo] Failed to fetch users from Postgres, returning fallback store:", err.message);
    }

    return Array.from(registeredUsersStore.values()).map(user => {
      const { password: _, ...safeUser } = user;
      return safeUser;
    });
  }
}

module.exports = new UserRepository();
module.exports.HOSTEL_WARDEN_MAP = HOSTEL_WARDEN_MAP;
module.exports.aliasMap = aliasMap;
