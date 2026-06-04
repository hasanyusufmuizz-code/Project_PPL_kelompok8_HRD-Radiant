const express   = require("express");
const router    = express.Router();
const db        = require("../db");
const adminAuth = require("../middleware/adminAuth");

const KKM_WAWANCARA = 60;

// GET /api/penilaian — daftar semua penilaian wawancara
router.get("/", adminAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.lamaran_id, p.jadwal_id, p.nilai_kompetensi, p.nilai_komunikasi,
             p.nilai_kepribadian, p.nilai_motivasi, p.nilai_total, p.rekomendasi, p.catatan,
             p.created_at,
             up.nama_lengkap, u.email, lw.posisi,
             penilai_up.nama_lengkap AS penilai_nama
      FROM penilaian p
      JOIN lamaran lm ON lm.id = p.lamaran_id
      JOIN users u ON u.id = lm.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      JOIN lowongan lw ON lw.id = lm.lowongan_id
      LEFT JOIN user_profiles penilai_up ON penilai_up.user_id = p.penilai_id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/penilaian/:lamaranId — detail penilaian satu pelamar
router.get("/:lamaranId", adminAuth, async (req, res) => {
  try {
    const [[row]] = await db.query(
      `SELECT p.*, penilai_up.nama_lengkap AS penilai_nama
       FROM penilaian p
       LEFT JOIN user_profiles penilai_up ON penilai_up.user_id = p.penilai_id
       WHERE p.lamaran_id = ?
       ORDER BY p.created_at DESC LIMIT 1`,
      [req.params.lamaranId]
    );
    res.json(row || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/penilaian — submit penilaian wawancara (US-014)
router.post("/", adminAuth, async (req, res) => {
  const { lamaranId, jadwalId, nilaiKompetensi, nilaiKomunikasi, nilaiKepribadian, nilaiMotivasi, rekomendasi, catatan } = req.body;

  if (
    !lamaranId ||
    nilaiKompetensi == null || nilaiKomunikasi == null ||
    nilaiKepribadian == null || nilaiMotivasi == null
  ) {
    return res.status(400).json({ error: "Harap isi semua kriteria penilaian" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const nilaiTotal = (Number(nilaiKompetensi) + Number(nilaiKomunikasi) + Number(nilaiKepribadian) + Number(nilaiMotivasi)) / 4;
    const autoRekom  = rekomendasi || (nilaiTotal >= KKM_WAWANCARA ? "direkomendasikan" : "tidak_direkomendasikan");

    // Upsert penilaian
    const [result] = await conn.query(
      `INSERT INTO penilaian
         (lamaran_id, jadwal_id, penilai_id, nilai_kompetensi, nilai_komunikasi,
          nilai_kepribadian, nilai_motivasi, nilai_total, rekomendasi, catatan)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         nilai_kompetensi=VALUES(nilai_kompetensi), nilai_komunikasi=VALUES(nilai_komunikasi),
         nilai_kepribadian=VALUES(nilai_kepribadian), nilai_motivasi=VALUES(nilai_motivasi),
         nilai_total=VALUES(nilai_total), rekomendasi=VALUES(rekomendasi),
         catatan=VALUES(catatan), updated_at=NOW()`,
      [lamaranId, jadwalId || null, req.user.id,
       nilaiKompetensi, nilaiKomunikasi, nilaiKepribadian, nilaiMotivasi,
       nilaiTotal, autoRekom, catatan || null]
    );

    // Sync hasil_seleksi wawancara (tahap urutan 4)
    const [[tahapWawancara]] = await conn.query("SELECT id FROM tahap_seleksi WHERE urutan = 4");
    if (tahapWawancara) {
      const statusHasil = nilaiTotal >= KKM_WAWANCARA ? "lulus" : "tidak_lulus";
      const [[ex]] = await conn.query(
        "SELECT id FROM hasil_seleksi WHERE lamaran_id=? AND tahap_id=?",
        [lamaranId, tahapWawancara.id]
      );
      if (ex) {
        await conn.query("UPDATE hasil_seleksi SET status=?, nilai=? WHERE id=?", [statusHasil, nilaiTotal, ex.id]);
      } else {
        await conn.query("INSERT INTO hasil_seleksi (lamaran_id, tahap_id, status, nilai) VALUES (?,?,?,?)",
          [lamaranId, tahapWawancara.id, statusHasil, nilaiTotal]);
      }
    }

    // Label otomatis "Tidak Lulus Wawancara" di catatan_hrd bila gagal (US-014 skenario 3)
    if (nilaiTotal < KKM_WAWANCARA) {
      await conn.query(
        "UPDATE lamaran SET catatan_hrd=? WHERE id=?",
        ["Tidak Lulus Wawancara (otomatis)", lamaranId]
      );
    }

    // Notifikasi ke pelamar
    const [[lm]] = await conn.query("SELECT user_id FROM lamaran WHERE id=?", [lamaranId]);
    if (lm) {
      const lulus = nilaiTotal >= KKM_WAWANCARA;
      await conn.query(
        "INSERT INTO notifikasi (user_id, judul, pesan, tipe, link_url) VALUES (?,?,?,?,?)",
        [lm.user_id, "Hasil Wawancara",
         lulus
           ? `Selamat! Anda lulus tahap wawancara dengan nilai ${nilaiTotal.toFixed(1)}.`
           : `Nilai wawancara Anda: ${nilaiTotal.toFixed(1)} (Standar: ${KKM_WAWANCARA}). Belum memenuhi standar kelulusan.`,
         lulus ? "sukses" : "peringatan", "/dashboard"]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, message: "Penilaian berhasil disimpan" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

module.exports = router;
