# E-Outpass System: Database Setup & Integration Guide

This guide explains how to set up the database in **pgAdmin 4 (PostgreSQL)** or **MongoDB**, run migrations, and test the two assigned modules:
1. **`[SCRUM06B-F002-DB-001] Outpass Status History`**
2. **`[SCRUM06B-F002-BE-001] Outpass Approval/Rejection API`**

---

## Option 1: Setting Up in pgAdmin 4 (PostgreSQL) — Recommended

Your computer already has **PostgreSQL 18** and **pgAdmin 4** installed and running.

### Step 1: Open pgAdmin 4
1. Press the **Windows Key**, type `pgAdmin 4`, and launch the app.
2. Enter your master password when prompted to unlock pgAdmin.

### Step 2: Create the Database `e_outpass_db`
1. In the left tree-view, expand **Servers** -> **PostgreSQL 18**.
2. Right-click on **Databases** -> select **Create** -> **Database...**.
3. In the dialog, set the Database name to:
   ```text
   e_outpass_db
   ```
4. Click **Save**.

### Step 3: Execute the Schema DDL (Module 1)
1. In the left panel, click on the newly created **`e_outpass_db`**.
2. Click **Tools** in the top menu -> select **Query Tool** (or press the Query Tool icon).
3. Open the file `src/db/schema.sql` located at:
   ```text
   c:\Users\admin\Desktop\college needs\IOC-Keertheswar\src\db\schema.sql
   ```
   *(Or copy-paste the contents of `schema.sql` into the Query Tool)*.
4. Click the **Execute / Run** button (or press **F5**).
5. You will see:
   ```text
   CREATE TABLE
   CREATE TABLE
   CREATE TABLE
   CREATE INDEX
   CREATE INDEX
   CREATE INDEX
   Query returned successfully.
   ```
   This creates:
   - `users`: Wardens and Students
   - `outpass_requests`: Existing master request table
   - `outpass_status_history`: **[SCRUM06B-F002-DB-001]** Status history audit table with composite index `idx_status_history_chronological`

### Step 4: Insert Initial Seed Records
1. In the same Query Tool, paste the contents of `src/db/seeds.sql`.
2. Click **Execute / Run (F5)**.
3. This populates sample wardens (`WARDEN-001`), students (`23IT101`, etc.), and pending outpasses (`OP-2026-001`).

### Step 5: Configure `.env` Password
Open `.env` in the project root:
```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=e_outpass_db
PGUSER=postgres
PGPASSWORD=YOUR_PGADMIN_PASSWORD_HERE
```
Replace `YOUR_PGADMIN_PASSWORD_HERE` with the password you use when opening pgAdmin.

---

## Option 2: Using Online MongoDB Atlas

If your team decides to use your online MongoDB database:
1. In `.env`, add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/e_outpass_db?retryWrites=true&w=majority
   ```
2. The Outpass Status History collection schema is:
   ```json
   {
     "_id": ObjectId("..."),
     "outpassId": "OP-2026-001",
     "previousStatus": "PENDING",
     "newStatus": "APPROVED",
     "changedBy": "WARDEN-001",
     "changedByRole": "WARDEN",
     "changedAt": ISODate("2026-09-17T23:20:00Z"),
     "remarks": "Approved for weekend leave",
     "rejectionReason": null
   }
   ```

---

## Assigned Modules Technical Reference

### 1. Database Schema (`[SCRUM06B-F002-DB-001]`)

```sql
CREATE TABLE outpass_status_history (
    id SERIAL PRIMARY KEY,
    outpass_id VARCHAR(50) NOT NULL REFERENCES outpass_requests(id) ON DELETE CASCADE,
    previous_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL CHECK (new_status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'COMPLETED')),
    changed_by VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    changed_by_role VARCHAR(20) NOT NULL CHECK (changed_by_role IN ('STUDENT', 'WARDEN', 'ADMIN')),
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks TEXT,
    rejection_reason TEXT
);

-- Optimization & Chronological Retrieval Indexes
CREATE INDEX idx_status_history_outpass_id ON outpass_status_history(outpass_id);
CREATE INDEX idx_status_history_changed_at ON outpass_status_history(changed_at ASC);
CREATE INDEX idx_status_history_chronological ON outpass_status_history(outpass_id, changed_at ASC);
```

### 2. Backend APIs (`[SCRUM06B-F002-BE-001]`)

#### A. Approve Outpass
- **Endpoint**: `POST /api/outpasses/:id/approve`
- **Headers**:
  ```http
  Content-Type: application/json
  x-user-id: WARDEN-001
  x-user-role: WARDEN
  ```
- **Request Body**:
  ```json
  {
    "remarks": "Approved for family function. Return before 8:00 PM."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Outpass request 'OP-2026-001' approved successfully.",
    "data": {
      "outpass": {
        "id": "OP-2026-001",
        "status": "APPROVED",
        "approved_by": "WARDEN-001",
        "warden_remarks": "Approved for family function. Return before 8:00 PM."
      },
      "statusHistory": {
        "id": 1,
        "outpass_id": "OP-2026-001",
        "previous_status": "PENDING",
        "new_status": "APPROVED",
        "changed_by": "WARDEN-001",
        "changed_by_role": "WARDEN",
        "changed_at": "2026-09-17T17:51:06.000Z",
        "remarks": "Approved for family function. Return before 8:00 PM."
      }
    }
  }
  ```

#### B. Reject Outpass
- **Endpoint**: `POST /api/outpasses/:id/reject`
- **Headers**:
  ```http
  Content-Type: application/json
  x-user-id: WARDEN-001
  x-user-role: WARDEN
  ```
- **Request Body**:
  ```json
  {
    "rejectionReason": "Curfew restriction: night passes not allowed during exam week.",
    "remarks": "Please apply for regular day pass instead."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Outpass request 'OP-2026-002' rejected successfully.",
    "data": {
      "outpass": {
        "id": "OP-2026-002",
        "status": "REJECTED",
        "rejection_reason": "Curfew restriction: night passes not allowed during exam week."
      },
      "statusHistory": {
        "id": 2,
        "outpass_id": "OP-2026-002",
        "previous_status": "PENDING",
        "new_status": "REJECTED",
        "changed_by": "WARDEN-001",
        "changed_by_role": "WARDEN",
        "rejection_reason": "Curfew restriction: night passes not allowed during exam week."
      }
    }
  }
  ```

#### C. Get Chronological Status History
- **Endpoint**: `GET /api/outpasses/:id/history`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "outpassId": "OP-2026-001",
      "currentStatus": "APPROVED",
      "historyCount": 2,
      "history": [
        {
          "id": 1,
          "outpass_id": "OP-2026-001",
          "previous_status": "NONE",
          "new_status": "PENDING",
          "changed_by": "23IT101",
          "changed_by_role": "STUDENT",
          "changed_at": "2026-09-17T16:00:00.000Z",
          "remarks": "Initial application submitted."
        },
        {
          "id": 2,
          "outpass_id": "OP-2026-001",
          "previous_status": "PENDING",
          "new_status": "APPROVED",
          "changed_by": "WARDEN-001",
          "changed_by_role": "WARDEN",
          "changed_at": "2026-09-17T17:51:00.000Z",
          "remarks": "Approved for family function."
        }
      ]
    }
  }
  ```

---

## Running the Automated Test Suite

To verify all test cases (successful approval, successful rejection, invalid outpass ID, unauthorized access, invalid transitions, and status-history creation):

```bash
npm test
```
