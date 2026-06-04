const express   = require("express");
const router    = express.Router();
const db        = require("../db");
const auth      = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// ─────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────

// GET /api/tes/admin — semua paket tes
router.get("/admin", adminAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, t.judul, t.durasi_menit, t.jumlah_soal, t.kkm, t.status,
             t.lowongan_id, low.posisi AS posisi_lowongan,
             t.jadwal_id, js.tanggal AS jadwal_tanggal, js.waktu_mulai,
             (SELECT COUNT(*) FROM tes_soal ts WHERE ts.tes_id = t.id) AS jumlah_soal_aktual,
             (SELECT COUNT(*) FROM tes_pengerjaan tp WHERE tp.tes_id = t.id) AS jumlah_peserta,
             (SELECT COUNT(*) FROM tes_pengerjaan tp WHERE tp.tes_id = t.id AND tp.status='selesai') AS peserta_selesai,
             (SELECT COUNT(*) FROM tes_pengerjaan tp WHERE tp.tes_id = t.id AND tp.status='menunggu_koreksi') AS peserta_koreksi,
             t.created_at
      FROM tes_online t
      LEFT JOIN lowongan low ON low.id = t.lowongan_id
      LEFT JOIN jadwal_seleksi js ON js.id = t.jadwal_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/tes/admin/:id/soal — soal dalam paket tes
router.get("/admin/:id/soal", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT bs.id, bs.tipe, bs.pertanyaan, bs.opsi_a, bs.opsi_b, bs.opsi_c, bs.opsi_d,
              bs.kunci_jawaban, bs.bobot, ts.urutan
       FROM tes_soal ts
       JOIN bank_soal bs ON bs.id = ts.soal_id
       WHERE ts.tes_id = ?
       ORDER BY ts.urutan ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/tes/admin/:id/pengerjaan — daftar pengerjaan peserta
router.get("/admin/:id/pengerjaan", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT tp.id AS pengerjaan_id, tp.status, tp.skor, tp.jumlah_benar,
              tp.waktu_mulai, tp.waktu_selesai, tp.lamaran_id,
              up.nama_lengkap, u.email
       FROM tes_pengerjaan tp
       JOIN lamaran lm ON lm.id = tp.lamaran_id
       JOIN users u ON u.id = lm.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE tp.tes_id = ?
       ORDER BY tp.skor DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/tes/admin/koreksi/:pengerjaanId — jawaban esai yang perlu dikoreksi
router.get("/admin/koreksi/:pengerjaanId", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT tj.id, tj.soal_id, tj.jawaban_text, tj.nilai_esai, tj.is_dinilai,
              bs.pertanyaan, bs.bobot
       FROM tes_jawaban tj
       JOIN bank_soal bs ON bs.id = tj.soal_id
       WHERE tj.pengerjaan_id = ? AND bs.tipe = 'esai'
       ORDER BY bs.id ASC`,
      [req.params.pengerjaanId]
    );
    const [[pengerjaan]] = await db.query(
      `SELECT tp.lamaran_id, tp.skor, tp.status, up.nama_lengkap
       FROM tes_pengerjaan tp
       JOIN lamaran lm ON lm.id = tp.lamaran_id
       JOIN users u ON u.id = lm.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE tp.id = ?`,
      [req.params.pengerjaanId]
    );
    res.json({ soalEsai: rows, pengerjaan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/tes/admin/koreksi/:pengerjaanId — submit nilai esai
router.post("/admin/koreksi/:pengerjaanId", adminAuth, async (req, res) => {
  const { nilaiEsai } = req.body; // { "soalId": nilai, ... }
  if (!nilaiEsai || typeof nilaiEsai !== "object") {
    return res.status(400).json({ error: "Data koreksi tidak valid" });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[pengerjaan]] = await conn.query(
      `SELECT tp.id, tp.lamaran_id, tp.tes_id, t.kkm
       FROM tes_pengerjaan tp
       JOIN tes_online t ON t.id = tp.tes_id
       WHERE tp.id = ?`,
      [req.params.pengerjaanId]
    );
    if (!pengerjaan) {
      await conn.rollback();
      return res.status(404).json({ error: "Pengerjaan tidak ditemukan" });
    }

    for (const [soalId, nilai] of Object.entries(nilaiEsai)) {
      await conn.query(
        `UPDATE tes_jawaban SET nilai_esai=?, is_dinilai=1
         WHERE pengerjaan_id=? AND soal_id=?`,
        [Number(nilai), pengerjaan.id, soalId]
      );
    }

    // Hitung skor final (PG + esai terbobot)
    const [jawaban] = await conn.query(
      `SELECT tj.is_benar, tj.nilai_esai, tj.is_dinilai, bs.bobot, bs.tipe
       FROM tes_jawaban tj
       JOIN bank_soal bs ON bs.id = tj.soal_id
       WHERE tj.pengerjaan_id = ?`,
      [pengerjaan.id]
    );

    let totalBobot = 0;
    let totalNilai = 0;
    for (const j of jawaban) {
      totalBobot += Number(j.bobot);
      if (j.tipe === "pilihan_ganda") {
        totalNilai += j.is_benar ? Number(j.bobot) : 0;
      } else {
        totalNilai += Number(j.nilai_esai || 0);
      }
    }
    const skor = totalBobot > 0 ? (totalNilai / totalBobot) * 100 : 0;
    const allDinilai = jawaban.every(j => j.tipe === "pilihan_ganda" || j.is_dinilai);

    await conn.query(
      `UPDATE tes_pengerjaan SET skor=?, status=?, updated_at=NOW() WHERE id=?`,
      [skor, allDinilai ? "selesai" : "menunggu_koreksi", pengerjaan.id]
    );

    if (allDinilai) {
      const lulus = skor >= Number(pengerjaan.kkm);
      const [[tahapTesTulis]] = await conn.query("SELECT id FROM tahap_seleksi WHERE urutan = 2");
      if (tahapTesTulis) {
        const [[ex]] = await conn.query(
          "SELECT id FROM hasil_seleksi WHERE lamaran_id=? AND tahap_id=?",
          [pengerjaan.lamaran_id, tahapTesTulis.id]
        );
        if (ex) {
          await conn.query("UPDATE hasil_seleksi SET status=?, nilai=? WHERE id=?",
            [lulus ? "lulus" : "tidak_lulus", skor, ex.id]);
        } else {
          await conn.query("INSERT INTO hasil_seleksi (lamaran_id, tahap_id, status, nilai) VALUES (?,?,?,?)",
            [pengerjaan.lamaran_id, tahapTesTulis.id, lulus ? "lulus" : "tidak_lulus", skor]);
        }
      }
      const [[lm]] = await conn.query("SELECT user_id FROM lamaran WHERE id=?", [pengerjaan.lamaran_id]);
      if (lm) {
        await conn.query(
          "INSERT INTO notifikasi (user_id, judul, pesan, tipe, link_url) VALUES (?,?,?,?,?)",
          [lm.user_id, "Hasil Tes Tertulis",
           lulus
             ? `Selamat! Anda lulus tes tertulis dengan skor ${skor.toFixed(1)}.`
             : `Skor tes tertulis Anda: ${skor.toFixed(1)} (KKM: ${pengerjaan.kkm}). Belum memenuhi standar.`,
           lulus ? "sukses" : "peringatan", "/dashboard"]
        );
      }
    }

    await conn.commit();
    res.json({ success: true, allDinilai });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

// POST /api/tes/admin — buat paket tes baru
router.post("/admin", adminAuth, async (req, res) => {
  const { judul, lowonganId, jadwalId, durasiMenit, kkm, soalIds } = req.body;
  if (!judul || !soalIds || !Array.isArray(soalIds) || soalIds.length === 0) {
    return res.status(400).json({ error: "Bank soal belum tersedia, tambah soal terlebih dahulu" });
  }
  if (jadwalId) {
    const [[jadwal]] = await db.query("SELECT tanggal FROM jadwal_seleksi WHERE id=?", [jadwalId]);
    if (jadwal) {
      const today = new Date().toISOString().slice(0, 10);
      if (jadwal.tanggal < today) {
        return res.status(400).json({ error: "Tanggal dan waktu tidak boleh di masa lalu" });
      }
    }
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO tes_online (judul, lowongan_id, jadwal_id, durasi_menit, jumlah_soal, kkm, status, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, 'aktif', ?)`,
      [judul, lowonganId || null, jadwalId || null, durasiMenit || 60, soalIds.length, kkm || 60, req.user.id]
    );
    const tesId = result.insertId;

    for (let i = 0; i < soalIds.length; i++) {
      await conn.query("INSERT INTO tes_soal (tes_id, soal_id, urutan) VALUES (?,?,?)", [tesId, soalIds[i], i + 1]);
    }

    // Daftarkan peserta dari lamaran yang tidak ditolak/pending
    if (lowonganId) {
      const [lamaranList] = await conn.query(
        `SELECT id, user_id FROM lamaran WHERE lowongan_id=? AND status NOT IN ('pending','ditolak')`,
        [lowonganId]
      );
      for (const lm of lamaranList) {
        await conn.query(
          "INSERT IGNORE INTO tes_pengerjaan (tes_id, lamaran_id) VALUES (?,?)",
          [tesId, lm.id]
        );
        // Notifikasi ke pelamar
        let pesanNotif = `Anda terdaftar sebagai peserta tes "${judul}". Durasi: ${durasiMenit || 60} menit.`;
        if (jadwalId) {
          const [[jd]] = await conn.query("SELECT tanggal, waktu_mulai FROM jadwal_seleksi WHERE id=?", [jadwalId]);
          if (jd) {
            const tgl = new Date(jd.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
            const jam = jd.waktu_mulai ? jd.waktu_mulai.slice(0, 5) : "";
            pesanNotif = `Tes tertulis "${judul}" dijadwalkan pada ${tgl} pukul ${jam} WIB. Durasi: ${durasiMenit || 60} menit. Siapkan diri Anda!`;
          }
        }
        await conn.query(
          "INSERT INTO notifikasi (user_id, judul, pesan, tipe, link_url) VALUES (?,?,?,?,?)",
          [lm.user_id, "Tes Tertulis Telah Dijadwalkan", pesanNotif, "info", "/tes"]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ success: true, id: tesId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

// DELETE /api/tes/admin/:id — hapus paket tes
router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    await db.query("DELETE FROM tes_online WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────
// PELAMAR ROUTES
// ─────────────────────────────────────────

// GET /api/tes/aktif — tes yang tersedia untuk pelamar
router.get("/aktif", auth, async (req, res) => {
  try {
    const [[lamaran]] = await db.query(
      "SELECT id FROM lamaran WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    if (!lamaran) return res.json([]);

    const [rows] = await db.query(
      `SELECT t.id, t.judul, t.durasi_menit, t.kkm,
              low.posisi AS posisi_lowongan,
              tp.status AS status_pengerjaan, tp.skor, tp.id AS pengerjaan_id,
              tp.waktu_deadline,
              js.tanggal AS jadwal_tanggal, js.waktu_mulai, js.waktu_selesai
       FROM tes_online t
       JOIN tes_pengerjaan tp ON tp.tes_id = t.id AND tp.lamaran_id = ?
       LEFT JOIN lowongan low ON low.id = t.lowongan_id
       LEFT JOIN jadwal_seleksi js ON js.id = t.jadwal_id
       WHERE t.status = 'aktif'
       ORDER BY t.created_at DESC`,
      [lamaran.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/tes/:id/mulai — pelamar mulai tes
router.post("/:id/mulai", auth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[lamaran]] = await conn.query(
      "SELECT id FROM lamaran WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    if (!lamaran) {
      await conn.rollback();
      return res.status(403).json({ error: "Tidak memiliki lamaran aktif" });
    }

    const [[pengerjaan]] = await conn.query(
      `SELECT tp.*, t.durasi_menit, t.jadwal_id
       FROM tes_pengerjaan tp
       JOIN tes_online t ON t.id = tp.tes_id
       WHERE tp.tes_id=? AND tp.lamaran_id=?`,
      [req.params.id, lamaran.id]
    );
    if (!pengerjaan) {
      await conn.rollback();
      return res.status(403).json({ error: "Anda tidak terdaftar sebagai peserta tes ini" });
    }

    // Validasi window jadwal (US-012 skenario 3)
    if (pengerjaan.jadwal_id) {
      const [[jd]] = await conn.query(
        "SELECT tanggal, waktu_mulai, waktu_selesai FROM jadwal_seleksi WHERE id=?",
        [pengerjaan.jadwal_id]
      );
      if (jd) {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const jadwalTgl = jd.tanggal instanceof Date ? jd.tanggal.toISOString().slice(0, 10) : String(jd.tanggal).slice(0, 10);
        const mulaiDt  = new Date(`${jadwalTgl}T${jd.waktu_mulai}`);
        const selesaiDt = jd.waktu_selesai ? new Date(`${jadwalTgl}T${jd.waktu_selesai}`) : null;
        if (now < mulaiDt) {
          await conn.rollback();
          const tgl = new Date(jadwalTgl).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
          return res.status(425).json({
            error: `Tes tidak tersedia saat ini. Jadwal: ${tgl} pukul ${jd.waktu_mulai?.slice(0, 5)} WIB.`,
          });
        }
        if (selesaiDt && now > selesaiDt) {
          await conn.rollback();
          return res.status(410).json({ error: "Tes tidak tersedia saat ini. Jadwal tes sudah berakhir." });
        }
      }
    }

    if (pengerjaan.status === "selesai" || pengerjaan.status === "menunggu_koreksi") {
      await conn.rollback();
      return res.status(409).json({ error: "Tes sudah dikumpulkan" });
    }

    // Sudah berlangsung dan deadline belum habis → kembalikan sisa waktu
    if (pengerjaan.status === "berlangsung" && pengerjaan.waktu_deadline && new Date() < new Date(pengerjaan.waktu_deadline)) {
      await conn.rollback();
      const sisaDetik = Math.max(0, Math.floor((new Date(pengerjaan.waktu_deadline) - new Date()) / 1000));
      return res.json({ success: true, sisaDetik, pengerjaanId: pengerjaan.id });
    }

    const waktuMulai    = new Date();
    const waktuDeadline = new Date(waktuMulai.getTime() + (pengerjaan.durasi_menit || 60) * 60 * 1000);

    await conn.query(
      "UPDATE tes_pengerjaan SET status='berlangsung', waktu_mulai=?, waktu_deadline=? WHERE id=?",
      [waktuMulai, waktuDeadline, pengerjaan.id]
    );

    await conn.commit();
    res.json({ success: true, sisaDetik: Math.floor((waktuDeadline - new Date()) / 1000), pengerjaanId: pengerjaan.id });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

// GET /api/tes/:id/soal — ambil soal tes (hanya saat berlangsung)
router.get("/:id/soal", auth, async (req, res) => {
  try {
    const [[lamaran]] = await db.query(
      "SELECT id FROM lamaran WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    if (!lamaran) return res.status(403).json({ error: "Tidak memiliki lamaran aktif" });

    const [[pengerjaan]] = await db.query(
      "SELECT * FROM tes_pengerjaan WHERE tes_id=? AND lamaran_id=?",
      [req.params.id, lamaran.id]
    );
    if (!pengerjaan) return res.status(403).json({ error: "Anda tidak terdaftar" });
    if (pengerjaan.status === "belum_mulai") return res.status(403).json({ error: "Mulai tes terlebih dahulu" });
    if (pengerjaan.status === "selesai" || pengerjaan.status === "menunggu_koreksi") {
      return res.status(409).json({ error: "Tes sudah dikumpulkan" });
    }

    // Auto-submit bila deadline sudah lewat
    if (pengerjaan.waktu_deadline && new Date() > new Date(pengerjaan.waktu_deadline)) {
      return res.status(410).json({ error: "Waktu tes habis, jawaban otomatis dikumpulkan" });
    }

    const [soal] = await db.query(
      `SELECT bs.id, bs.tipe, bs.pertanyaan, bs.opsi_a, bs.opsi_b, bs.opsi_c, bs.opsi_d, ts.urutan,
              tj.jawaban AS jawaban_terpilih, tj.jawaban_text
       FROM tes_soal ts
       JOIN bank_soal bs ON bs.id = ts.soal_id
       LEFT JOIN tes_jawaban tj ON tj.soal_id = bs.id AND tj.pengerjaan_id = ?
       WHERE ts.tes_id = ?
       ORDER BY ts.urutan ASC`,
      [pengerjaan.id, req.params.id]
    );
    const sisaDetik = pengerjaan.waktu_deadline
      ? Math.max(0, Math.floor((new Date(pengerjaan.waktu_deadline) - new Date()) / 1000))
      : null;

    res.json({ soal, sisaDetik, pengerjaanId: pengerjaan.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/tes/:id/jawab — simpan satu jawaban (auto-save)
router.patch("/:id/jawab", auth, async (req, res) => {
  const { soalId, jawaban, jawabanText } = req.body;
  if (!soalId) return res.status(400).json({ error: "soalId wajib" });
  try {
    const [[lamaran]] = await db.query(
      "SELECT id FROM lamaran WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    if (!lamaran) return res.status(403).json({ error: "Tidak memiliki lamaran" });

    const [[pengerjaan]] = await db.query(
      "SELECT * FROM tes_pengerjaan WHERE tes_id=? AND lamaran_id=?",
      [req.params.id, lamaran.id]
    );
    if (!pengerjaan || pengerjaan.status !== "berlangsung") {
      return res.status(409).json({ error: "Tes tidak berlangsung" });
    }
    if (pengerjaan.waktu_deadline && new Date() > new Date(pengerjaan.waktu_deadline)) {
      return res.status(410).json({ error: "Waktu tes telah habis" });
    }

    await db.query(
      `INSERT INTO tes_jawaban (pengerjaan_id, soal_id, jawaban, jawaban_text) VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE jawaban=VALUES(jawaban), jawaban_text=VALUES(jawaban_text)`,
      [pengerjaan.id, soalId, jawaban || null, jawabanText || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/tes/:id/submit — kumpulkan tes (manual atau timeout)
router.post("/:id/submit", auth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[lamaran]] = await conn.query(
      "SELECT id FROM lamaran WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    if (!lamaran) { await conn.rollback(); return res.status(403).json({ error: "Tidak memiliki lamaran" }); }

    const [[pengerjaan]] = await conn.query(
      `SELECT tp.*, t.kkm, t.id AS tes_id FROM tes_pengerjaan tp
       JOIN tes_online t ON t.id = tp.tes_id
       WHERE tp.tes_id=? AND tp.lamaran_id=?`,
      [req.params.id, lamaran.id]
    );
    if (!pengerjaan || pengerjaan.status !== "berlangsung") {
      await conn.rollback();
      return res.status(409).json({ error: "Tidak bisa dikumpulkan" });
    }

    // Auto-score PG
    const [soalList] = await conn.query(
      `SELECT bs.id AS soal_id, bs.tipe, bs.kunci_jawaban, bs.bobot,
              tj.jawaban, tj.jawaban_text
       FROM tes_soal ts
       JOIN bank_soal bs ON bs.id = ts.soal_id
       LEFT JOIN tes_jawaban tj ON tj.soal_id = bs.id AND tj.pengerjaan_id = ?
       WHERE ts.tes_id = ?`,
      [pengerjaan.id, pengerjaan.tes_id]
    );

    let totalBobotPG  = 0;
    let totalBobotEsai = 0;
    let nilaiPG       = 0;
    let jumlahBenar   = 0;
    let adaEsai       = false;

    for (const soal of soalList) {
      if (soal.tipe === "pilihan_ganda") {
        totalBobotPG += Number(soal.bobot);
        const isBenar = soal.jawaban && soal.jawaban === soal.kunci_jawaban ? 1 : 0;
        if (isBenar) { nilaiPG += Number(soal.bobot); jumlahBenar++; }
        await conn.query(
          `INSERT INTO tes_jawaban (pengerjaan_id, soal_id, jawaban, is_benar) VALUES (?,?,?,?)
           ON DUPLICATE KEY UPDATE is_benar=VALUES(is_benar)`,
          [pengerjaan.id, soal.soal_id, soal.jawaban || null, isBenar]
        );
      } else {
        adaEsai = true;
        totalBobotEsai += Number(soal.bobot);
        if (soal.jawaban_text !== null && soal.jawaban_text !== undefined) {
          await conn.query(
            `INSERT INTO tes_jawaban (pengerjaan_id, soal_id, jawaban_text, is_dinilai) VALUES (?,?,?,0)
             ON DUPLICATE KEY UPDATE jawaban_text=VALUES(jawaban_text), is_dinilai=0`,
            [pengerjaan.id, soal.soal_id, soal.jawaban_text || ""]
          );
        }
      }
    }

    const totalBobot = totalBobotPG + totalBobotEsai;
    const newStatus  = adaEsai ? "menunggu_koreksi" : "selesai";
    const finalSkor  = adaEsai ? null : (totalBobotPG > 0 ? (nilaiPG / totalBobotPG) * 100 : 0);

    await conn.query(
      "UPDATE tes_pengerjaan SET status=?, waktu_selesai=NOW(), skor=?, jumlah_benar=?, updated_at=NOW() WHERE id=?",
      [newStatus, finalSkor, jumlahBenar, pengerjaan.id]
    );

    if (!adaEsai) {
      // Finalisasi hasil_seleksi tes_tulis (tahap urutan 2)
      const lulus = Number(finalSkor) >= Number(pengerjaan.kkm);
      const [[tahapTesTulis]] = await conn.query("SELECT id FROM tahap_seleksi WHERE urutan = 2");
      if (tahapTesTulis) {
        const [[ex]] = await conn.query("SELECT id FROM hasil_seleksi WHERE lamaran_id=? AND tahap_id=?", [lamaran.id, tahapTesTulis.id]);
        if (ex) {
          await conn.query("UPDATE hasil_seleksi SET status=?, nilai=? WHERE id=?", [lulus ? "lulus" : "tidak_lulus", finalSkor, ex.id]);
        } else {
          await conn.query("INSERT INTO hasil_seleksi (lamaran_id, tahap_id, status, nilai) VALUES (?,?,?,?)", [lamaran.id, tahapTesTulis.id, lulus ? "lulus" : "tidak_lulus", finalSkor]);
        }
      }
      await conn.query(
        "INSERT INTO notifikasi (user_id, judul, pesan, tipe, link_url) VALUES (?,?,?,?,?)",
        [req.user.id, "Hasil Tes Tertulis",
         lulus
           ? `Selamat! Anda lulus tes tertulis dengan skor ${Number(finalSkor).toFixed(1)}.`
           : `Skor tes tertulis Anda: ${Number(finalSkor).toFixed(1)} (KKM: ${pengerjaan.kkm}).`,
         lulus ? "sukses" : "peringatan", "/dashboard"]
      );
    } else {
      // Notif ke admin/hrd untuk koreksi esai
      const [admins] = await conn.query("SELECT id FROM users WHERE role IN ('admin','hrd') AND is_active=1");
      const [[profil]] = await conn.query("SELECT nama_lengkap FROM user_profiles WHERE user_id=?", [req.user.id]);
      const namaPelamar = profil?.nama_lengkap || "Pelamar";
      for (const a of admins) {
        await conn.query(
          "INSERT INTO notifikasi (user_id, judul, pesan, tipe, link_url) VALUES (?,?,?,?,?)",
          [a.id, "Jawaban Esai Perlu Dikoreksi",
           `${namaPelamar} telah menyelesaikan tes. Terdapat soal esai yang perlu dikoreksi.`,
           "peringatan", "/admin/tes"]
        );
      }
      // Notif ke pelamar: menunggu koreksi
      await conn.query(
        "INSERT INTO notifikasi (user_id, judul, pesan, tipe, link_url) VALUES (?,?,?,?,?)",
        [req.user.id, "Tes Berhasil Dikumpulkan",
         "Waktu habis, jawaban telah otomatis dikumpulkan. Soal esai sedang dalam proses koreksi oleh HRD.",
         "info", "/tes"]
      );
    }

    await conn.commit();
    res.json({
      success: true,
      status: newStatus,
      message: adaEsai
        ? "Waktu habis, jawaban telah otomatis dikumpulkan"
        : "Tes berhasil dikumpulkan",
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

module.exports = router;
