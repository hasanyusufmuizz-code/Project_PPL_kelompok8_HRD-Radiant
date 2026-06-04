# 📘 Panduan Penggunaan Website HRD SDM Management — Bimbel Radiant

Dokumen ini menjelaskan cara menggunakan sistem rekrutmen Bimbel Radiant secara lengkap, baik dari sisi **Pelamar** maupun **Admin/HRD**.

---

## Daftar Isi
1. [Pengenalan & Peran Pengguna](#1-pengenalan--peran-pengguna)
2. [Memulai: Akses & Akun](#2-memulai-akses--akun)
3. [Panduan untuk PELAMAR](#3-panduan-untuk-pelamar)
4. [Panduan untuk ADMIN / HRD](#4-panduan-untuk-admin--hrd)
5. [Alur Seleksi End-to-End](#5-alur-seleksi-end-to-end)
6. [Sistem Notifikasi](#6-sistem-notifikasi)
7. [Pertanyaan Umum (FAQ)](#7-pertanyaan-umum-faq)

---

## 1. Pengenalan & Peran Pengguna

Website ini adalah **portal rekrutmen tenaga pendidik/staf** Bimbel Radiant. Pelamar mendaftar dan mengikuti seleksi secara online, sementara tim HRD mengelola seluruh proses seleksi sampai keputusan akhir.

Terdapat **3 peran**, terbagi menjadi 2 tampilan aplikasi:

| Peran | Akses | Tampilan |
|-------|-------|----------|
| **Pelamar** | Portal pelamar | Navbar atas (Dashboard, Lowongan, Berkas, Jadwal, Tes Online, Profil) |
| **HRD** | Panel admin | Sidebar kiri (akses penuh seleksi) |
| **Admin** | Panel admin | Sidebar kiri (akses penuh + Kelola User) |

> **Catatan:** Peran "Pewawancara", "Manajer Training", dan "Pimpinan" pada dokumen requirement dijalankan oleh akun ber-role **HRD/Admin** di sistem ini.

**Tahapan seleksi** mengikuti 5 tahap berurutan:
```
1. Administrasi  →  2. Tes Tulis (CBT)  →  3. Micro Teaching  →  4. Wawancara  →  5. Keputusan Final
```

---

## 2. Memulai: Akses & Akun

### Menjalankan aplikasi (untuk developer)
1. **Database**: jalankan skema utama lalu migrasi Sprint 2
   ```bash
   mysql -u root -p hrd_radiant < database.sql
   mysql -u root -p hrd_radiant < server/migrate_sprint2.sql
   ```
2. **Backend**: `npm run server` (berjalan di `http://localhost:3001`)
3. **Frontend**: `npm run dev` (berjalan di `http://localhost:5173`)

### Halaman Login
Saat membuka website, semua pengguna diarahkan ke **halaman Login**. Halaman ini punya 2 mode (tombol toggle **Masuk / Daftar**):

- **Akun Pelamar baru** → klik **Daftar**, isi Nama Lengkap, Email, Password (min 8 karakter).
- **Akun Admin/HRD** → sudah disediakan saat setup database (mis. `admin@radiant.sch.id`, `hrd@radiant.sch.id`). Gunakan password yang ditetapkan tim saat instalasi. Akun admin/HRD baru hanya dapat dibuat oleh Admin melalui menu **Kelola User**.

Setelah login berhasil, sistem otomatis mengarahkan:
- Pelamar → `/dashboard`
- Admin/HRD → `/admin/dashboard`

---

## 3. Panduan untuk PELAMAR

### 🏠 Langkah 1 — Dashboard
Halaman utama setelah login. Menampilkan:
- **Tahap aktif** seleksimu saat ini
- **Progress** tahap yang sudah/sedang/belum dilalui
- **Nilai** per tahap (muncul setelah dinilai HRD)

Pantau halaman ini untuk mengetahui posisi terkini dalam proses seleksi.

### 👤 Langkah 2 — Lengkapi Profil
Buka menu **Profil**:
1. Isi Nama Lengkap, Nomor HP, Alamat, Pendidikan, Instansi, dan deskripsi singkat.
2. Klik **Simpan**.

> Pastikan nomor HP valid (hanya angka), agar tidak muncul pesan validasi.

### 💼 Langkah 3 — Daftar Lowongan
Buka menu **Lowongan**:
1. Lihat daftar lowongan aktif (posisi, deskripsi, persyaratan, deadline).
2. Klik lowongan untuk melihat detail.
3. Klik **Daftar** pada posisi yang diinginkan.
4. Sistem mencatat lamaranmu dan kamu otomatis masuk **Tahap Administrasi**.

> Kamu tidak bisa mendaftar dua kali pada lowongan yang sama.

### 📎 Langkah 4 — Upload Berkas
Buka menu **Berkas**:
1. Unggah dokumen yang diminta (CV, ijazah, foto, dan dokumen khusus bila ada).
2. Format **PDF**, ukuran maksimal sesuai ketentuan.
3. Status tiap berkas: **Belum Diproses → Terverifikasi / Ditolak**.
4. Jika berkas **ditolak**, kamu akan menerima notifikasi 🔔 + catatan, lalu upload ulang berkas yang sesuai.

### 📝 Langkah 5 — Kerjakan Tes Online ⭐
Buka menu **Tes Online**:
1. Tes muncul setelah HRD menjadwalkannya (kamu dapat notifikasi 🔔).
2. **Tes hanya bisa dibuka sesuai jadwal.** Jika belum waktunya, akan ada keterangan "Belum dimulai" beserta tanggal & jam tes.
3. Saat jadwal tiba, klik **Mulai Tes**.
4. Di halaman pengerjaan:
   - **Timer hitung mundur** muncul di kanan atas (berubah merah saat < 5 menit).
   - Soal **Pilihan Ganda**: klik salah satu opsi A/B/C/D.
   - Soal **Esai**: ketik jawaban di kolom teks.
   - **Jawaban tersimpan otomatis** setiap kali kamu menjawab.
   - Gunakan panel **Navigasi Soal** (kanan) untuk lompat antar soal; kotak hijau = sudah dijawab.
5. Selesai mengerjakan:
   - Klik **Kumpulkan** (lalu konfirmasi), **atau**
   - Jika waktu habis (00:00), jawaban **otomatis dikumpulkan**.
6. Hasil:
   - Jika tes hanya pilihan ganda → **skor langsung keluar**.
   - Jika ada soal esai → status **"Menunggu Koreksi"** sampai HRD menilai esaimu.

### 📅 Langkah 6 — Jadwal (Micro Teaching & Wawancara)
Buka menu **Jadwal**:
1. Lihat **Jadwal Mendatang** dan **Riwayat Jadwal**.
2. Tiap kartu menampilkan jenis sesi, tanggal, jam, lokasi/link online.
3. Setelah mengikuti sesi, klik **Konfirmasi Hadir / Selesai** agar HRD tahu untuk segera menilai.

### 📊 Langkah 7 — Pantau Hasil & Keputusan
- Kembali ke **Dashboard** untuk melihat progres & nilai terbaru.
- Notifikasi 🔔 (ikon lonceng di kanan atas) memberitahu setiap perkembangan: berkas terverifikasi, jadwal tes, hasil tes, hasil wawancara, hingga **keputusan final (Diterima / Tidak Diterima)**.

---

## 4. Panduan untuk ADMIN / HRD

Setelah login, kamu masuk **Panel Admin** dengan menu di **sidebar kiri**. Berikut urutan kerja sesuai alur seleksi.

### 📊 Dashboard Admin
Menu **Dashboard** menampilkan statistik ringkas: jumlah pelamar, lowongan aktif, dan distribusi status seleksi.

### 💼 Langkah 1 — Kelola Lowongan
Menu **Kelola Lowongan**:
1. Klik **Buat Lowongan** → isi posisi, deskripsi, persyaratan, kuota, deadline → **Publikasi**.
2. Lowongan dengan status "Aktif" akan tampil bagi pelamar.
3. Kamu bisa **Edit** atau **Tutup Lowongan** kapan saja.

### 📎 Langkah 2 — Verifikasi Berkas
Menu **Kelola Berkas**:
1. Lihat berkas yang diunggah pelamar (bisa difilter per status/lowongan/nama).
2. Klik **Preview/Unduh** untuk memeriksa dokumen.
3. Tetapkan status: **Terverifikasi** atau **Ditolak** (beri catatan bila ditolak).
4. Pelamar **otomatis menerima notifikasi** atas keputusan verifikasi.

### 👥 Langkah 3 — Kelola Data Pelamar
Menu **Data Pelamar**:
1. Lihat semua pelamar; filter berdasarkan **status**, **lowongan**, atau cari **nama/email**.
2. Klik **Detail** pada seorang pelamar.
3. Ubah **Tahap Seleksi** (mis. dari Administrasi → Tes Tulis) dan tambahkan **Catatan HRD**.
4. Klik **Simpan Status** → progres pelamar diperbarui & pelamar dapat notifikasi.

### 📚 Langkah 4 — Siapkan Bank Soal ⭐
Menu **Bank Soal**:
1. Klik **Tambah Soal**.
2. Pilih tipe soal:
   - **Pilihan Ganda**: isi pertanyaan, 4 opsi (A–D), lalu klik huruf opsi untuk menandai **kunci jawaban**.
   - **Esai**: isi pertanyaan saja (dengan **bobot** nilai).
3. (Opsional) kaitkan soal ke lowongan tertentu, atau biarkan **Umum** (bisa dipakai lintas lowongan).
4. Klik **Simpan Soal**. Soal bisa di-**Edit** atau **Hapus** kapan saja.

> Soal wajib diisi minimal pertanyaan (dan kunci jawaban untuk pilihan ganda), jika tidak akan muncul pesan validasi.

### 🗓️ Langkah 5 — Jadwalkan Tes Tertulis ⭐
Menu **Jadwal Interview**:
1. Buat jadwal baru dengan **jenis = Tes Tertulis**, tentukan tanggal & jam.
2. Jadwal ini akan dipakai sebagai "jendela waktu" pengerjaan tes.

### 🖥️ Langkah 6 — Buat Paket Tes Online ⭐
Menu **Tes Online** → klik **Buat Paket Tes**:
1. Isi **Judul Tes**, pilih **Lowongan**, pilih **Jadwal Tes Tertulis**, atur **Durasi (menit)** dan **KKM** (nilai minimum lulus).
2. **Centang soal-soal** dari bank soal yang akan dipakai.
3. Klik **Jadwalkan Tes**.
4. Sistem otomatis **mendaftarkan semua pelamar yang sudah lolos verifikasi** sebagai peserta + **mengirim notifikasi** ke mereka.

> Jika bank soal kosong atau tanggal jadwal sudah lewat, sistem menolak pembuatan paket tes.

### ✍️ Langkah 7 — Koreksi Jawaban Esai ⭐
Masih di menu **Tes Online**:
1. Klik salah satu paket tes untuk melihat daftar peserta dan skornya.
2. Peserta berstatus **"Menunggu Koreksi"** → klik **Koreksi Esai**.
3. Baca jawaban esai pelamar, beri **nilai per soal** (0 sampai bobot soal).
4. Klik **Simpan Koreksi**.
5. Setelah semua esai dinilai, **skor akhir dihitung otomatis** (gabungan PG + esai), dibandingkan dengan KKM, lalu hasil tahap Tes Tulis ditetapkan **Lulus/Tidak Lulus** dan pelamar dapat notifikasi.

### 🎤 Langkah 8 — Jadwalkan & Nilai Wawancara ⭐
1. **Jadwal Interview**: buat jadwal jenis **Wawancara** (atau Micro Teaching), pelamar otomatis dapat notifikasi.
2. Menu **Penilaian** → klik **Input Penilaian**:
   - Pilih kandidat (yang berstatus Wawancara) dan sesi wawancaranya.
   - Isi **rubrik 4 kriteria**: Kompetensi, Komunikasi, Kepribadian, Motivasi (skala 0–100).
   - **Nilai Total dihitung otomatis** (rata-rata). Semua kriteria **wajib diisi**.
   - Tambahkan catatan bila perlu → **Submit Penilaian**.
   - Jika nilai di bawah KKM, kandidat otomatis diberi label "Tidak Lulus Wawancara".

### 🏆 Langkah 9 — Tentukan Kelulusan ⭐
Menu **Kelulusan**:
1. Lihat tabel kandidat lengkap dengan **Skor Tes**, **Nilai Wawancara**, **Nilai Gabungan** (tes 40% + wawancara 60%), dan **Rekomendasi** otomatis (Direkomendasikan Lulus / Tidak / Belum Lengkap).
2. Filter berdasarkan posisi atau rekomendasi bila perlu.
3. Klik **Lulus** atau **Tidak Lulus** pada kandidat → konfirmasi.
4. Keputusan ini **memperbarui status lamaran** (Diterima/Ditolak) di seluruh sistem dan **mengirim notifikasi final** ke kandidat.

### 👤 Kelola User (khusus Admin)
Menu **Kelola User**: membuat/mengelola akun pengguna, termasuk menetapkan peran (pelamar/HRD/admin).

---

## 5. Alur Seleksi End-to-End

```
┌──────────────────────────── PELAMAR ────────────────────────────┐
│ Daftar akun → Lengkapi Profil → Daftar Lowongan → Upload Berkas  │
│        → Kerjakan Tes Online → Hadiri Wawancara → Lihat Hasil    │
└──────────────────────────────────────────────────────────────────┘
                         ⇅  (terhubung lewat notifikasi 🔔)  ⇅
┌──────────────────────────── ADMIN/HRD ──────────────────────────┐
│ Buat Lowongan → Verifikasi Berkas → Bank Soal → Buat Paket Tes   │
│   → Koreksi Esai → Jadwal & Nilai Wawancara → Tentukan Kelulusan │
└──────────────────────────────────────────────────────────────────┘
```

**Pemetaan tahap & aksi:**

| Tahap | Aksi Pelamar | Aksi Admin/HRD |
|-------|--------------|----------------|
| 1. Administrasi | Upload berkas | Verifikasi berkas, ubah status |
| 2. Tes Tulis (CBT) | Kerjakan tes online | Buat bank soal, paket tes, koreksi esai |
| 3. Micro Teaching | Hadiri & konfirmasi | Jadwalkan, nilai |
| 4. Wawancara | Hadiri & konfirmasi | Jadwalkan, isi rubrik penilaian |
| 5. Keputusan Final | Lihat hasil di dashboard | Tetapkan Lulus/Tidak Lulus di menu Kelulusan |

---

## 6. Sistem Notifikasi

Ikon **lonceng 🔔** di kanan atas (tersedia di portal pelamar maupun panel admin) menampilkan pemberitahuan real-time. Notifikasi dikirim otomatis saat:

- Berkas **terverifikasi** atau **ditolak** (→ pelamar)
- **Tes dijadwalkan** (→ pelamar peserta)
- **Hasil tes** keluar (→ pelamar)
- Pelamar **mengonfirmasi kehadiran** (→ HRD, agar segera menilai)
- Terdapat **jawaban esai perlu dikoreksi** (→ HRD)
- **Jadwal wawancara** ditetapkan (→ pelamar)
- **Hasil wawancara** disimpan (→ pelamar)
- **Keputusan final** ditetapkan (→ pelamar)

Klik notifikasi untuk langsung menuju halaman terkait. Gunakan **"Tandai semua terbaca"** untuk membersihkan badge.

---

## 7. Pertanyaan Umum (FAQ)

**Q: Saya pelamar, kenapa menu Tes Online kosong?**
A: Tes baru muncul setelah HRD membuat paket tes dan mendaftarkanmu sebagai peserta. Pastikan berkasmu sudah terverifikasi.

**Q: Tombol "Mulai Tes" tidak bisa diklik / tertulis "Belum dimulai".**
A: Tes hanya dapat dikerjakan sesuai jadwal. Tunggu sampai tanggal & jam yang tertera.

**Q: Apa yang terjadi jika waktu tes habis sebelum saya submit?**
A: Sistem otomatis mengumpulkan jawaban yang sudah terisi dan menghitung nilainya — kamu tidak kehilangan jawaban yang sempat diisi.

**Q: Kenapa skor tes saya belum muncul?**
A: Jika tes mengandung soal esai, skor baru final setelah HRD selesai mengoreksi esai.

**Q: Saya HRD, kenapa kandidat tidak muncul di menu Kelulusan?**
A: Kandidat muncul setelah mencapai tahap Wawancara dan idealnya sudah punya nilai tes & wawancara.

**Q: Bagaimana membuat akun HRD/Admin baru?**
A: Hanya Admin yang dapat membuatnya melalui menu **Kelola User**. Registrasi mandiri selalu menghasilkan akun pelamar.

---

*Dokumen ini disusun untuk sistem HRD SDM Management Bimbel Radiant — Kelompok 8.*
