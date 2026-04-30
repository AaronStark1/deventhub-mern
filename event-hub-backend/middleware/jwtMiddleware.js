const jwt = require("jsonwebtoken");

const jwtMiddleware = (req, res, next) => {
  console.log("Inside JWT Middleware");

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const jwtKey = process.env.JWT_KEY;

    const decoded = jwt.verify(token, jwtKey);

    // Attach logged-in user email
    req.payload = decoded.email;
    req.role = decoded.role;

    next();
  } catch (err) {
    return res.status(401).json("Authorization Error");
  }
};

module.exports = jwtMiddleware;
