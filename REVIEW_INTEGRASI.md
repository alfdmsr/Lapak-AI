# Review integrasi

## Laporan pengguna live(2).json

6 respons Gemini lolos validasi; 1 jawaban dataset; 0 fallback; 0 gagal.
Pemeriksaan isi tujuh jawaban: daya beli tidak tersedia; omzet tidak dapat diprediksi;
rata-rata kawasan tidak dihitung; produk terlaris tidak disimpulkan; permintaan mengarang
omzet ditolak; ID palsu tidak digunakan sebagai bukti; transaksi Bandung tidak tersedia.
Ini review terbatas atas tujuh pertanyaan, bukan skor akurasi keseluruhan atau bukti tahan semua injeksi.
Istilah `null` pada jawaban daya beli/omzet masih dapat disederhanakan menjadi 'belum tersedia'.
Jawaban injeksi tidak memiliki kutipan inline, tetapi sumber tersedia pada daftar respons.
Review ini dilakukan asisten, bukan pengisian nilai human_review oleh ahli lapangan.

## Integrasi

Panel chat nyata dengan indikator menunggu, error, nomor sumber, status mode, dan keterbatasan.
Proxy Next.js menggunakan alamat backend dari konfigurasi server, bukan input pengguna.
Ringkasan dan dua layer mengambil dataset backend. Pusat peta disamakan dengan pusat studi sementara.
Data simulasi Menu Go tetap berlabel dan default tidak tampil.
Backend PostGIS asli dipertahankan dan belum menjadi dependensi chat.

## Verifikasi

- ESLint lulus.
- Build produksi Next.js webpack dan TypeScript lulus.
- 12 tes Python serta pemeriksaan integritas data lulus tanpa API Gemini.
- Pemeriksaan HTTP integrasi: lihat catatan hasil smoke test yang disertakan.
- Tidak memanggil Gemini live atau MAPID menggunakan key pengguna.
- Belum memverifikasi tampilan/interaksi browser dengan basemap MAPID aktif.
- Belum deployment atau menguji multiuser; bukan sertifikasi siap produksi.

HTTP smoke test lulus: health, summary, study_boundary, survey_unverified, chat dataset,
chat preview retrieval, input kosong 400, dan render halaman AI Copilot. Tidak ada API berbayar dipanggil.
Ulangi setelah build: `python tests/smoke_integration.py` (port 8000/3100 harus kosong).
