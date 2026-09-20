# Deployment GitHub + Cloudflare — Digital Twin V62

## 1. Source dan frontend build

Repositori aktif: `juldigi/digitaltwin` (**private**).

1. Push ke `main` menjalankan workflow **Verify frontend V62** untuk `npm ci`, build, dan seluruh regression test.
2. `npm run build` menghasilkan folder `dist` dengan HTML, CSS, modul aplikasi, serta Three.js lokal.
3. GitHub Pages tidak diperlukan untuk runtime aplikasi.
4. Workflow Cloudflare melakukan build/test ulang sebelum deployment.

## 2. Cloudflare Workers Static Assets + D1

Worker `digitaltwin` menggunakan `backend/wrangler.toml`.

- `[assets].directory = "../dist"` menyajikan frontend langsung dari Worker.
- Binding `ASSETS` dipakai untuk request non-`/api/*`.
- `run_worker_first = ["/api/*"]` membuat API tetap ditangani `backend/worker.js`.
- D1 binding harus bernama `DB`.

GitHub Actions membutuhkan `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID`. Worker membutuhkan secret `ADMIN_TOKEN` dan `VIEWER_TOKEN`.

## 3. Verifikasi V62

Setelah deployment, verifikasi:

- URL Worker memuat build V62 dan service worker cache `factory-digital-twin-v62-20260920`.
- Daftar Mesin menampilkan **41 equipment**.
- Offset 5, Offset 10, APM 2, dan Sheeting Lexus membuka geometry khusus masing-masing.
- Sheeting V62 mempertahankan **RIGHT → LEFT**.
- Sheeting hanya menampilkan **satu reel position family reference**, bukan dua reel tandem spekulatif.
- Feed/tension roller mempunyai bearing/support yang terlihat.
- Cutter terlihat enclosed; delivery berupa narrow-belt bed; output mempunyai portal stacker dan flat lift table.
- HMI tidak berpotongan dengan service deck.
- Continuous web hanya muncul upstream cutter ketika simulasi aktif.
- Individual cut sheet hanya muncul downstream cutter dan berakhir pada pile stacker.
- Regression test menolak accidental cross-module penetration dan moving/static collision.
- GET `/api/state` tanpa token → 401.
- Viewer tidak dapat melakukan mutation.
- Admin dapat menyimpan state dengan revision guard.
- Uji desktop, mobile portrait/landscape, WebGL fallback, cutaway, explode, isolate, label komponen dan simulasi.

## 4. Batas verifikasi

Database BMJ dan orientasi yang dikonfirmasi pengguna adalah sumber utama identitas. Brochure HSM 56 2014 dipakai sebagai visual family evidence, bukan bukti bahwa HSM-CTM7 BMJ identik. Drawing/foto aktual HSM-CTM7 BMJ tetap diperlukan untuk menaikkan exact geometry menjadi verified.
