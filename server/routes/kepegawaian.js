const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");
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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("FORMAT_TIDAK_DIDUKUNG"));
  },
});

const JENIS_KEPEGAWAIAN = ["npwp", "bpjs", "kontrak"];

function handleUploadError(err, _req, res, next) {
  if (err) {
    if (err.message === "FORMAT_TIDAK_DIDUKUNG") {
      return res.status(400).json({ error: "Format file tidak didukung, harap gunakan format PDF" });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Ukuran file melebihi batas 10MB" });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
  next();
}

// GET /api/kepegawaian/instruktur — pengajar yang sudah diterima
router.get("/instruktur", adminAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id AS user_id, u.email, up.nama_lengkap, low.posisi, l.id AS lamaran_id
       FROM lamaran l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       JOIN lowongan low ON low.id = l.lowongan_id
       WHERE l.status = 'diterima'
       ORDER BY up.nama_lengkap ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/kepegawaian/:userId — dokumen kepegawaian milik seorang pengajar
router.get("/:userId", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, jenis_dokumen, nama_file, file_url, ukuran_file,
              status_verifikasi, created_at
       FROM berkas_inti
       WHERE user_id = ? AND jenis_dokumen IN (?)
       ORDER BY created_at DESC`,
      [req.params.userId, JENIS_KEPEGAWAIAN]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/kepegawaian/:userId — upload dokumen kepegawaian (NPWP/BPJS/kontrak)
router.post("/:userId", adminAuth, upload.single("file"), handleUploadError, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const jenis = req.body.jenisDokumen;
    if (!JENIS_KEPEGAWAIAN.includes(jenis)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Jenis dokumen tidak valid" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const [existing] = await db.query(
      `SELECT id, file_url FROM berkas_inti WHERE user_id = ? AND jenis_dokumen = ?`,
      [req.params.userId, jenis]
    );
    if (existing.length) {
      const oldPath = path.join(__dirname, "..", existing[0].file_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await db.query(`DELETE FROM berkas_inti WHERE id = ?`, [existing[0].id]);
    }

    await db.query(
      `INSERT INTO berkas_inti (user_id, jenis_dokumen, nama_file, file_url, ukuran_file, status_verifikasi)
       VALUES (?, ?, ?, ?, ?, 'terverifikasi')`,
      [req.params.userId, jenis, req.file.originalname, fileUrl, req.file.size]
    );

    res.status(201).json({ success: true, fileUrl, namaFile: req.file.originalname });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/kepegawaian/:userId/:id — hapus dokumen kepegawaian
router.delete("/:userId/:id", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, file_url FROM berkas_inti WHERE id = ? AND user_id = ? AND jenis_dokumen IN (?)`,
      [req.params.id, req.params.userId, JENIS_KEPEGAWAIAN]
    );
    if (!rows.length) return res.status(404).json({ error: "Dokumen tidak ditemukan" });

    const filePath = path.join(__dirname, "..", rows[0].file_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query(`DELETE FROM berkas_inti WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
