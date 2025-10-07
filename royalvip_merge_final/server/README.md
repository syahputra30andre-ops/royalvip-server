# ROYALVIP Global Server (Express + Supabase Storage)

Server ini menambahkan API global agar upload & akses video **sinkron di semua perangkat**.

## Fitur
- `/health` — health check
- `POST /api/videos/upload` — upload video (`multipart/form-data` field `file`, opsional `userId`)
- `GET /api/videos?userId=...` — daftar video milik pengguna + signed URL playback
- `GET /api/videos/signed-url?path=...` — dapatkan signed URL (1 jam)
- `DELETE /api/videos?path=...` — hapus file (tambahkan auth sesuai kebutuhan)

## Konfigurasi
1. Duplikasi `.env.example` menjadi `.env`, isi:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (gunakan **Service Role**, jangan dibagikan ke client)
   - `SUPABASE_BUCKET` (misal `videos`)
   - `CORS_ORIGINS` (domain frontend Anda)
2. Pastikan bucket telah ada; server akan mencoba membuat bila belum ada (butuh Service Role).

## Menjalankan Lokal
```bash
cd server
npm install
cp .env.example .env  # isi variabelnya
npm run dev           # default di http://localhost:8080
```

## Deploy ke Render (direkomendasikan untuk cepat)
- Buat akun di Render.com → New Web Service → Hubungkan repo ZIP ini (upload ke GitHub).
- Build Command: `npm install --prefix server`
- Start Command: `npm start --prefix server`
- Environment:
  - `NODE_VERSION` = 20
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`, `CORS_ORIGINS`
- Setelah live, Anda akan mendapat URL global, misalnya: `https://royalvip-api.onrender.com`.

## Deploy via Docker
```bash
docker build -t royalvip-server ./server
docker run -p 8080:8080 --env-file ./server/.env royalvip-server
```

## Integrasi Frontend
- Ubah base URL API ke domain server global Anda.
- Upload dari frontend:
  ```js
  const form = new FormData();
  form.append('file', fileInput.files[0]);
  form.append('userId', currentUserId);
  await fetch('https://YOUR-DOMAIN/api/videos/upload', { method: 'POST', body: form });
  ```

## Catatan Keamanan
- Simpan Service Role key **hanya** di server.
- Untuk proteksi pengguna, tambahkan auth (JWT/Session) dan validasi `userId` dari token.
