const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET daftar dokumen milik user
router.get("/", auth, async (req, res) => {
  try {
    const [lamaranRows] = await db.query(
      `SELECT id FROM lamaran WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!lamaranRows.length) {
      return res.json([]);
    }

    const lamaranId = lamaranRows[0].id;

    const [dokumen] = await db.query(
      `SELECT id, jenis_dokumen, nama_file, file_url, ukuran_file,
              status_verifikasi, created_at
       FROM dokumen_lamaran
       WHERE lamaran_id = ?
       ORDER BY created_at ASC`,
      [lamaranId]
    );

    res.json(dokumen);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST catat dokumen baru (metadata only, file di-handle terpisah)
router.post("/", auth, async (req, res) => {
  try {
    const { jenisDokumen, namaFile, fileUrl, ukuranFile } = req.body;

    const [lamaranRows] = await db.query(
      `SELECT id FROM lamaran WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!lamaranRows.length) {
      return res.status(400).json({ error: "Belum ada lamaran aktif" });
    }

    const lamaranId = lamaranRows[0].id;

    await db.query(
      `INSERT INTO dokumen_lamaran (lamaran_id, jenis_dokumen, nama_file, file_url, ukuran_file)
       VALUES (?, ?, ?, ?, ?)`,
      [lamaranId, jenisDokumen, namaFile, fileUrl || namaFile, ukuranFile || 0]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE dokumen
router.delete("/:id", auth, async (req, res) => {
  try {
    const [lamaranRows] = await db.query(
      `SELECT id FROM lamaran WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!lamaranRows.length) return res.status(400).json({ error: "Tidak ada lamaran" });

    await db.query(
      `DELETE FROM dokumen_lamaran WHERE id = ? AND lamaran_id = ?`,
      [req.params.id, lamaranRows[0].id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
