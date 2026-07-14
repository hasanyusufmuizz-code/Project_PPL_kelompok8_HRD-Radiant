const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");

const KELULUSAN_THRESHOLD = 70;

// GET /api/kelulusan — pelamar tahap "final" dengan nilai tes, wawancara, gabungan, rekomendasi
router.get("/", adminAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.id AS lamaran_id, l.status, l.catatan_hrd,
              u.id AS user_id, u.email, up.nama_lengkap,
              low.id AS lowongan_id, low.posisi,
              hs.nilai AS nilai_tes,
              pen.nilai_wawancara
       FROM lamaran l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       JOIN lowongan low ON low.id = l.lowongan_id
       LEFT JOIN (
         SELECT hs.lamaran_id, hs.nilai
         FROM hasil_seleksi hs
         JOIN tahap_seleksi ts ON ts.id = hs.tahap_id
         WHERE ts.urutan = 2
       ) hs ON hs.lamaran_id = l.id
       LEFT JOIN (
         SELECT lamaran_id, AVG(nilai_total) AS nilai_wawancara
         FROM penilaian
         GROUP BY lamaran_id
       ) pen ON pen.lamaran_id = l.id
       WHERE l.status = 'final'
       ORDER BY l.updated_at DESC`
    );

    const data = rows.map((r) => {
      const nilaiTes = r.nilai_tes !== null ? Number(r.nilai_tes) : null;
      const nilaiWawancara = r.nilai_wawancara !== null ? Number(r.nilai_wawancara) : null;
      let nilaiGabungan = null;
      if (nilaiTes !== null && nilaiWawancara !== null) {
        nilaiGabungan = Math.round(((nilaiTes + nilaiWawancara) / 2) * 100) / 100;
      }
      const rekomendasi =
        nilaiGabungan === null ? null : nilaiGabungan >= KELULUSAN_THRESHOLD ? "Lulus" : "Tidak Lulus";

      return {
        lamaran_id: r.lamaran_id,
        status: r.status,
        catatan_hrd: r.catatan_hrd,
        user_id: r.user_id,
        email: r.email,
        nama_lengkap: r.nama_lengkap,
        lowongan_id: r.lowongan_id,
        posisi: r.posisi,
        nilai_tes: nilaiTes,
        nilai_wawancara: nilaiWawancara,
        nilai_gabungan: nilaiGabungan,
        rekomendasi,
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
