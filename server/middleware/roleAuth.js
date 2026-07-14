const jwt = require("jsonwebtoken");
require("dotenv").config();

function requireRole(...roles) {
  return function (req, res, next) {
    const token = (req.headers["authorization"] || "").split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token tidak ditemukan." });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Akses ditolak." });
      }
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: "Token tidak valid." });
    }
  };
}

module.exports = requireRole;
