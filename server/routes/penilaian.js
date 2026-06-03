const express = require("express");
const router = express.Router();
const db = require("../db");

// Middleware untuk memastikan user adalah admin/hrd
const requireAdminOrHrd = async (req, res, next) => {
  // Karena saat ini auth statis berdasarkan session (jika ada), 
  // kita skip auth ketat atau kita bisa implementasi berdasarkan auth yang ada.
  // Untuk demo, asumsikan bisa diakses, di route production panggil requireAuth
  next();
};

// GET /api/penilaian/:lamaran_id
// Mengambil data penilaian untuk suatu lamaran
router.get("/:lamaran_id", async (req, res) => {
  try {
    const lamaranId = req.params.lamaran_id;
    const [rows] = await db.query(
      "SELECT * FROM penilaian WHERE lamaran_id = ?",
      [lamaranId]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error("Error fetching penilaian:", error);
    res.status(500).json({ error: "Gagal mengambil data penilaian." });
  }
});

// POST /api/penilaian/:lamaran_id
// Menyimpan atau mengupdate data penilaian
router.post("/:lamaran_id", async (req, res) => {
  try {
    const lamaranId = req.params.lamaran_id;
    const { 
      penilai_id, 
      nilai_kompetensi, 
      nilai_komunikasi, 
      nilai_kepribadian, 
      nilai_motivasi,
      rekomendasi,
      catatan
    } = req.body;

    // Hitung rata-rata untuk nilai total
    const kompetensi = parseFloat(nilai_kompetensi) || 0;
    const komunikasi = parseFloat(nilai_komunikasi) || 0;
    const kepribadian = parseFloat(nilai_kepribadian) || 0;
    const motivasi = parseFloat(nilai_motivasi) || 0;
    const nilaiTotal = (kompetensi + komunikasi + kepribadian + motivasi) / 4;

    // Cek apakah lamaran ini sudah memiliki nilai
    const [existing] = await db.query(
      "SELECT id FROM penilaian WHERE lamaran_id = ?",
      [lamaranId]
    );

    // Default penilai_id jika tidak dikirim (asumsi HRD dengan ID 2 sebagai fallback)
    const activePenilaiId = penilai_id || 2;

    if (existing.length > 0) {
      // Update
      await db.query(
        `UPDATE penilaian SET 
          penilai_id = ?, 
          nilai_kompetensi = ?, 
          nilai_komunikasi = ?, 
          nilai_kepribadian = ?, 
          nilai_motivasi = ?, 
          nilai_total = ?, 
          rekomendasi = ?, 
          catatan = ? 
         WHERE lamaran_id = ?`,
        [
          activePenilaiId, kompetensi, komunikasi, kepribadian, motivasi, 
          nilaiTotal, rekomendasi, catatan, lamaranId
        ]
      );
    } else {
      // Insert
      await db.query(
        `INSERT INTO penilaian (
          lamaran_id, penilai_id, nilai_kompetensi, nilai_komunikasi, 
          nilai_kepribadian, nilai_motivasi, nilai_total, rekomendasi, catatan
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lamaranId, activePenilaiId, kompetensi, komunikasi, kepribadian, 
          motivasi, nilaiTotal, rekomendasi, catatan
        ]
      );
    }

    res.json({ success: true, message: "Penilaian berhasil disimpan." });
  } catch (error) {
    console.error("Error saving penilaian:", error);
    res.status(500).json({ error: "Gagal menyimpan data penilaian." });
  }
});

module.exports = router;
