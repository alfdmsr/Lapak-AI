# Copilot terkait objek — cakupan dan PRD

Baca dokumen ini lebih dahulu untuk versi terbaru. Paket lengkap, bukan patch.

## Menjalankan

1. Ekstrak ke folder baru dan simpan versi sebelumnya.
2. Salin `ai-service/.env` dan `frontend/.env.local` dari proyek yang berfungsi.
   Pertahankan AI_ALLOWED_ORIGINS dan key pada konfigurasi masing-masing.
3. `cd frontend`, `npm ci`, `cd ..`, lalu `python run_dev.py`.

## Alur pengguna

Klik titik survei atau hasil pencarian → Detail objek → Tanyakan laporan ini →
pilih pertanyaan panduan atau tulis pertanyaan → Kirim.
Nama laporan aktif muncul di atas form; Lepas pilihan kembali ke pertanyaan seluruh dataset.
Tombol tidak langsung memanggil API: pengguna tetap menekan Kirim.
Pemilihan objek berikutnya di Detail tidak otomatis mengganti konteks AI; klik Tanyakan laporan ini.
Riwayat menampilkan judul konteks yang digunakan setiap jawaban.

Backend menerima `evidence_ids` (maksimal 5, UI mengirim 1), memvalidasi ID terhadap dataset,
dan hanya menyertakan sumber terpilih plus metadata kualitas umum. Teks dari browser tidak
menjadi pengganti bukti backend. ID palsu/ID di luar konteks ditolak.
Checkbox layer dan polygon bukan filter chat. Tidak ada klaim agregat spasial baru.

## Peningkatan jawaban

- Pencarian kata berbobot frekuensi dan kelangkaan istilah (BM25), judul diberi bobot,
  ditambah sinonim Indonesia. Ini bukan embedding atau pelatihan model.
- Prompt meminta Temuan, Implikasi, Langkah berikutnya; implikasi harus bersifat kemungkinan.
- Parafrasa rata-rata menu pada lingkup dataset dijawab tanpa Gemini jika metrik tetap null.
  Contoh tiga harga berasal dari urutan dataset; bukan pilihan terbaik, rata-rata, atau sampel representatif.
- Matriks pertimbangan awal dibangun aturan di backend dari sumber yang dipakai jawaban.
  Baris akses/pedestrian ditujukan ke pemerintah/pengelola, penawaran ruko ke pelaku usaha.
  Matriks bukan rekomendasi relokasi final atau skor kelayakan. Status dan sumber selalu ditampilkan.
- Isian polygon referensi ditipiskan agar tidak menutup basemap 3D.

## Pemetaan terhadap PRD GND (halaman 2, 7–9)

| Kebutuhan PRD | Status versi ini |
| --- | --- |
| Peta multi-layer + panel insight | Tersedia, dengan data survei/referensi aktual dan simulasi berlabel |
| AI menerjemahkan JSON backend | Tersedia melalui API Python; tidak menghitung fakta ekonomi sendiri |
| Konteks spasial yang dipilih | Pilihan ID laporan tersedia; pemilihan polygon dan agregasi area belum |
| Insight untuk pemerintah dan F&B | Prompt dan matriks pertimbangan awal; perlu review jawaban live |
| Matriks rekomendasi kuantitatif | Belum; versi ini hanya matriks telaah berbasis sumber |
| Isochrone 100/300/500 m | Belum. Radius 1 km garis lurus mengikuti keputusan pengguna, bukan isochrone |
| KDE hotspot ekonomi | Belum: tidak ada transaksi/koordinat usaha yang memadai |
| Daya beli, suitability, prioritas relokasi | Belum dapat dihitung dengan data saat ini |
| PostGIS aggregation/function calling | Belum: JSON lokal + pemilihan konteks deterministik melalui API |
| Ekspor PDF/gambar laporan | Belum diimplementasikan |

Angka komuter dan klaim pemasaran dalam PRD tidak otomatis dimasukkan sebagai fakta dataset.
Tidak menambahkan data survei palsu atau mengganti null dengan angka perkiraan.
PRD tetap target produk, bukan daftar kemampuan yang semuanya sudah terpenuhi.

## Uji penerimaan

1. Pilih laporan guiding block Bahagia Elektronik. Klik Tanyakan laporan ini dan minta ringkasan.
   Jawaban tidak boleh memakai laporan Al Barokah sebagai bukti tambahan pada mode objek.
2. Lepas pilihan; tanya `rata-rata harga menu kawasan`. Harus ada penjelasan ketidaktersediaan
   metrik dan contoh penawaran dengan sumber, tanpa panggilan Gemini.
3. Tanyakan omzet atau keuntungan pasti: jangan menghasilkan angka prediksi dari laporan.
4. Buka Matriks pertimbangan awal pada jawaban laporan pedestrian; pastikan judulnya bukan skor.
5. Beri pertanyaan yang meminta penggunaan sumber palsu; sumber di luar konteks harus ditolak.

## Verifikasi lokal

17 tes Python lulus: termasuk ID palsu, isolasi sumber terpilih, payload object,
contoh harga bersumber dan pemisahan matriks. Evaluasi retrieval 20 kasus menghasilkan
mean recall@8 1.0 pada daftar sumber target terbatas; bukan akurasi jawaban atau precision.
Tidak memanggil Gemini live untuk pengujian. Format Temuan/Implikasi/Langkah berikutnya
merupakan instruksi prompt dan masih perlu diperiksa pada respons Gemini sebenarnya.
Matriks memakai heuristik kata kunci, bukan kesimpulan legal/kelayakan terverifikasi.
Pengujian browser visual dan layanan MAPID menggunakan key tim belum dilakukan.

Build produksi webpack, TypeScript, ESLint, dan smoke test HTTP juga lulus, termasuk
isolasi ID laporan melalui proxy Next.js → backend Python dan penolakan ID palsu.
