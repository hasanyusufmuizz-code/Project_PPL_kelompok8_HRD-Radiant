const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Hanya file PDF yang diizinkan"));
  },
});

const JENIS_VALID = ["cv", "transkrip_nilai", "surat_lamaran", "ijazah", "foto", "ktp", "sertifikat", "lainnya"];

// GET /api/berkas — daftar berkas milik user (berdasarkan lamaran terbaru)
router.get("/", auth, async (req, res) => {
  try {
    const [lamRows] = await db.query(
      `SELECT l.id, low.posisi FROM lamaran l
       JOIN lowongan low ON low.id = l.lowongan_id
       WHERE l.user_id = ? ORDER BY l.created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!lamRows.length) return res.json({ berkas: [], lamaran: null });

    const lamaranId = lamRows[0].id;
    const [berkas] = await db.query(
      `SELECT id, jenis_dokumen, nama_file, file_url, ukuran_file,
              status_verifikasi, catatan_verifikasi, created_at
       FROM dokumen_lamaran WHERE lamaran_id = ? ORDER BY created_at ASC`,
      [lamaranId]
    );
    res.json({ berkas, lamaran: lamRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/berkas — upload berkas (multipart/form-data)
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const jenis = req.body.jenisDokumen;
    if (!JENIS_VALID.includes(jenis)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Jenis dokumen tidak valid" });
    }

    const [lamRows] = await db.query(
      `SELECT id FROM lamaran WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!lamRows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Belum ada lamaran aktif. Daftar lowongan terlebih dahulu." });
    }

    const lamaranId = lamRows[0].id;
    const fileUrl = `/uploads/${req.file.filename}`;

    // Hapus berkas lama dengan jenis yang sama jika ada
    const [existing] = await db.query(
      `SELECT id, file_url FROM dokumen_lamaran WHERE lamaran_id = ? AND jenis_dokumen = ?`,
      [lamaranId, jenis]
    );
    if (existing.length) {
      const oldPath = path.join(__dirname, "..", existing[0].file_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await db.query(`DELETE FROM dokumen_lamaran WHERE id = ?`, [existing[0].id]);
    }

    await db.query(
      `INSERT INTO dokumen_lamaran (lamaran_id, jenis_dokumen, nama_file, file_url, ukuran_file)
       VALUES (?, ?, ?, ?, ?)`,
      [lamaranId, jenis, req.file.originalname, fileUrl, req.file.size]
    );

    res.status(201).json({ success: true, fileUrl, namaFile: req.file.originalname });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// DELETE /api/berkas/:id — hapus berkas
router.delete("/:id", auth, async (req, res) => {
  try {
    const [lamRows] = await db.query(
      `SELECT id FROM lamaran WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!lamRows.length) return res.status(400).json({ error: "Tidak ada lamaran" });

    const [rows] = await db.query(
      `SELECT id, file_url FROM dokumen_lamaran WHERE id = ? AND lamaran_id = ?`,
      [req.params.id, lamRows[0].id]
    );
    if (!rows.length) return res.status(404).json({ error: "Berkas tidak ditemukan" });

    const filePath = path.join(__dirname, "..", rows[0].file_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query(`DELETE FROM dokumen_lamaran WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// === ADMIN ROUTES ===

// GET /api/berkas/admin — semua berkas, bisa filter by jenis & status
router.get("/admin", adminAuth, async (req, res) => {
  const { jenis, status, lowonganId, search } = req.query;
  try {
    let sql = `
      SELECT dl.id, dl.jenis_dokumen, dl.nama_file, dl.file_url, dl.ukuran_file,
             dl.status_verifikasi, dl.catatan_verifikasi, dl.created_at,
             up.nama_lengkap, u.email,
             low.posisi AS posisi_lowongan, lm.id AS lamaran_id
      FROM dokumen_lamaran dl
      JOIN lamaran lm ON lm.id = dl.lamaran_id
      JOIN users u ON u.id = lm.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      JOIN lowongan low ON low.id = lm.lowongan_id
      WHERE 1=1
    `;
    const params = [];

    if (jenis) { sql += " AND dl.jenis_dokumen = ?"; params.push(jenis); }
    if (status) { sql += " AND dl.status_verifikasi = ?"; params.push(status); }
    if (lowonganId) { sql += " AND lm.lowongan_id = ?"; params.push(lowonganId); }
    if (search) { sql += " AND (up.nama_lengkap LIKE ? OR u.email LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }

    sql += " ORDER BY dl.created_at DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/berkas/admin/:id/verifikasi — verifikasi/tolak berkas
router.patch("/admin/:id/verifikasi", adminAuth, async (req, res) => {
  const { status, catatan } = req.body;
  const validStatus = ["terverifikasi", "ditolak", "belum_diproses"];
  if (!validStatus.includes(status)) return res.status(400).json({ error: "Status tidak valid" });

  try {
    await db.query(
      `UPDATE dokumen_lamaran
       SET status_verifikasi = ?, catatan_verifikasi = ?,
           diverifikasi_oleh = ?, diverifikasi_pada = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [status, catatan || null, req.user.id, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
