# LAPAK-AI

**Optimalisasi Penataan Zonasi PKL dan Strategi Lokasi Usaha F&B Berbasis Spatial-AI di Catchment Area Stasiun Cikarang**

LAPAK-AI adalah platform WebGIS yang membantu pemerintah daerah, pelaku UMKM, dan pemilik usaha F&B memahami kondisi ekonomi mikro serta tata ruang di sekitar Stasiun Cikarang. Sistem menggabungkan peta interaktif, data geospasial, data survei lapangan, dan analisis spasial untuk menghasilkan rekomendasi yang dapat ditindaklanjuti.

## Tujuan

- Membantu pemerintah menentukan zonasi atau relokasi PKL dengan mempertimbangkan akses pejalan kaki dan ketersediaan ruang.
- Membantu pelaku usaha memilih lokasi F&B yang lebih prospektif.
- Mengidentifikasi titik keramaian, hambatan trotoar, dan peluang ruang usaha dalam radius studi sekitar Stasiun Cikarang.
- Menyediakan AI Copilot yang menjelaskan hasil analisis berdasarkan data agregat, bukan membuat data spasial secara mandiri.

## Fitur yang direncanakan

- Basemap resmi MAPID MAPS melalui MapLibre GL JS.
- Peta multi-layer untuk data Menu Go, Struk Go, Properti Go, dan survei lapangan.
- Isochrone atau buffer jangkauan jalan kaki.
- Heatmap kepadatan aktivitas ekonomi menggunakan KDE.
- Spatial mismatch dan suitability scoring.
- Dashboard ringkasan area terpilih.
- AI Copilot untuk insight dan matriks rekomendasi.
- Ekspor laporan ringkas.

## Arsitektur singkat

```text
Data MAPID / survei / geospasial sekunder
                |
                v
      Cleaning dan validasi GeoJSON
                |
                v
        PostgreSQL + PostGIS
                |
                v
       Backend REST API (Express)
                |
                v
     Frontend Next.js + MapLibre
                |
                v
   Analisis spasial dan AI Copilot
```

## Struktur repository

```text
Lapak-AI/
├── frontend/       # Next.js, React, MapLibre
├── backend/        # Express API dan koneksi PostgreSQL/PostGIS
└── .gitignore
```

## Persyaratan sistem

- Node.js 20 atau lebih baru
- npm
- PostgreSQL dengan ekstensi PostGIS
- Git
- Browser modern dengan dukungan WebGL

## Instalasi

Clone repository dan masuk ke folder proyek:

```bash
git clone https://github.com/alfdmsr/Lapak-AI.git
cd Lapak-AI
```

### Menjalankan frontend

```bash
cd frontend
npm install
npm run dev
```

Buka alamat yang ditampilkan terminal, biasanya `http://localhost:3000`.

Jika port 3000 sedang digunakan:

```bash
npm run dev -- --port 3001
```

Untuk pengujian menggunakan Webpack:

```bash
npm run dev -- --webpack
```

### Konfigurasi basemap MAPID

Buat file `frontend/.env.local` dan isi API key secara lokal:

```env
NEXT_PUBLIC_MAPID_API_KEY=GANTI_DENGAN_API_KEY_MAPID
```

Jangan commit `.env.local`, API key asli, password database, atau token apa pun ke GitHub. Restart server setelah mengubah environment variable.

Style MAPID yang digunakan:

```text
https://basemap.mapid.io/styles/light/style.json?key=API_KEY
```

### Menjalankan backend

Buka terminal kedua dari folder utama proyek:

```bash
cd Lapak-AI/backend
npm install
```

Buat file `backend/.env` secara lokal:

```env
PORT=4000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=lapak_ai_db
DB_PASSWORD=GANTI_DENGAN_PASSWORD_LOKAL
DB_PORT=5432
```

Backend saat ini menyediakan fondasi koneksi database. Endpoint API dan pipeline impor data akan ditambahkan bertahap.

## Database PostGIS

Contoh inisialisasi pada PostgreSQL:

```sql
CREATE DATABASE lapak_ai_db;
\c lapak_ai_db
CREATE EXTENSION IF NOT EXISTS postgis;
```

Data spasial LAPAK-AI sebaiknya disimpan dalam SRID `4326` (`geometry(Point, 4326)` atau tipe geometri yang sesuai). Struktur tabel final harus mengikuti atribut data yang benar-benar tersedia setelah cleaning.

## Alur pengembangan data

1. Samarkan atau hapus nama, nomor telepon, email, dan identitas lain.
2. Validasi koordinat, geometri, duplikasi, dan cakupan area studi.
3. Simpan data transaksi atau daya beli dalam bentuk agregat, bukan data individu.
4. Impor data bersih ke PostgreSQL/PostGIS.
5. Sediakan endpoint GeoJSON untuk frontend.
6. Jalankan analisis spasial pada backend.
7. Kirim hanya ringkasan agregat ke AI Copilot.

## Privasi dan etika data

- Gunakan data samaran seperti `PKL-001`, `SURVEY-001`, atau `RESPONDEN-A`.
- Jangan menyimpan nama asli, nomor HP, alamat kontak, atau identitas responden dalam repository.
- Foto survei tidak boleh menampilkan wajah yang dapat dikenali atau plat nomor kendaraan; lakukan blur sebelum dipakai.
- Data Struk Go harus diagregasi dan tidak boleh digunakan untuk mengidentifikasi pelanggan.
- Jika suatu dataset tidak tersedia, tampilkan status `data belum tersedia`; jangan mengarang nilai daya beli.
- Data sintetis harus diberi label `simulasi` dan tidak boleh dipresentasikan sebagai data lapangan nyata.

## Prinsip AI Copilot

AI Copilot hanya menerima ringkasan JSON dari backend, misalnya jumlah objek, rata-rata harga, jumlah titik tervalidasi, dan skor kelayakan. Perhitungan spasial tetap dilakukan oleh kode backend/PostGIS. Dengan demikian, AI berfungsi sebagai penerjemah dan asisten keputusan, bukan sumber data spasial baru.

## Kontribusi

Gunakan branch fitur dan pull request untuk perubahan besar. Sebelum commit, pastikan tidak ada `.env`, API key, password, foto survei mentah, atau data pribadi yang ikut masuk.

## Lisensi

Proyek ini dikembangkan untuk kebutuhan kompetisi MAPID WebGIS. Ketentuan penggunaan data MAPID, data survei, dan aset pihak ketiga tetap mengikuti lisensi serta aturan dari masing-masing penyedia.
