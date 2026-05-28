const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/tahap — daftar tahap seleksi
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nama, urutan, deskripsi FROM tahap_seleksi ORDER BY urutan ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
