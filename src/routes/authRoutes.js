// Authentication Routes
// Endpoints for Student and Warden login

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", (req, res) => authController.login(req, res));
router.get("/me", (req, res) => authController.getMe(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));

module.exports = router;
