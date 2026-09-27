// [SCRUM06B-F002-BE-001] & [SCRUM06B-F002-DB-001] Router Definition
// Exposes REST APIs for Warden Approval/Rejection and Status History

const express = require("express");
const router = express.Router();
const approvalController = require("../controllers/approvalController");
const { requireWarden } = require("../middleware/authMiddleware");

// 1. Approve Outpass Request (Warden Only)
router.post("/:id/approve", requireWarden, (req, res) => {
  approvalController.approveOutpass(req, res);
});

// 2. Reject Outpass Request (Warden Only, Requires Rejection Reason)
router.post("/:id/reject", requireWarden, (req, res) => {
  approvalController.rejectOutpass(req, res);
});

// 3. Unified Status Update Endpoint (Warden Only)
router.patch("/:id/status", requireWarden, (req, res) => {
  approvalController.updateStatus(req, res);
});

// 4. Retrieve Chronological Status History (MODULE 1: [SCRUM06B-F002-DB-001])
router.get("/:id/history", (req, res) => {
  approvalController.getStatusHistory(req, res);
});

module.exports = router;
