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

const JENIS_INTI = ["cv", "transkrip_nilai", "surat_lamaran", "ijazah", "foto", "ktp"];

// ─── USER: BERKAS INTI ────────────────────────────────────────────────────────

// GET /api/berkas — berkas inti + lamaran aktif + syarat khusus + berkas khusus
router.get("/", auth, async (req, res) => {
  try {
    const [berkasInti] = await db.query(
      `SELECT id, jenis_dokumen, nama_file, file_url, ukuran_file,
              status_verifikasi, catatan_verifikasi, created_at
       FROM berkas_inti WHERE user_id = ? ORDER BY created_at ASC`,
      [req.user.id]
    );

    const [lamRows] = await db.query(
      `SELECT l.id, low.id AS lowongan_id, low.posisi
       FROM lamaran l
       JOIN lowongan low ON low.id = l.lowongan_id
       WHERE l.user_id = ? ORDER BY l.created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!lamRows.length) {
      return res.json({ berkasInti, berkasKhusus: [], syaratKhusus: [], lamaran: null });
    }

    const lamaran = lamRows[0];

    const [syaratKhusus] = await db.query(
      `SELECT id, nama_dokumen, kode_dokumen, deskripsi, wajib
       FROM syarat_dokumen_lowongan WHERE lowongan_id = ? ORDER BY created_at ASC`,
      [lamaran.lowongan_id]
    );

    const [berkasKhusus] = await db.query(
      `SELECT id, jenis_dokumen, nama_file, file_url, ukuran_file,
              status_verifikasi, catatan_verifikasi, created_at
       FROM dokumen_lamaran WHERE lamaran_id = ? ORDER BY created_at ASC`,
      [lamaran.id]
    );

    res.json({ berkasInti, berkasKhusus, syaratKhusus, lamaran });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/berkas — upload berkas inti (tidak butuh lamaran)
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const jenis = req.body.jenisDokumen;
    if (!JENIS_INTI.includes(jenis)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Jenis dokumen tidak valid untuk berkas inti" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const [existing] = await db.query(
      `SELECT id, file_url FROM berkas_inti WHERE user_id = ? AND jenis_dokumen = ?`,
      [req.user.id, jenis]
    );
    if (existing.length) {
      const oldPath = path.join(__dirname, "..", existing[0].file_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await db.query(`DELETE FROM berkas_inti WHERE id = ?`, [existing[0].id]);
    }

    await db.query(
      `INSERT INTO berkas_inti (user_id, jenis_dokumen, nama_file, file_url, ukuran_file)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, jenis, req.file.originalname, fileUrl, req.file.size]
    );

    res.status(201).json({ success: true, fileUrl, namaFile: req.file.originalname });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// DELETE /api/berkas/khusus/:id — hapus berkas khusus (sebelum /:id agar tidak konflik)
router.delete("/khusus/:id", auth, async (req, res) => {
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

// DELETE /api/berkas/:id — hapus berkas inti
router.delete("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, file_url FROM berkas_inti WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Berkas tidak ditemukan" });

    const filePath = path.join(__dirname, "..", rows[0].file_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query(`DELETE FROM berkas_inti WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/berkas/khusus — upload berkas khusus (terikat lamaran aktif)
router.post("/khusus", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const jenis = req.body.jenisDokumen;
    if (!jenis) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Jenis dokumen wajib diisi" });
    }

    const [lamRows] = await db.query(
      `SELECT id FROM lamaran WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!lamRows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Belum ada lamaran aktif" });
    }

    const lamaranId = lamRows[0].id;
    const fileUrl = `/uploads/${req.file.filename}`;

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

// ─── ADMIN: SYARAT DOKUMEN (definisi sebelum route berparameter) ──────────────

// GET /api/berkas/admin/syarat
router.get("/admin/syarat", adminAuth, async (req, res) => {
  const { lowongan_id } = req.query;
  try {
    let sql = `SELECT s.*, low.posisi FROM syarat_dokumen_lowongan s
               JOIN lowongan low ON low.id = s.lowongan_id WHERE 1=1`;
    const params = [];
    if (lowongan_id) { sql += " AND s.lowongan_id = ?"; params.push(lowongan_id); }
    sql += " ORDER BY s.created_at ASC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/berkas/admin/syarat
router.post("/admin/syarat", adminAuth, async (req, res) => {
  const { lowongan_id, nama_dokumen, kode_dokumen, deskripsi, wajib } = req.body;
  if (!lowongan_id || !nama_dokumen || !kode_dokumen) {
    return res.status(400).json({ error: "lowongan_id, nama_dokumen, kode_dokumen wajib diisi" });
  }
  try {
    const kode = kode_dokumen.toLowerCase().replace(/\s+/g, "_");
    const [result] = await db.query(
      `INSERT INTO syarat_dokumen_lowongan (lowongan_id, nama_dokumen, kode_dokumen, deskripsi, wajib)
       VALUES (?, ?, ?, ?, ?)`,
      [lowongan_id, nama_dokumen, kode, deskripsi || null, wajib ? 1 : 0]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/berkas/admin/syarat/:id
router.put("/admin/syarat/:id", adminAuth, async (req, res) => {
  const { nama_dokumen, kode_dokumen, deskripsi, wajib } = req.body;
  try {
    const kode = kode_dokumen.toLowerCase().replace(/\s+/g, "_");
    await db.query(
      `UPDATE syarat_dokumen_lowongan SET nama_dokumen=?, kode_dokumen=?, deskripsi=?, wajib=? WHERE id=?`,
      [nama_dokumen, kode, deskripsi || null, wajib ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/berkas/admin/syarat/:id
router.delete("/admin/syarat/:id", adminAuth, async (req, res) => {
  try {
    await db.query(`DELETE FROM syarat_dokumen_lowongan WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── ADMIN: BERKAS INTI ───────────────────────────────────────────────────────

// GET /api/berkas/admin/inti
router.get("/admin/inti", adminAuth, async (req, res) => {
  const { jenis, status, search } = req.query;
  try {
    let sql = `
      SELECT bi.id, bi.jenis_dokumen, bi.nama_file, bi.file_url, bi.ukuran_file,
             bi.status_verifikasi, bi.catatan_verifikasi, bi.created_at,
             up.nama_lengkap, u.email
      FROM berkas_inti bi
      JOIN users u ON u.id = bi.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (jenis) { sql += " AND bi.jenis_dokumen = ?"; params.push(jenis); }
    if (status) { sql += " AND bi.status_verifikasi = ?"; params.push(status); }
    if (search) { sql += " AND (up.nama_lengkap LIKE ? OR u.email LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    sql += " ORDER BY bi.created_at DESC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/berkas/admin/inti/:id/verifikasi (sebelum /admin/:id/verifikasi)
router.patch("/admin/inti/:id/verifikasi", adminAuth, async (req, res) => {
  const { status, catatan } = req.body;
  const validStatus = ["terverifikasi", "ditolak", "belum_diproses"];
  if (!validStatus.includes(status)) return res.status(400).json({ error: "Status tidak valid" });
  try {
    await db.query(
      `UPDATE berkas_inti SET status_verifikasi=?, catatan_verifikasi=?,
       diverifikasi_oleh=?, diverifikasi_pada=NOW(), updated_at=NOW() WHERE id=?`,
      [status, catatan || null, req.user.id, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── ADMIN: BERKAS LAMARAN ────────────────────────────────────────────────────

// GET /api/berkas/admin
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

// PATCH /api/berkas/admin/:id/verifikasi
router.patch("/admin/:id/verifikasi", adminAuth, async (req, res) => {
  const { status, catatan } = req.body;
  const validStatus = ["terverifikasi", "ditolak", "belum_diproses"];
  if (!validStatus.includes(status)) return res.status(400).json({ error: "Status tidak valid" });
  try {
    await db.query(
      `UPDATE dokumen_lamaran SET status_verifikasi=?, catatan_verifikasi=?,
       diverifikasi_oleh=?, diverifikasi_pada=NOW(), updated_at=NOW() WHERE id=?`,
      [status, catatan || null, req.user.id, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
