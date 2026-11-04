const jwt = require("jsonwebtoken");

// Verifies the Bearer token and exposes the caller as req.user = { email, role }.
const jwtMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json("Authentication required");
  }

  try {
    const { email, role } = jwt.verify(token, process.env.JWT_KEY);
    req.user = { email, role };
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired, please log in again"
        : "Invalid token";
    return res.status(401).json(message);
  }
};

module.exports = jwtMiddleware;
