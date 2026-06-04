const express = require("express");
const router  = express.Router();
const db      = require("../db");
const adminAuth = require("../middleware/adminAuth");

// GET /api/admin/bank-soal
router.get("/", adminAuth, async (req, res) => {
  try {
    const { lowonganId, tipe } = req.query;
    let sql = `SELECT bs.id, bs.tipe, bs.pertanyaan, bs.opsi_a, bs.opsi_b, bs.opsi_c, bs.opsi_d,
                      bs.kunci_jawaban, bs.bobot, bs.lowongan_id, bs.created_at,
                      up.nama_lengkap AS dibuat_oleh_nama
               FROM bank_soal bs
               LEFT JOIN users u ON u.id = bs.dibuat_oleh
               LEFT JOIN user_profiles up ON up.user_id = u.id
               WHERE 1=1`;
    const params = [];
    if (lowonganId === "umum") {
      sql += " AND bs.lowongan_id IS NULL";
    } else if (lowonganId) {
      sql += " AND bs.lowongan_id = ?";
      params.push(lowonganId);
    }
    if (tipe) { sql += " AND bs.tipe = ?"; params.push(tipe); }
    sql += " ORDER BY bs.created_at DESC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/bank-soal
router.post("/", adminAuth, async (req, res) => {
  const { tipe, pertanyaan, opsiA, opsiB, opsiC, opsiD, kunciJawaban, bobot, lowonganId } = req.body;
  if (!tipe || !pertanyaan) {
    return res.status(400).json({ error: "Pertanyaan dan kunci jawaban wajib diisi" });
  }
  if (tipe === "pilihan_ganda" && (!opsiA || !opsiB || !opsiC || !opsiD || !kunciJawaban)) {
    return res.status(400).json({ error: "Pertanyaan dan kunci jawaban wajib diisi" });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO bank_soal
         (tipe, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban, bobot, lowongan_id, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tipe, pertanyaan, opsiA || null, opsiB || null, opsiC || null, opsiD || null,
       kunciJawaban || null, bobot || 1, lowonganId || null, req.user.id]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Soal berhasil ditambahkan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/admin/bank-soal/:id
router.put("/:id", adminAuth, async (req, res) => {
  const { tipe, pertanyaan, opsiA, opsiB, opsiC, opsiD, kunciJawaban, bobot, lowonganId } = req.body;
  if (!tipe || !pertanyaan) {
    return res.status(400).json({ error: "Pertanyaan wajib diisi" });
  }
  if (tipe === "pilihan_ganda" && (!opsiA || !opsiB || !opsiC || !opsiD || !kunciJawaban)) {
    return res.status(400).json({ error: "Pertanyaan dan kunci jawaban wajib diisi" });
  }
  try {
    await db.query(
      `UPDATE bank_soal
       SET tipe=?, pertanyaan=?, opsi_a=?, opsi_b=?, opsi_c=?, opsi_d=?, kunci_jawaban=?,
           bobot=?, lowongan_id=?, updated_at=NOW()
       WHERE id=?`,
      [tipe, pertanyaan, opsiA || null, opsiB || null, opsiC || null, opsiD || null,
       kunciJawaban || null, bobot || 1, lowonganId || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/admin/bank-soal/:id
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await db.query("DELETE FROM bank_soal WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
