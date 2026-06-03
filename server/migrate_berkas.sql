-- Migration: berkas_inti + syarat_dokumen_lowongan
-- Jalankan sekali di MySQL setelah server diupdate

-- 1. Tabel berkas inti (dokumen core pelamar, tidak terikat lamaran)
CREATE TABLE IF NOT EXISTS berkas_inti (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id             INT UNSIGNED    NOT NULL,
  jenis_dokumen       VARCHAR(100)    NOT NULL,
  nama_file           VARCHAR(255)    NOT NULL,
  file_url            VARCHAR(500)    NOT NULL,
  ukuran_file         INT UNSIGNED    NULL,
  status_verifikasi   ENUM('belum_diproses','terverifikasi','ditolak') NOT NULL DEFAULT 'belum_diproses',
  catatan_verifikasi  TEXT            NULL,
  diverifikasi_oleh   INT UNSIGNED    NULL,
  diverifikasi_pada   DATETIME        NULL,
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_user_jenis (user_id, jenis_dokumen),
  INDEX idx_berkas_inti_user (user_id),
  CONSTRAINT fk_berkas_inti_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_berkas_inti_verifikator FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 2. Tabel syarat dokumen khusus per lowongan (configurable by admin)
CREATE TABLE IF NOT EXISTS syarat_dokumen_lowongan (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  lowongan_id   INT UNSIGNED    NOT NULL,
  nama_dokumen  VARCHAR(255)    NOT NULL,
  kode_dokumen  VARCHAR(100)    NOT NULL,
  deskripsi     VARCHAR(500)    NULL,
  wajib         TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_syarat_lowongan (lowongan_id),
  CONSTRAINT fk_syarat_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Ubah jenis_dokumen di dokumen_lamaran dari ENUM ke VARCHAR
--    agar bisa menyimpan kode dokumen khusus (e.g. sertifikat_ielts)
ALTER TABLE dokumen_lamaran MODIFY jenis_dokumen VARCHAR(100) NOT NULL;
