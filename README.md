# Web Sekolahku

CMS dan website profil sekolah berbasis Next.js, React, TypeScript, dan Payload CMS 3.

## Stack

- Next.js 16 + React 19
- Payload CMS 3 (Admin di `/admin`)
- MongoDB Atlas untuk database
- Cloudflare R2 melalui Payload S3 Storage Adapter
- Vercel untuk hosting dan Preview Deployments
- pnpm 10

## Prasyarat

- Node.js `^22.23.5 || ^24.22.3 || >=26.13.1`
- pnpm 9 atau 10
- MongoDB lokal atau MongoDB Atlas

## Menjalankan lokal

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Buka `http://localhost:3000/admin` untuk panel CMS. Konfigurasi lokal minimal:

- `DATABASE_URI`: URI MongoDB lokal.
- `PAYLOAD_SECRET`: secret acak minimal 32 karakter.
- `STORAGE_DRIVER=local`: gunakan filesystem hanya untuk pengembangan lokal.

Jangan isi kredensial produksi di `.env.example`, commit, atau issue publik.

## Perintah

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | Server pengembangan |
| `pnpm build` | Build produksi |
| `pnpm start` | Menjalankan build |
| `pnpm typecheck` | Pemeriksaan TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit dan integration test |
| `pnpm generate:types` | Generate tipe Payload |
| `pnpm generate:importmap` | Generate import map Admin |

## Vercel

Hubungkan repository fork ke Vercel. Gunakan Node.js 24.x dan atur environment variables secara terpisah untuk Preview dan Production.

| Variable | Keterangan |
|---|---|
| `DATABASE_URI` | URI MongoDB Atlas khusus environment |
| `PAYLOAD_SECRET` | Secret unik minimal 32 karakter per environment |
| `STORAGE_DRIVER` | Isi `r2` |
| `R2_BUCKET` | Nama bucket R2 |
| `R2_ENDPOINT` | S3 API endpoint dari Cloudflare |
| `R2_PUBLIC_URL` | Domain publik/custom domain bucket |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |

Buat database dan bucket terpisah untuk Preview dan Production. Jangan gunakan kredensial yang sama untuk keduanya.

## Fitur website dan CMS

Website publik saat ini menyediakan:
- Beranda dengan identitas sekolah, berita terbaru, dan agenda terbaru.
- Daftar berita dan detail berita.
- Daftar agenda dan detail agenda.
- Layout responsif untuk desktop, tablet, dan ponsel.

Di panel `/admin`, konfigurasi:
- **Identitas Sekolah**: nama, slogan, judul beranda, deskripsi, logo, alamat, telepon, email, dan footer.
- **Berita** dan **Agenda Sekolah**: judul, slug otomatis, ringkasan, gambar, tanggal, isi, kategori, dan status publikasi.

### Mode visual preview

Vercel Preview memiliki `CMS_PREVIEW_MODE=true`. Jika `DATABASE_URI` belum diisi, aplikasi menampilkan shell website dengan data contoh dan menyembunyikan tautan login CMS. Mode ini hanya berlaku pada target Preview; Production tetap wajib memakai database dan secret asli.

Setelah MongoDB Atlas Preview siap, isi `DATABASE_URI` dan `PAYLOAD_SECRET` di Vercel. Mode visual otomatis berhenti menggunakan fallback setelah `DATABASE_URI` tersedia. Panel admin dan penyimpanan konten belum dapat diuji dalam mode visual preview.

### Peran pengguna

| Peran | Hak utama |
|---|---|
| Super Admin | Seluruh konfigurasi dan pengguna |
| Admin Sekolah | Mengelola pengguna, identitas, konten, dan publikasi |
| Kepala Sekolah | Meninjau dan menerbitkan konten |
| Editor | Membuat, mengubah, dan menghapus konten |
| Guru | Membuat konten dan mengubah konten miliknya |

Pengguna pertama yang dibuat pada database kosong otomatis menjadi **Super Admin**. Setelah login, buat akun staf lain melalui menu Pengguna dan tetapkan perannya.

Konten baru berstatus **Draft**. Editor/Guru dapat mengirim konten ke status **Menunggu Persetujuan**. Hanya Super Admin, Admin Sekolah, atau Kepala Sekolah yang dapat mengubah konten menjadi **Terbit**. Hanya konten Terbit yang dibaca oleh pengunjung publik.

### Preview Vercel

Project Vercel terhubung ke repository `caxuga/web-sekolahku`. Pull request dari branch fitur akan menjadi Preview Deployment. Untuk menjalankan CMS secara fungsional, atur Environment Variables pada target **Preview**:

- `DATABASE_URI`: database MongoDB Atlas khusus Preview.
- `PAYLOAD_SECRET`: secret unik untuk Preview, minimal 32 karakter.
- `STORAGE_DRIVER`: `r2` jika upload akan diuji.
- `R2_BUCKET`, `R2_ENDPOINT`, `R2_PUBLIC_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`: kredensial bucket Preview.

Jangan menggunakan database, secret, atau bucket Production untuk Preview. Jangan kirim secret melalui issue, commit, atau chat. Masukkan langsung di Vercel Project Settings → Environment Variables. Jika belum ada database Preview, deployment tidak dapat menjalankan panel CMS atau mengambil konten dari database.

## Cloudflare R2 CORS

Konfigurasikan bucket agar mengizinkan origin domain Vercel Preview/Production yang digunakan, metode `PUT`, dan header `If-None-Match`. Batasi origin ke domain aplikasi; jangan memakai wildcard untuk bucket produksi.

File yang dikelola koleksi Media saat ini disajikan melalui URL publik R2. Jangan menyimpan file rahasia atau dokumen pribadi di koleksi tersebut.

## Keamanan

- Ganti/rotasi setiap credential yang pernah terpublikasi di repository lama.
- Simpan semua secret di Vercel Environment Variables.
- Jangan pernah memberi prefix `NEXT_PUBLIC_` pada secret server.
- Akses data publik harus dibatasi pada konten berstatus published sebelum website publik diaktifkan.
- Aktifkan branch protection dan wajibkan CI berhasil sebelum merge ke `main`.

## Deployment

- `main`: Production deployment melalui Vercel Git Integration.
- Pull request dan branch fitur: Vercel Preview deployment.
- GitHub Actions CI menjalankan typecheck, lint, tests, dan build sebelum merge.
