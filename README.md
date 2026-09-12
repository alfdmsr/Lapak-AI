# Versi Copilot terkait objek

Baca PRD_DAN_COPILOT.md terlebih dahulu.

# Mulai dari PANDUAN_UI.md

Versi ini menambahkan UI Explorer tahap 1–3. Panduan integrasi di bawah tetap berlaku.

# LAPAK-AI — integrasi WebGIS dan AI

Paket ini menghubungkan frontend Next.js ke layanan Python berbasis bukti dan Gemini.
Frontend → `/api/ai/chat` (Next.js) → `/chat` (Python) → konteks dataset + Gemini.
Tidak ada fine-tuning; data referensi tetap dibaca di layanan AI. Menu Go simulasi tidak masuk konteks AI.

## Setup pertama (Windows CMD)

Butuh Python 3.10+ dan Node/npm yang sesuai package.json frontend.
Buka terminal pada folder yang berisi README ini:

```bat
cd frontend
npm ci
copy .env.local.example .env.local
notepad .env.local
cd ..
```

Isi `NEXT_PUBLIC_MAPID_API_KEY` dengan key basemap yang memang diizinkan untuk browser.
`AI_BACKEND_URL=http://127.0.0.1:8000` adalah alamat internal layanan Python, bukan API key.
Key basemap tersebut terlihat di browser; jangan memakai token privat pengambilan data di sini.

Salin `.env` Gemini milikmu dari paket AI sebelumnya ke `ai-service/.env`, atau:

```bat
cd ai-service
copy .env.example .env
notepad .env
cd ..
```

Isi GEMINI_API_KEY dan GEMINI_MODEL yang dapat diakses akunmu. Jangan menyertakan `.env` dalam Git.
Proxy Next.js tidak meneruskan header Origin browser ke Python, sehingga perpindahan port frontend
3000/3001 tidak membutuhkan perubahan WEBGIS_ORIGIN untuk jalur proxy ini.

## Menjalankan

```bat
python run_dev.py
```

Buka alamat `Local` yang dicetak Next.js. Backend dan frontend berjalan bersama; Ctrl+C berhenti.
Jangan menyalakan server.py kedua pada port 8000.
Jika ingin manual, terminal pertama: `cd ai-service` lalu `python server.py`.
Terminal kedua: `cd frontend` lalu `npm run dev -- --webpack`.

Uji chat: `Berapa rata-rata harga menu di kawasan ini?` memakai metadata tanpa API Gemini.
Kemudian `Apa laporan tentang trotoar?` memakai Gemini. Jangan menjalankan evaluasi live bersamaan.
Lihat jawaban, buka Sumber dan Keterbatasan data. Pesan gagal ditampilkan tanpa menghapus jawaban lama.
Riwayat di UI hanya selama halaman terbuka; pertanyaan belum memakai memori percakapan.

## Peta dan data

Batas 1 km memakai pusat sementara 107.1450733, -6.2553138.
Survei berupa titik perkiraan; beberapa laporan bertumpuk pada koordinat yang sama.
Menu Go simulasi tersedia tetapi default mati. Struk/properti Go belum tersedia.
Ringkasan menyebut jumlah seluruh dataset, bukan jumlah usaha unik/objek terverifikasi dalam radius.
Tidak ada filter polygon untuk chat, ranking lokasi presisi, atau prediksi ekonomi.
Koneksi MAPID berfungsi sebagai basemap; bukan akses otomatis ke data menu/struk/properti premium.

## Struktur yang digunakan

- frontend/: WebGIS, panel chat, proxy `/api/ai/*`.
- ai-service/: backend Python dan seluruh data terproses.
- backend/: kode tes PostGIS asli tim; belum diperlukan untuk alur chat ini.
- REVIEW_INTEGRASI.md: temuan evaluasi dan hasil pemeriksaan teknis.

## Pemeriksaan

```bat
python -m unittest discover -s ai-service -p "test_*.py"
cd frontend
npm run lint
npm run build -- --webpack
```

Tes Python memakai simulasi: pesan retry/dibatalkan pada unittest bukan error API nyata.
Untuk evaluasi live gunakan petunjuk `ai-service/MULAI_DI_SINI.txt`.
Simpan laporan evaluasi baru terpisah dari arsip review; jangan klaim recall sebagai akurasi AI.

## Sebelum deployment

Ini paket integrasi lokal, belum layanan publik produksi. Server Python stdlib hanya untuk development.
Tim perlu server produksi, HTTPS, autentikasi, pembatasan kuota bersama dan timeout yang sesuai retry.
AI_BACKEND_URL nantinya menunjuk alamat layanan AI yang dapat diakses server Next.js.
Jangan mengganti URL browser menjadi localhost milik laptop pengembang.
Tidak diperlukan laptop pengembang menyala setelah kedua layanan dipasang di server.
