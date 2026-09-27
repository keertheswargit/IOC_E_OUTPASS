// Authentication and Role-Based Authorization Middleware
// Enforces that only authorized hostel wardens can review outpass requests

/**
 * Middleware ensuring the requester has the 'WARDEN' role
 */
function requireWarden(req, res, next) {
  // Extract user info from headers or request body (flexible for team integration & testing)
  const userId = req.headers["x-user-id"] || (req.user && req.user.id) || req.body.wardenId;
  const userRole = (req.headers["x-user-role"] || (req.user && req.user.role) || req.body.userRole || "").toUpperCase();
  const userName = req.headers["x-user-name"] || (req.user && req.user.name) || req.body.wardenName || "Dr. R. Sundaram";

  // Check authentication
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please provide a valid warden user identifier."
    });
  }

  // Check authorization: must be WARDEN or ADMIN
  if (userRole !== "WARDEN" && userRole !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: `Access denied. Requester role '${userRole || 'UNKNOWN'}' is not authorized. Only designated hostel wardens can approve or reject outpass requests.`
    });
  }

  // Attach verified warden user object to request
  req.wardenUser = {
    id: userId,
    name: userName,
    role: userRole
  };

  next();
}

module.exports = {
  requireWarden
};
