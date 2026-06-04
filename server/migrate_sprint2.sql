-- ============================================================
-- MIGRASI SPRINT 2: Tes Online, Penilaian, Kelulusan
-- HRD SDM Management Bimbel Radiant | Kelompok 8
-- ============================================================

USE hrd_radiant;

-- ============================================================
-- BANK SOAL (US-010 Tes Kandidat Online)
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_soal (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  lowongan_id   INT UNSIGNED    NULL COMMENT 'NULL = soal umum/reusable lintas lowongan',
  tipe          ENUM('pilihan_ganda','esai') NOT NULL DEFAULT 'pilihan_ganda',
  pertanyaan    TEXT            NOT NULL,
  opsi_a        VARCHAR(500)    NULL,
  opsi_b        VARCHAR(500)    NULL,
  opsi_c        VARCHAR(500)    NULL,
  opsi_d        VARCHAR(500)    NULL,
  kunci_jawaban ENUM('A','B','C','D') NULL COMMENT 'NULL untuk soal esai',
  bobot         INT UNSIGNED    NOT NULL DEFAULT 1,
  dibuat_oleh   INT UNSIGNED    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_soal_lowongan (lowongan_id),
  CONSTRAINT fk_soal_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan(id) ON DELETE SET NULL,
  CONSTRAINT fk_soal_dibuat   FOREIGN KEY (dibuat_oleh) REFERENCES users(id)    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- PAKET TES ONLINE (US-011 Jadwalkan tes, US-012 Kerjakan tes)
-- ============================================================
CREATE TABLE IF NOT EXISTS tes_online (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  lowongan_id   INT UNSIGNED    NULL,
  jadwal_id     INT UNSIGNED    NULL COMMENT 'Referensi jadwal_seleksi jenis tes_tertulis',
  judul         VARCHAR(200)    NOT NULL,
  durasi_menit  INT UNSIGNED    NOT NULL DEFAULT 60,
  jumlah_soal   INT UNSIGNED    NOT NULL DEFAULT 0,
  kkm           DECIMAL(5,2)    NOT NULL DEFAULT 60.00 COMMENT 'Nilai minimum kelulusan 0-100',
  status        ENUM('draft','aktif','selesai') NOT NULL DEFAULT 'draft',
  dibuat_oleh   INT UNSIGNED    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tes_lowongan (lowongan_id),
  CONSTRAINT fk_tes_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan(id)       ON DELETE SET NULL,
  CONSTRAINT fk_tes_jadwal   FOREIGN KEY (jadwal_id)   REFERENCES jadwal_seleksi(id)  ON DELETE SET NULL,
  CONSTRAINT fk_tes_dibuat   FOREIGN KEY (dibuat_oleh) REFERENCES users(id)           ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- MAPPING SOAL <-> PAKET TES
-- ============================================================
CREATE TABLE IF NOT EXISTS tes_soal (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tes_id   INT UNSIGNED NOT NULL,
  soal_id  INT UNSIGNED NOT NULL,
  urutan   INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tes_soal (tes_id, soal_id),
  CONSTRAINT fk_ts_tes  FOREIGN KEY (tes_id)  REFERENCES tes_online(id) ON DELETE CASCADE,
  CONSTRAINT fk_ts_soal FOREIGN KEY (soal_id) REFERENCES bank_soal(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- PENGERJAAN TES OLEH PELAMAR
-- ============================================================
CREATE TABLE IF NOT EXISTS tes_pengerjaan (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tes_id           INT UNSIGNED NOT NULL,
  lamaran_id       INT UNSIGNED NOT NULL,
  waktu_mulai      DATETIME     NULL,
  waktu_selesai    DATETIME     NULL,
  waktu_deadline   DATETIME     NULL COMMENT 'waktu_mulai + durasi_menit, dipakai server-side timeout',
  skor             DECIMAL(5,2) NULL,
  jumlah_benar     INT UNSIGNED NULL,
  status           ENUM('belum_mulai','berlangsung','selesai','menunggu_koreksi') NOT NULL DEFAULT 'belum_mulai',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pengerjaan (tes_id, lamaran_id),
  INDEX idx_peng_tes     (tes_id),
  INDEX idx_peng_lamaran (lamaran_id),
  CONSTRAINT fk_peng_tes     FOREIGN KEY (tes_id)     REFERENCES tes_online(id) ON DELETE CASCADE,
  CONSTRAINT fk_peng_lamaran FOREIGN KEY (lamaran_id) REFERENCES lamaran(id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- JAWABAN PER SOAL
-- ============================================================
CREATE TABLE IF NOT EXISTS tes_jawaban (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  pengerjaan_id INT UNSIGNED NOT NULL,
  soal_id       INT UNSIGNED NOT NULL,
  jawaban       ENUM('A','B','C','D') NULL   COMMENT 'Jawaban PG',
  jawaban_text  TEXT         NULL             COMMENT 'Jawaban esai',
  is_benar      TINYINT(1)   NULL             COMMENT 'NULL = esai belum dinilai',
  nilai_esai    DECIMAL(5,2) NULL             COMMENT 'Nilai esai dari penilai (0-bobot)',
  is_dinilai    TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_jawaban (pengerjaan_id, soal_id),
  CONSTRAINT fk_jaw_pengerjaan FOREIGN KEY (pengerjaan_id) REFERENCES tes_pengerjaan(id) ON DELETE CASCADE,
  CONSTRAINT fk_jaw_soal       FOREIGN KEY (soal_id)       REFERENCES bank_soal(id)       ON DELETE CASCADE
) ENGINE=InnoDB;
