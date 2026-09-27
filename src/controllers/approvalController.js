// [SCRUM06B-F002-BE-001] Outpass Approval/Rejection Controller
// Handles HTTP request validation, error formatting, and response dispatch

const approvalService = require("../services/approvalService");

class ApprovalController {
  /**
   * POST /api/outpasses/:id/approve
   * Approves a pending outpass request and records status history
   */
  async approveOutpass(req, res) {
    try {
      const outpassId = req.params.id;
      const { remarks } = req.body;

      const result = await approvalService.processDecision({
        outpassId,
        action: "APPROVE",
        remarks,
        wardenUser: req.wardenUser
      });

      return res.status(200).json({
        success: true,
        message: `Outpass request '${outpassId}' approved successfully.`,
        data: {
          outpass: result.outpass,
          statusHistory: result.historyEntry
        }
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || "Internal server error occurred while approving outpass."
      });
    }
  }

  /**
   * POST /api/outpasses/:id/reject
   * Rejects a pending outpass request with mandatory reason and records status history
   */
  async rejectOutpass(req, res) {
    try {
      const outpassId = req.params.id;
      const { rejectionReason, reason, remarks } = req.body;
      const finalReason = rejectionReason || reason;

      const result = await approvalService.processDecision({
        outpassId,
        action: "REJECT",
        rejectionReason: finalReason,
        remarks: remarks || finalReason,
        wardenUser: req.wardenUser
      });

      return res.status(200).json({
        success: true,
        message: `Outpass request '${outpassId}' rejected successfully.`,
        data: {
          outpass: result.outpass,
          statusHistory: result.historyEntry
        }
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || "Internal server error occurred while rejecting outpass."
      });
    }
  }

  /**
   * PATCH /api/outpasses/:id/status
   * Unified REST endpoint for status updates
   */
  async updateStatus(req, res) {
    try {
      const outpassId = req.params.id;
      const { status, action, remarks, rejectionReason, reason } = req.body;

      let determinedAction = action;
      if (!determinedAction && status) {
        determinedAction = status.toUpperCase() === "APPROVED" ? "APPROVE" : "REJECT";
      }

      const result = await approvalService.processDecision({
        outpassId,
        action: determinedAction,
        rejectionReason: rejectionReason || reason,
        remarks,
        wardenUser: req.wardenUser
      });

      return res.status(200).json({
        success: true,
        message: `Outpass status updated to '${result.outpass.status}' successfully.`,
        data: {
          outpass: result.outpass,
          statusHistory: result.historyEntry
        }
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || "Internal server error occurred while updating status."
      });
    }
  }

  /**
   * GET /api/outpasses/:id/history
   * Retrieves the complete chronological status history for an outpass (MODULE 1)
   */
  async getStatusHistory(req, res) {
    try {
      const outpassId = req.params.id;
      const historyData = await approvalService.getStatusHistory(outpassId);

      return res.status(200).json({
        success: true,
        data: historyData
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || "Internal server error occurred while retrieving history."
      });
    }
  }
}

module.exports = new ApprovalController();
