# Deployment GitHub + Cloudflare — Digital Twin V58

## 1. Source dan frontend build

Repositori aktif: `juldigi/digitaltwin` (**private**).

1. Push ke `main` menjalankan workflow **Verify frontend V58** untuk `npm ci`, build, dan seluruh regression test.
2. `npm run build` menghasilkan folder `dist` dengan HTML, CSS, modul aplikasi, serta Three.js lokal.
3. GitHub Pages tidak diperlukan untuk runtime aplikasi. Repo dapat tetap private.
4. Workflow Cloudflare melakukan build/test ulang sebelum deployment sehingga Worker hanya menerima build yang lolos regression suite.

## 2. Cloudflare Workers Static Assets + D1

Worker `digitaltwin` menggunakan konfigurasi `backend/wrangler.toml`.

- `[assets].directory = "../dist"` menyajikan frontend langsung dari Worker.
- Binding `ASSETS` dipakai untuk semua request non-`/api/*`.
- `run_worker_first = ["/api/*"]` membuat API tetap ditangani `backend/worker.js`.
- `not_found_handling = "single-page-application"` menjaga route aplikasi tetap kembali ke frontend shell.
- D1 binding harus bernama `DB`.

### Konfigurasi

1. Pastikan D1 binding `DB` mengarah ke database Digital Twin aktual.
2. Jalankan migrasi `backend/migrations/0001_initial.sql` bila database belum diinisialisasi.
3. Atur Worker secret `ADMIN_TOKEN` dan `VIEWER_TOKEN` dengan nilai kuat dan berbeda.
4. GitHub Actions membutuhkan secret `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID`.
5. Deploy dilakukan dari direktori `backend` dengan Wrangler.
6. Periksa `/api/health`; `ready` harus `true` ketika D1 dan kedua secret tersedia, dan `assets` harus `true`.
7. Karena frontend dan API berada pada origin Worker yang sama, CORS tidak diperlukan untuk penggunaan normal pada URL Workers.

## 3. Verifikasi V58

Setelah deployment, verifikasi:
- URL Worker memuat **Factory Digital Twin V58**.
- Daftar Mesin menampilkan **41 equipment**.
- Offset 5, Offset 10, APM 2, dan Sheeting Lexus membuka geometry khusus masing-masing.
- Sheeting: continuous web hanya berada sebelum knife; individual sheet hanya muncul setelah cutter; layboy menurunkan lift table saat pile bertambah.
- Equipment lainnya membuka builder keluarga proses dan tidak diklaim sebagai CAD OEM.
- Mode Denah memakai layout aktual yang tersedia; posisi approximate tetap ditandai sebagai approximate.
- GET `/api/state` tanpa token → 401.
- Viewer dapat membaca tetapi tidak dapat menulis → 403 pada mutation.
- Admin dapat menyimpan state dengan revision guard.
- Konflik revision menghasilkan 409 dan tidak menimpa perubahan lain.
- Uji desktop, mobile portrait/landscape, WebGL fallback, cutaway, explode, isolate, label komponen dan simulasi.

## 4. Batas verifikasi

DXF, foto aktual, database mesin dan dokumen teknis tetap menjadi sumber utama fidelity. Data yang belum memiliki bukti tidak boleh dinaikkan statusnya menjadi verified.
