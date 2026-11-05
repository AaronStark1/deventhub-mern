// Use after jwtMiddleware: rejects callers whose token role doesn't match.
const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json(`Only ${role}s can perform this action`);
  }
  next();
};

module.exports = requireRole;
