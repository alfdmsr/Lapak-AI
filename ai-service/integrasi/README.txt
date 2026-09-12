Untuk divisi WebGIS

Paket backend tetap terpisah dari frontend. Sertakan seluruh folder data pada server backend.
Frontend tidak perlu menyimpan semua JSON; cukup memanggil API.
Set WEBGIS_ORIGIN di .env backend sesuai alamat browser, misalnya http://localhost:3001.
127.0.0.1 hanya berlaku pada komputer yang sama. Backend saat ini bind localhost.

POST /chat body {"question":"Apa laporan tentang trotoar?","mode":"live"}
Respons sukses: mode, display.answer, display.sources, display.notes, display.details.
Tampilkan label fallback_dataset_summary jika model ditolak, dan dataset_answer_not_llm
jika jawaban berasal dari metadata. Jangan menyembunyikan status dan ketidakpastian.
HTTP gagal: {"error":"..."}. Tangani dengan pesan di UI; jangan menghapus chat sebelumnya.
GET /health hanya memeriksa proses dan konfigurasi, tidak membuktikan API key valid.
GET /summary ringkasan data.
GET /layers/study_boundary, /layers/osm_reference, /layers/rbi_reference,
/layers/survey_unverified mengembalikan GeoJSON.
Filter polygon chat belum tersedia. Koordinat survei belum tervalidasi.

Gunakan client.js sebagai fungsi pembantu di komponen frontend yang sudah ada.
Contoh respons tanpa API ada di contoh_response.json.
Untuk memasang langsung dibutuhkan package.json, struktur app/src, komponen chat,
komponen peta, dan kode API/proxy frontend jika ada. Jangan sertakan env/token/node_modules.

Sebelum produksi: adaptasi server produksi, HTTPS, autentikasi, pembatasan bersama,
konfigurasi secrets di backend dan pengujian frontend/backend pada host tujuan.
MAPID terpisah dari Gemini; paket ini tidak mengambil data premium/menu/struk MAPID.
