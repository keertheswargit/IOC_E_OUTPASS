// [SCRUM06B-F002-DB-001] Outpass Status History Repository
// Manages database persistence and chronological audit retrieval for outpass status transitions

const db = require("../config/db");

// In-memory fallback storage for tests/offline environments
const memoryHistoryStore = [];

class StatusHistoryRepository {
  /**
   * Records a new status transition entry in outpass_status_history table
   * @param {Object} entryData
   * @param {string} entryData.outpassId - Reference to outpass request
   * @param {string} entryData.previousStatus - Previous status (e.g. 'PENDING')
   * @param {string} entryData.newStatus - New status ('APPROVED', 'REJECTED', etc.)
   * @param {string} entryData.changedBy - User ID of actor making change
   * @param {string} entryData.changedByRole - Role of actor ('WARDEN', 'STUDENT', 'ADMIN')
   * @param {string} [entryData.remarks] - Warden remarks or explanatory note
   * @param {string} [entryData.rejectionReason] - Specific rejection reason
   * @param {Object} [client] - Optional active PostgreSQL transaction client
   * @returns {Promise<Object>} Created history record
   */
  async createHistoryEntry({
    outpassId,
    previousStatus,
    newStatus,
    changedBy,
    changedByRole,
    remarks = null,
    rejectionReason = null,
    out_time = null,
    in_time = null
  }, client = null) {
    if (!outpassId) throw new Error("outpassId is required for status history");
    if (!previousStatus) throw new Error("previousStatus is required for status history");
    if (!newStatus) throw new Error("newStatus is required for status history");
    if (!changedBy) throw new Error("changedBy is required for status history");
    if (!changedByRole) throw new Error("changedByRole is required for status history");

    let resolvedChangedBy = changedBy;
    try {
      const { aliasMap } = require("./userRepository");
      if (aliasMap && aliasMap[changedBy]) {
        resolvedChangedBy = aliasMap[changedBy];
      }
    } catch (e) {}

    // Try PostgreSQL
    try {
      const queryRunner = client || db;
      const sql = `
        INSERT INTO outpass_status_history (
          outpass_id, previous_status, new_status, changed_by, changed_by_role, remarks, rejection_reason, out_time, in_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, outpass_id, previous_status, new_status, changed_by, changed_by_role, changed_at, remarks, rejection_reason, out_time, in_time;
      `;
      const values = [
        outpassId,
        previousStatus,
        newStatus,
        resolvedChangedBy,
        changedByRole,
        remarks,
        rejectionReason,
        out_time,
        in_time
      ];
      const result = await queryRunner.query(sql, values);
      return result.rows[0];
    } catch (pgError) {
      // Fallback for standalone/mock mode if PostgreSQL is unreachable
      if (pgError.code === "ECONNREFUSED" || pgError.code === "28P01" || pgError.code === "3D000" || !db.isPostgresConnected()) {
        const fallbackRecord = {
          id: memoryHistoryStore.length + 1,
          outpass_id: outpassId,
          previous_status: previousStatus,
          new_status: newStatus,
          changed_by: changedBy,
          changed_by_role: changedByRole,
          changed_at: new Date().toISOString(),
          remarks: remarks || null,
          rejection_reason: rejectionReason || null
        };
        memoryHistoryStore.push(fallbackRecord);
        return fallbackRecord;
      }
      throw pgError;
    }
  }

  /**
   * Retrieves the complete chronological status change history for an outpass
   * @param {string} outpassId
   * @param {Object} [client]
   * @returns {Promise<Array>} Chronologically sorted history records (oldest to newest)
   */
  async getHistoryByOutpassId(outpassId, client = null) {
    if (!outpassId) throw new Error("outpassId is required");

    try {
      const queryRunner = client || db;
      const sql = `
        SELECT 
          h.id,
          h.outpass_id,
          h.previous_status,
          h.new_status,
          h.changed_by,
          h.changed_by_role,
          h.changed_at,
          h.remarks,
          h.rejection_reason,
          u.name as changed_by_name
        FROM outpass_status_history h
        LEFT JOIN users u ON h.changed_by = u.id
        WHERE h.outpass_id = $1
        ORDER BY h.changed_at ASC, h.id ASC;
      `;
      const result = await queryRunner.query(sql, [outpassId]);
      return result.rows;
    } catch (pgError) {
      if (pgError.code === "ECONNREFUSED" || pgError.code === "28P01" || pgError.code === "3D000" || !db.isPostgresConnected()) {
        return memoryHistoryStore
          .filter(h => h.outpass_id === outpassId)
          .sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at));
      }
      throw pgError;
    }
  }

  /**
   * Clears the in-memory fallback store (used in tests)
   */
  _clearMemoryStore() {
    memoryHistoryStore.length = 0;
  }
}

module.exports = new StatusHistoryRepository();
