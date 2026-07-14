const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const trainingAuth = require("../middleware/trainingAuth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// GET /api/materi-training — daftar materi
// Staff (admin/hrd/manajer_training) selalu boleh. Pelamar hanya boleh jika lamarannya diterima (US-020).
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role === "pelamar") {
      const [lulus] = await db.query(
        `SELECT id FROM lamaran WHERE user_id = ? AND status = 'diterima' LIMIT 1`,
        [req.user.id]
      );
      if (!lulus.length) {
        return res.status(403).json({ message: "Anda belum memiliki akses ke halaman ini" });
      }
    }

    const [rows] = await db.query(
      `SELECT id, judul, deskripsi, nama_file, file_url, ukuran_file, pemateri_nama, created_at
       FROM materi_training ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/materi-training/admin — tambah materi baru
router.post("/admin", trainingAuth, upload.single("file"), async (req, res) => {
  try {
    const { judul, deskripsi, pemateriNama } = req.body;
    if (!judul || !pemateriNama) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Judul dan pemateri wajib diisi" });
    }
    if (!req.file) return res.status(400).json({ error: "File materi wajib diunggah" });

    const fileUrl = `/uploads/${req.file.filename}`;
    const [result] = await db.query(
      `INSERT INTO materi_training (judul, deskripsi, nama_file, file_url, ukuran_file, pemateri_nama, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [judul, deskripsi || null, req.file.originalname, fileUrl, req.file.size, pemateriNama, req.user.id]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Materi berhasil ditambahkan" });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/materi-training/admin/:id — edit materi (file opsional)
router.put("/admin/:id", trainingAuth, upload.single("file"), async (req, res) => {
  try {
    const { judul, deskripsi, pemateriNama } = req.body;
    if (!judul || !pemateriNama) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Judul dan pemateri wajib diisi" });
    }

    const [[existing]] = await db.query(`SELECT file_url FROM materi_training WHERE id = ?`, [req.params.id]);
    if (!existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Materi tidak ditemukan" });
    }

    if (req.file) {
      const oldPath = path.join(__dirname, "..", existing.file_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      const fileUrl = `/uploads/${req.file.filename}`;
      await db.query(
        `UPDATE materi_training SET judul=?, deskripsi=?, pemateri_nama=?, nama_file=?, file_url=?, ukuran_file=?, updated_at=NOW() WHERE id=?`,
        [judul, deskripsi || null, pemateriNama, req.file.originalname, fileUrl, req.file.size, req.params.id]
      );
    } else {
      await db.query(
        `UPDATE materi_training SET judul=?, deskripsi=?, pemateri_nama=?, updated_at=NOW() WHERE id=?`,
        [judul, deskripsi || null, pemateriNama, req.params.id]
      );
    }

    res.json({ success: true, message: "Materi berhasil diperbarui" });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/materi-training/admin/:id — hapus materi
router.delete("/admin/:id", trainingAuth, async (req, res) => {
  try {
    const [[existing]] = await db.query(`SELECT file_url FROM materi_training WHERE id = ?`, [req.params.id]);
    if (!existing) return res.status(404).json({ error: "Materi tidak ditemukan" });

    const filePath = path.join(__dirname, "..", existing.file_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query(`DELETE FROM materi_training WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: "Materi berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
