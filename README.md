# E-Outpass – A Smart Hostel Permission Management System

A digital outpass and hostel movement tracking system replacing manual paper-based approval workflows with an automated, auditable, and transparent digital platform.

---

## Assigned Scrum Tasks

This repository implements the two core assigned modules:

| Task ID | Component | Description |
|---|---|---|
| **`[SCRUM06B-F001-DB-001]`** | **Outpass Request Data Store** | Persistent data storage engine, schema validation, multi-field filtering, full-text search, status transitions, digital gate token generation, and audit metrics. |
| **`[SCRUM06B-F002-UI-001]`** | **Warden Pending-Requests Review Screen** | High-performance responsive web dashboard for hostel wardens to review student credentials, verify guardian consent, inspect travel timelines, approve/reject requests with remarks, and monitor live off-campus students. |

---

## System Architecture

```
IOC-Keertheswar/
├── public/                     # Frontend Client (SCRUM06B-F002-UI-001)
│   ├── index.html              # Modern semantic HTML5 dashboard with <dialog closedby="any">
│   ├── css/
│   │   └── style.css           # Clean CSS design system with custom properties & responsive layout
│   └── js/
│       └── app.js              # REST client, light-dismiss modal handlers, search debounce, toast alerts
├── src/
│   ├── db/                     # Data Layer (SCRUM06B-F001-DB-001)
│   │   ├── outpassStore.js     # Persistent CRUD, validation, indexing, and metrics engine
│   │   └── seedData.js         # Realistic initial hostel student dataset
│   ├── data/
│   │   └── outpass_records.json # Atomic JSON persistent data store
│   └── server.js               # Express REST API backend
├── tests/
│   ├── outpassStore.test.js    # Data store automated unit tests
│   └── server.test.js          # REST API endpoint integration tests
└── package.json
```

---

## Features

### 1. Warden Pending-Requests Review Screen (`[SCRUM06B-F002-UI-001]`)
- **Live KPI Stat Cards**: Instant counters for Pending Approvals (pulsating indicator), Approved Today, Rejected Today, and Students Currently Outside.
- **Urgency Detection**: Automatically flags requests scheduled to depart within 3 hours and prioritizes medical/emergency passes.
- **Multi-Factor Search & Filtering**: Instant search across Student Name, Roll Number, Room Number, Destination, and Parent Phone, with block-wise and pass-type dropdown filters.
- **Deep Verification Modal**:
  - Student photo avatar, academic info (Year, Department, Room, Attendance %, CGPA).
  - Outpass historical discipline track (Total outpasses taken this semester, on-time returns, past overstays).
  - Parent/Guardian contact card with click-to-call link and instant consent status toggle.
  - Quick-preset rejection buttons ("Parent Unreachable", "Curfew Limit Exceeded", "Academic Conflict / Exam", "Outpass Quota Exceeded").
- **Digital E-Outpass Generator**: Generates a printable movement authorization pass complete with unique security token (e.g. `EOP-SEC-8921`), validity window, and simulated gate verification QR code.
- **Student Request Simulator**: Built-in simulator form allowing examiners to submit a live student outpass and observe it dynamically appear on the warden's queue in real time.

### 2. Outpass Request Data Store (`[SCRUM06B-F001-DB-001]`)
- **Persistent Storage**: Atomic file writing pattern preventing file corruption during power interruptions or concurrent writes.
- **Schema & Validation**: Ensures mandatory presence of Roll No, Student Name, Room, Destination, Reason, Parent Phone, and validates chronological consistency (`departureTime < expectedReturnTime`).
- **Standardized ID Generation**: Auto-increments formatted IDs (e.g. `OP-2026-001`, `OP-2026-002`).
- **Audit & Timestamps**: Maintains `createdAt`, `updatedAt`, `reviewedAt`, and records the approving warden's identity and remarks.
- **Gate Security Token**: Automatically issues a cryptographically random token upon approval for gate security checks.

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Returns real-time KPI metrics (pending, approved, outside, urgent counts) |
| `GET` | `/api/outpasses/pending` | Retrieves all pending requests with optional block, type, and search filters |
| `GET` | `/api/outpasses` | Retrieves all historical and active outpasses |
| `GET` | `/api/outpasses/:id` | Retrieves a specific outpass by ID |
| `POST` | `/api/outpasses` | Submits a new outpass request (Used by Student Form / Simulator) |
| `PATCH` | `/api/outpasses/:id/status` | Updates request status (`APPROVED` / `REJECTED`) with warden remarks |
| `POST` | `/api/reset-seed` | Resets the persistent store back to default seed data for viva demonstrations |

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   node tests/server.test.js
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Access the dashboard**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## Viva & Lab Demonstration Steps

1. **Start the server**: Run `npm start` and open `http://localhost:3000`.
2. **Review Pending Requests**: Examine the list of pending outpasses with color-coded urgency and parent consent tags.
3. **Inspect Student Profile**: Click **"Review & Verify"** on any request. Show the professor the student's CGPA, attendance, semester outpass history, and parent contact details.
4. **Call & Verify Parent**: Click **"Mark Consent Confirmed"** to log guardian confirmation.
5. **Approve Request**: Click **"Approve & Issue E-Outpass"**. Show the generated **Digital Gate Outpass** modal with gate security token and printable format.
6. **Reject Request**: Click **"Review & Verify"** or quick reject on a request, click a standard preset reason (e.g. *"Curfew Limit Exceeded"*), and submit rejection.
7. **Simulate Live Student Request**: Click **"+ Test Student Request"** in the top navigation bar, submit a new request, and watch it instantly appear at the top of the warden's queue!
8. **Reset Demo**: Click **"Reset Demo Data"** at any time to return to the original clean state.
