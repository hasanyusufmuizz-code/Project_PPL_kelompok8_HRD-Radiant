const express   = require("express");
const router    = express.Router();
const db        = require("../db");
const adminAuth = require("../middleware/adminAuth");

// GET /api/admin/kelulusan — tabel nilai gabungan + rekomendasi (US-015)
router.get("/", adminAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT lm.id AS lamaran_id, lm.status,
             up.nama_lengkap, u.email, lw.posisi, lw.id AS lowongan_id,
             tp.skor AS skor_tes, p.nilai_total AS nilai_wawancara,
             ROUND((COALESCE(tp.skor,0) * 0.4 + COALESCE(p.nilai_total,0) * 0.6), 2) AS nilai_gabungan,
             CASE
               WHEN tp.skor IS NOT NULL AND p.nilai_total IS NOT NULL
                    AND tp.skor >= 60 AND p.nilai_total >= 60
                 THEN 'Direkomendasikan Lulus'
               WHEN tp.skor IS NULL AND p.nilai_total IS NULL
                 THEN 'Belum Lengkap'
               ELSE 'Tidak Direkomendasikan'
             END AS rekomendasi,
             lm.tanggal_daftar
      FROM lamaran lm
      JOIN users u ON u.id = lm.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      JOIN lowongan lw ON lw.id = lm.lowongan_id
      LEFT JOIN tes_pengerjaan tp ON tp.lamaran_id = lm.id
        AND tp.status = 'selesai'
        AND tp.tes_id = (
          SELECT t2.id FROM tes_online t2
          WHERE t2.lowongan_id = lm.lowongan_id AND t2.status = 'aktif'
          ORDER BY t2.created_at DESC LIMIT 1
        )
      LEFT JOIN penilaian p ON p.lamaran_id = lm.id
      WHERE lm.status IN ('wawancara','final','diterima','ditolak')
      ORDER BY nilai_gabungan DESC, lm.tanggal_daftar ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/kelulusan/:lamaranId — tetapkan keputusan kelulusan (US-015 skenario 2)
router.post("/:lamaranId", adminAuth, async (req, res) => {
  const { keputusan } = req.body; // 'lulus' | 'tidak_lulus'
  if (!["lulus", "tidak_lulus"].includes(keputusan)) {
    return res.status(400).json({ error: "Keputusan tidak valid" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[lm]] = await conn.query(
      "SELECT user_id, lowongan_id, status FROM lamaran WHERE id=?",
      [req.params.lamaranId]
    );
    if (!lm) {
      await conn.rollback();
      return res.status(404).json({ error: "Lamaran tidak ditemukan" });
    }

    const newStatus = keputusan === "lulus" ? "diterima" : "ditolak";
    await conn.query(
      "UPDATE lamaran SET status=?, updated_at=NOW() WHERE id=?",
      [newStatus, req.params.lamaranId]
    );

    // Sync hasil_seleksi semua tahap (US-015 skenario 2)
    const [tahapRows] = await conn.query("SELECT id, urutan FROM tahap_seleksi ORDER BY urutan");
    for (const tahap of tahapRows) {
      let finalStatus;
      if (keputusan === "lulus") {
        finalStatus = "lulus";
      } else {
        // Tahap 1-4 dianggap sudah lulus (sudah sampai wawancara), tahap 5 tidak lulus
        finalStatus = tahap.urutan < 5 ? "lulus" : "tidak_lulus";
      }
      const [[ex]] = await conn.query(
        "SELECT id FROM hasil_seleksi WHERE lamaran_id=? AND tahap_id=?",
        [req.params.lamaranId, tahap.id]
      );
      if (ex) {
        await conn.query("UPDATE hasil_seleksi SET status=? WHERE id=?", [finalStatus, ex.id]);
      } else {
        await conn.query(
          "INSERT INTO hasil_seleksi (lamaran_id, tahap_id, status) VALUES (?,?,?)",
          [req.params.lamaranId, tahap.id, finalStatus]
        );
      }
    }

    // Notifikasi ke pelamar
    const pesan = keputusan === "lulus"
      ? "Selamat! Anda dinyatakan LULUS dan diterima. Tim HRD akan segera menghubungi Anda untuk proses selanjutnya."
      : "Terima kasih atas partisipasinya. Setelah evaluasi menyeluruh, kami belum dapat melanjutkan lamaran Anda saat ini.";

    await conn.query(
      "INSERT INTO notifikasi (user_id, judul, pesan, tipe, link_url) VALUES (?,?,?,?,?)",
      [lm.user_id,
       `Keputusan Final: ${keputusan === "lulus" ? "Diterima" : "Tidak Diterima"}`,
       pesan,
       keputusan === "lulus" ? "sukses" : "peringatan",
       "/dashboard"]
    );

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

module.exports = router;
