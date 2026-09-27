// Authentication Controller
// Handles role-specific login validation, ensuring only registered users in DB can log in

const userRepository = require("../repositories/userRepository");

class AuthController {
  /**
   * POST /api/auth/login
   * Validates user credentials against database and enforces portal role
   */
  async login(req, res) {
    try {
      const email = req.body.email || req.body.identifier;
      const password = req.body.password;
      const targetRole = req.body.targetRole || req.body.portalRole || req.body.role || req.body.portal;

      // 1. Missing email or password validation
      if (!email || !String(email).trim() || !password || !String(password).trim()) {
        const msg = "Email and password are required fields.";
        return res.status(400).json({
          success: false,
          message: msg,
          error: msg
        });
      }

      const trimmedEmail = String(email).trim();

      // 2. Malformed email validation: if email field is provided or contains @, check format
      if (req.body.email !== undefined || trimmedEmail.includes("@")) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          const msg = "Invalid email address format.";
          return res.status(400).json({
            success: false,
            message: msg,
            error: msg
          });
        }
      }

      // 3. Look up user strictly in database (with registered store fallback)
      const user = await userRepository.findByIdentifier(trimmedEmail);
      if (!user) {
        const msg = "User not found in database. Please check your credentials or register.";
        return res.status(404).json({
          success: false,
          message: msg,
          error: msg
        });
      }

      // 4. Verify password
      if (user.password !== password) {
        const msg = "Incorrect password. Please try again.";
        return res.status(401).json({
          success: false,
          message: msg,
          error: msg
        });
      }

      // 5. Enforce strict portal-level role segregation
      if (targetRole) {
        const normalizedTarget = String(targetRole).trim().toUpperCase();
        const normalizedUserRole = String(user.role).trim().toUpperCase();

        const roleAliases = {
          GATE: "SECURITY",
          SECURITY: "SECURITY",
          STUDENT: "STUDENT",
          WARDEN: "WARDEN",
          ADMIN: "ADMIN"
        };

        const targetGroup = roleAliases[normalizedTarget] || normalizedTarget;
        const userGroup = roleAliases[normalizedUserRole] || normalizedUserRole;

        if (targetGroup !== userGroup) {
          const roleDisplay = targetRole.charAt(0).toUpperCase() + targetRole.slice(1).toLowerCase();
          const msg = `Access Denied: You are not authorized to log in through the ${roleDisplay} portal. Please use your designated login page. (Account is registered as a ${user.role}).`;
          return res.status(403).json({
            success: false,
            message: msg,
            error: msg
          });
        }
      }

      // 6. Generate session token and redirect URL
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        timestamp: Date.now()
      };
      const token = "jwt_" + Buffer.from(JSON.stringify(tokenPayload)).toString("base64");

      let redirectUrl = "/";
      const uRole = (user.role || "").toUpperCase();
      if (uRole === "STUDENT") redirectUrl = "/student-dashboard";
      else if (uRole === "WARDEN" || uRole === "ADMIN") redirectUrl = "/warden-dashboard";
      else if (uRole === "SECURITY" || uRole === "GATE") redirectUrl = "/security-gate.html";

      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}! Login successful.`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hostel_block: user.hostel_block,
          phone: user.phone
        },
        redirectUrl
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Server error during authentication: " + err.message,
        error: "Server error during authentication: " + err.message
      });
    }
  }

  /**
   * GET /api/auth/me
   * Fetches currently active user details
   */
  async getMe(req, res) {
    try {
      const userId = req.headers["x-user-id"];
      if (!userId) {
        return res.status(401).json({ success: false, error: "Not logged in" });
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found in database" });
      }

      return res.status(200).json({ success: true, user });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully."
    });
  }
}

module.exports = new AuthController();
