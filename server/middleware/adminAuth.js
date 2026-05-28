const jwt = require("jsonwebtoken");
require("dotenv").config();

function adminAuth(req, res, next) {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token tidak ditemukan." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin" && decoded.role !== "hrd") {
      return res.status(403).json({ message: "Akses ditolak. Hanya admin/HRD." });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token tidak valid." });
  }
}

module.exports = adminAuth;
