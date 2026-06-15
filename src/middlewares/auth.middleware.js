const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { sendError } = require("../utils/response.util");

/**
 * Protect routes - JWT authentication verification
 */
const protect = async (req, res, next) => {
  let token;

  // Check if authorization header starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return sendError(res, "Not authorized to access this route. Token missing.", null, 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, "User matching this token does not exist.", null, 404);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Token has expired, please refresh token.", error, 401);
    }
    return sendError(res, "Not authorized, invalid token.", error, 401);
  }
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "User context not found.", null, 500);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `User role '${req.user.role}' is not authorized to access this route.`,
        null,
        403
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
