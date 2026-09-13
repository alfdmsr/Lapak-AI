# Deploy backend LAPAK-AI

Backend belum dipublikasikan oleh perubahan ini. Frontend tetap di Vercel;
backend adalah web service Python terpisah. Tidak perlu database untuk endpoint
layer berbasis berkas saat ini.

## Lokal

Dari folder ai-service, gunakan Python 3.10+:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements-dev.txt
python -m unittest test_server -v
python server.py
```

Default host 0.0.0.0, port 8000; gunakan HOST=127.0.0.1 untuk lokal saja.
HOST dan PORT dapat diganti melalui environment. Health tersedia pada /health.
Layer tidak membutuhkan GEMINI_API_KEY. /chat mode live membutuhkan konfigurasi
AI; preview tidak memanggil provider.

## Vercel Hobby (alternatif tanpa kartu)

Gunakan akun Hobby yang sudah digunakan frontend dan buat project KEDUA dari
repository yang sama. Jangan ubah Root Directory project frontend.

| Pengaturan | Nilai |
| --- | --- |
| Project Name | lapak-ai-backend |
| Root Directory | ai-service |
| Framework Preset | FastAPI |
| Build / Install / Output overrides | Nonaktif, gunakan default FastAPI |

Vercel mendeteksi app pada server.py dan memasang requirements.txt. Jangan
memasukkan npm ci, npm run build, atau python server.py sebagai build command.
Runtime Vercel mengimpor app; blok __main__ hanya digunakan saat menjalankan
server lokal/Render. Tidak perlu HOST, PORT, atau health-check setting Render.
vercel.json menetapkan durasi maksimum function 300 detik. Ini batas, bukan
jaminan latensi chat. Uji data/preview dahulu; AI live tetap bergantung provider
dan kuota serta durasi kedua function (frontend dan backend).

Atur WEBGIS_ORIGIN ke origin frontend. GEMINI_API_KEY hanya diperlukan untuk
AI live. Jangan upgrade ke Pro atau menambahkan metode pembayaran untuk alur
ini. Kebijakan verifikasi akun tetap ditentukan Vercel.

.vercelignore mengecualikan environment lokal, input mentah dan file tes.
data/map dan data/processed tetap diperlukan dalam bundle, bukan dipindahkan
ke public. Uji /health, /summary, dan semua layer setelah deploy.
Gunakan domain Production stabil backend sebagai AI_BACKEND_URL frontend dan
redeploy frontend. Uji /health backend dari browser tanpa login: halaman login
atau 401 berarti Deployment Protection menghalangi proxy. Gunakan pengaturan
akses production yang sesuai untuk endpoint publik, bukan URL Preview berlogin.

Referensi: https://vercel.com/docs/frameworks/backend/fastapi
Hobby: https://vercel.com/docs/plans/hobby

## Render (Web Service, dapat meminta verifikasi kartu)

Hubungkan repository GitHub, lalu isi:

| Pengaturan | Nilai |
| --- | --- |
| Root Directory | ai-service |
| Runtime | Python |
| Build Command | pip install -r requirements.txt |
| Start Command | python server.py |
| Health Check Path | /health |

PORT disediakan hosting. Server mengikuti PORT tanpa hardcode port hosting.
Referensi: https://render.com/docs/deploy-fastapi

Atur WEBGIS_ORIGIN ke origin frontend, misalnya https://contoh.vercel.app
(tanpa trailing slash). Beberapa origin dapat dipisahkan koma; jangan wildcard.
Simpan GEMINI_API_KEY di environment backend jika menggunakan chat live.
GEMINI_MODEL opsional; gunakan model yang tersedia untuk akun provider.
Jangan commit .env atau menyalin kredensial ke log/screenshot.

Pastikan berkas berikut ikut tersedia dari repository:
- data/map/study_boundary.geojson
- data/map/survey_unverified.geojson
- data/map/osm_reference.geojson
- data/map/rbi_reference.geojson
- data/processed/summary.json
- data/processed/ai_evidence.json

Jangan menambahkan data pribadi baru untuk deployment. Endpoint hanya membaca
nama layer yang diizinkan, bukan melayani seluruh direktori data. /health adalah
liveness; status ok belum membuktikan kelengkapan data. Uji juga /summary dan
keempat /layers/<nama> (HTTP 200, JSON/GeoJSON). Data hilang/rusak menghasilkan
503. Tidak perlu menjalankan preprocessing otomatis saat build.

## Hubungkan Vercel

Set AI_BACKEND_URL ke URL HTTPS dasar backend (tanpa /health atau /api/ai),
untuk Production dan Preview yang diperlukan. Variabel ini hanya untuk server;
jangan beri awalan NEXT_PUBLIC_. Pertahankan NEXT_PUBLIC_MAPID_API_KEY.
Redeploy frontend, lalu periksa /api/ai/health, /api/ai/summary dan
/api/ai/layers/study_boundary. Jika 502, cek URL, status backend, dan log hosting.

Periksa peta dan klik titik survei. Ini tidak mengaktifkan demo Menu Go yang
saat ini dinonaktifkan. Uji chat live terpisah setelah konfigurasi provider siap;
pengujian otomatis tidak memanggil layanan AI berbayar. Timeout proxy Vercel
bukan jaminan durasi function hosting: sesuaikan batas hosting dengan latensi AI.
