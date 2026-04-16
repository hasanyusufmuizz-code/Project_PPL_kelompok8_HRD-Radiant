# Project_PPL_kelompok8_HRD-Radiant
## Deskripsi
Project ini merupakan aplikasi yang dikembangkan untuk membantu proses Human Resource Development (HRD) dalam mengelola data karyawan, rekrutmen, dan administrasi secara lebih efisien.

## Anggota Tim
- Hasan Yusuf Muizz
- Akhdan Yavi Widiyanto
- Raihan Juniardi
- Ahmad Daffa Alfisyahri
- Abdullah Maulana Putra
- Alia felanitami
- Zaidan 

## Tech Stack
- Node.js
- JavaScript
- GitHub
- GitHub Actions (CI/CD)

## Cara Menjalankan Project
1. Install Node.js (https://nodejs.org)
2. Clone repository:
   git clone https://github.com/hasanyusufmuizz-code/Project_PPL_kelompok8_HRD-Radiant.git

3. Masuk ke folder project:
   cd Project_PPL_kelompok8_HRD-Radiant

4. Install dependencies:
   npm install

5. Jalankan aplikasi:
   npm start
# HRD Radian

Aplikasi Flutter untuk SDM/HRD (Radian Edu Solution).

## Prasyarat

- Flutter SDK (channel Stable) dengan Dart **>= 3.11.0**
	- Cek versi: `flutter --version`
	- Cek kesiapan toolchain: `flutter doctor`
- Git

Tambahan sesuai target platform:

- **Android**: Android Studio + Android SDK + emulator/perangkat
- **iOS** (khusus macOS): Xcode + CocoaPods
- **Web** (opsional): Google Chrome
- **Desktop** (opsional): toolchain sesuai OS (mis. Xcode untuk macOS)

## Instalasi

1) Clone repo

```bash
git clone <repo-url>
cd Project_PPL_kelompok8_HRD-Radiant
```

2) Pastikan environment siap

```bash
flutter doctor
```

3) Ambil dependency

```bash
flutter pub get
```

## Menjalankan Aplikasi

Sebelum menjalankan, pastikan ada device/emulator tersedia:

```bash
flutter devices
```

### Android

```bash
flutter run
# atau pilih device Android tertentu:
flutter run -d <device_id_android>
```

Catatan: file `android/local.properties` bersifat **lokal (machine-specific)**.
Kalau build Android gagal karena `sdk.dir` atau `flutter.sdk`, sesuaikan path-nya
atau hapus file tersebut dan biarkan Gradle/Flutter membuat ulang.

### iOS (macOS)

```bash
flutter run
# atau pilih simulator/perangkat iOS tertentu:
flutter run -d <device_id_ios>
```

Jika ada masalah CocoaPods:

```bash
cd ios
pod install
cd ..
```

### Web

```bash
flutter run -d chrome
```

### macOS

```bash
flutter run -d macos
```

## Build (Release)

### Android

- APK:

```bash
flutter build apk --release
```

- App Bundle (Play Store):

```bash
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
```

Untuk distribusi (TestFlight/App Store), lakukan signing & archiving via Xcode.

### Web

```bash
flutter build web --release
```

## Troubleshooting Cepat

- Bersihkan build cache:

```bash
flutter clean
flutter pub get
```

- Perbaiki problem iOS (Pods):

```bash
cd ios
pod repo update
pod install
cd ..
```

## Catatan

- Asset sudah terdaftar di `pubspec.yaml`:
	- `assets/img/`
	- `assets/icons/`
- Saat ini kode UI bersifat statis (belum ada konfigurasi backend/API di repo).
