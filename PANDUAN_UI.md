# UI Explorer — tahap 1–3

Paket lengkap ini melanjutkan backend AI dan perbaikan origin yang sudah berjalan.
Ekstrak ke folder baru; jangan menimpa proyek tim tanpa backup.
Salin ai-service/.env dan frontend/.env.local milikmu dari proyek yang berfungsi.
Pastikan frontend/.env.local tetap berisi AI_ALLOWED_ORIGINS untuk alamat browsermu.
Jalankan npm ci di frontend, lalu python run_dev.py dari folder utama.
Tidak perlu survei atau merge data ulang.

## Yang tersedia

- Panel Explorer dan Detail/AI dapat ditutup untuk memperluas peta.
- Tab Detail dan AI; riwayat chat bergulir, form pertanyaan tetap di bawah panel.
- Pilihan satelit (default), terang, dan basic dengan sudut kamera 55 derajat.
- Checkbox batas studi, survei, referensi OSM/RBI, dan Menu Go simulasi.
- Legenda warna dan opasitas overlay; tombol Fokus 1 km.
- Pencarian teks laporan/menu pada katalog lokal, maksimal 30 hasil yang ditampilkan.
- Klik titik survei membuka detail; beberapa laporan satu titik ditampilkan sebagai pilihan.
- Hasil tanpa koordinat membuka teks saja. Koordinat tidak dikarang.
- Data demo tidak masuk konteks AI; titik OSM/RBI belum memiliki panel detail khusus.

## Basemap

Endpoint memakai pola GL Style yang ditunjukkan pada screenshot pengguna:
https://basemap.mapid.io/styles/satellite/style.json
https://basemap.mapid.io/styles/basic/style.json
https://basemap.mapid.io/styles/light/style.json
Key dibaca dari NEXT_PUBLIC_MAPID_API_KEY, hanya ditambahkan ke origin basemap.mapid.io.
Key dari screenshot tidak disalin ke kode atau ZIP.
Jika satelit ditolak, coba Terang dan periksa akses layanan key di akun MAPID.
Basic 3D berarti memakai style basic dan kamera miring. Tidak mengarang tinggi gedung.
Bangunan ekstrusi/3D hanya tampil jika style/provider menyediakan data dan layer tersebut.
Tidak ada klaim satelit real-time atau fitur terrain/elevasi.

## Data & AI

public/catalog.json adalah snapshot ai_evidence.json yang sudah disanitasi, ditambah
koordinat hanya ketika ID bukti cocok dengan ID survei. Bukan katalog dinamis MAPID.
Jika preprocessing berubah, jalankan `python refresh_catalog.py` agar data pencarian dan backend sejalan.
Tahap 4 tersedia melalui tombol Tanyakan laporan ini; lihat PRD_DAN_COPILOT.md. Checkbox layer tetap bukan filter chat.

## Uji pada perangkat tim

1. Buka Explorer, cari Choco, pilih menu: harga penawaran terbaca, tidak ada titik baru.
2. Aktifkan Survei, klik titik hijau: detail laporan terbuka.
3. Ganti basemap berulang: overlay kembali muncul dan checkbox tetap sesuai.
4. Atur opasitas, aktifkan OSM/RBI, lalu Fokus 1 km.
5. Tutup panel kiri/kanan; peta menyesuaikan ruang.
6. Buka AI dan tanyakan rata-rata harga menu kawasan; cek sumber dataset.
7. Coba tampilan ponsel; tutup panel untuk berinteraksi dengan peta.

Konfigurasi origin development dalam next.config.ts mengikuti IP sebelumnya.
Jika IP berubah, sesuaikan allowedDevOrigins dan AI_ALLOWED_ORIGINS.
Ini tetap paket development; kebutuhan deployment produksi pada README tetap berlaku.

## Verifikasi versi UI

Build webpack, TypeScript, dan ESLint lulus. Smoke test HTTP health, summary, dua layer,
chat dataset, retrieval, penolakan input kosong, dan render halaman lulus.
Pengujian visual browser belum selesai: unduhan browser pengujian gagal.
Basemap MAPID satelit/basic tidak diuji menggunakan API key pengguna.
