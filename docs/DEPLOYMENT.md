# Deployment GitHub + Cloudflare — Digital Twin V56

## 1. Frontend GitHub Pages

Repositori aktif: `juldigi/digitaltwin` (private).

1. Buka **Settings → Pages → Build and deployment** lalu pilih **GitHub Actions**.
2. Workflow **Build and deploy GitHub Pages** berjalan ketika ada push ke `main` atau dijalankan manual.
3. Workflow menjalankan build dan test sebelum mengunggah folder `dist`.
4. Origin Pages untuk akun baru adalah `https://juldigi.github.io`; path project umumnya `/digitaltwin/`.
5. Repo tetap private. Visibilitas source code tidak perlu diubah hanya untuk menyesuaikan konfigurasi aplikasi.

## 2. Backend Cloudflare Workers + D1

Nama Worker dan D1 lama **dipertahankan untuk kompatibilitas**:
- Worker: `offset5-digital-twin-api`
- D1: `offset5-digital-twin`

Nama resource lama tidak berarti backend hanya mendukung Offset 5; V56 frontend sudah menangani registry 41 equipment.

### Konfigurasi

1. Binding database harus bernama `DB`.
2. Isi `database_id` di `backend/wrangler.toml` dengan ID D1 aktual sebelum deployment.
3. Jalankan migrasi `backend/migrations/0001_initial.sql`.
4. Atur `ALLOWED_ORIGINS` untuk origin yang memang dipakai. Konfigurasi repo saat ini mempertahankan origin lama dan menambahkan `https://juldigi.github.io` agar migrasi akun tidak memutus akses.
5. Atur secret Worker `ADMIN_TOKEN` dan `VIEWER_TOKEN` dengan nilai kuat dan berbeda. Jangan menyimpan token di source code, URL, atau screenshot.
6. Deploy dengan konfigurasi `backend/wrangler.toml`.
7. Periksa `/api/health`; `ready` harus bernilai `true` ketika D1 dan kedua secret tersedia.
8. Isi `frontend/config.json` dengan origin Worker jika ingin koneksi default; nilai kosong mempertahankan mode lokal dan pengguna dapat mengisi koneksi dari UI.

## 3. GitHub Actions untuk Cloudflare

Repository secrets/variables yang diperlukan oleh workflow:
- Secret `CLOUDFLARE_API_TOKEN`
- Secret `CLOUDFLARE_ACCOUNT_ID`
- Variable `CLOUDFLARE_D1_DATABASE_ID`

API token cukup diberi izin yang diperlukan untuk Workers Scripts dan D1 pada account tujuan. Worker authentication token aplikasi (`ADMIN_TOKEN` / `VIEWER_TOKEN`) tetap disimpan sebagai Worker secret, bukan GitHub source.

## 4. Verifikasi end-to-end

Setelah deployment, verifikasi:
- GitHub Pages memuat V56 dan cache service worker berubah ke namespace V56.
- Daftar Mesin menampilkan **41 equipment**.
- Offset 5, Offset 10, dan APM 2 membuka geometry khusus masing-masing.
- Equipment lainnya membuka builder keluarga proses dan tidak diklaim sebagai CAD OEM.
- Mode Denah memakai layout aktual yang tersedia; posisi approximate tetap ditandai sebagai approximate.
- GET `/api/state` tanpa token → 401.
- Viewer dapat membaca tetapi tidak dapat menulis → 403 pada mutation.
- Admin dapat menyimpan state dengan revision guard.
- Konflik revision menghasilkan 409 dan tidak menimpa perubahan lain.
- Origin yang tidak diizinkan ditolak.
- Uji desktop, mobile portrait/landscape, WebGL fallback, cutaway, explode, isolate, label komponen dan simulasi.

## 5. Batas verifikasi

DXF, foto aktual, database mesin dan dokumen teknis tetap menjadi sumber utama fidelity. Data yang belum memiliki bukti tidak boleh dinaikkan statusnya menjadi verified. Penamaan resource backend lama dipertahankan semata-mata untuk kompatibilitas deployment.
