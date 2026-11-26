# Web Sekolahku

CMS dan website profil sekolah berbasis Next.js, React, TypeScript, dan Payload CMS 3.

## Stack

- Next.js 16 + React 19
- Payload CMS 3 (Admin di `/admin`)
- Supabase PostgreSQL untuk database
- Supabase Storage untuk media publik sekolah
- Vercel Hobby untuk hosting dan Preview Deployments
- GitHub untuk source control dan CI
- pnpm 10

## Prinsip biaya

Pengembangan menggunakan paket gratis terlebih dahulu. Tidak ada ketergantungan pada Cloudflare R2 atau layanan storage berbayar.

Batas paket gratis tetap berlaku. Supabase Free dapat menjeda proyek yang tidak aktif selama periode tertentu dan memiliki kuota database, storage, serta bandwidth. Periksa penggunaan di Dashboard Supabase secara berkala. Jangan mengaktifkan paket berbayar atau overage tanpa keputusan terpisah.

## Prasyarat

- Node.js `^22.23.5 || ^24.22.3 || >=26.13.1`
- pnpm 9 atau 10
- PostgreSQL lokal atau Supabase PostgreSQL

## Menjalankan lokal

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Buka `http://localhost:3000/admin` untuk panel CMS. Konfigurasi lokal minimal:

- `DATABASE_URL`: URI PostgreSQL lokal atau Supabase Session Pooler.
- `PAYLOAD_SECRET`: secret acak minimal 32 karakter.
- `STORAGE_DRIVER=local`: gunakan filesystem hanya untuk pengembangan lokal.

Untuk memakai Supabase Storage, isi `SUPABASE_URL`, `SUPABASE_STORAGE_BUCKET`, dan `SUPABASE_SERVICE_ROLE_KEY`, lalu set `STORAGE_DRIVER=supabase`. Service role key hanya boleh disimpan di server environment; jangan gunakan prefix `NEXT_PUBLIC_` dan jangan commit nilainya.

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

## Supabase Storage

Buat bucket bernama `web-sekolahku-media` dengan pengaturan:

- Public bucket: aktif, karena koleksi Media dan Media Artikel memang dapat dibaca publik.
- Batas ukuran: 50 MB.
- MIME type: PDF, PNG, JPEG/JPG, dan WebP.
- Upload dan penghapusan tetap dilakukan melalui server CMS menggunakan service role key atau signed upload URL.

Bucket publik berarti siapa pun yang memiliki URL file dapat membacanya. Jangan menyimpan dokumen pribadi, data siswa, atau dokumen internal di koleksi media publik. File rahasia memerlukan bucket private dan kontrol akses terpisah.

Adapter Supabase Storage menggunakan Payload Cloud Storage Plugin. Panel Admin meminta signed upload URL ke server, lalu browser mengunggah file langsung ke Supabase. Ini menghindari batas request body 4.5 MB pada Vercel untuk upload asli. Payload tetap memproses metadata dan ukuran gambar; hasil ukuran gambar disimpan melalui adapter server.

## Vercel

Hubungkan repository `caxuga/web-sekolahku` ke Vercel. Gunakan Node.js 24.x dan atur environment variables secara terpisah untuk Preview dan Production.

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | URI Supabase PostgreSQL Session Pooler |
| `PAYLOAD_SECRET` | Secret unik minimal 32 karakter per environment |
| `STORAGE_DRIVER` | Isi `supabase` |
| `SUPABASE_URL` | Project URL Supabase |
| `SUPABASE_STORAGE_BUCKET` | `web-sekolahku-media` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role/secret key, server-only |

Gunakan database dan secret yang sesuai untuk Preview dan Production. Jangan kirim kredensial melalui issue, commit, atau chat. Masukkan langsung di Vercel Project Settings → Environment Variables.

### Mode visual preview

Vercel Preview dapat memakai `CMS_PREVIEW_MODE=true`. Jika `DATABASE_URL` belum diisi, aplikasi menampilkan shell website dengan data contoh dan melewati inisialisasi database. Mode visual preview tidak dapat digunakan untuk menguji panel CMS, login, penyimpanan konten, atau upload.

Setelah database dan environment variables siap, mode visual otomatis berhenti menggunakan fallback.

## Fitur website dan CMS

Website publik saat ini menyediakan:
- Beranda dengan identitas sekolah, berita terbaru, dan agenda terbaru.
- Daftar berita dan detail berita.
- Daftar agenda dan detail agenda.
- Layout responsif untuk desktop, tablet, dan ponsel.

Di panel `/admin`, konfigurasi:
- **Identitas Sekolah**: nama, slogan, judul beranda, deskripsi, logo, alamat, telepon, email, dan footer.
- **Berita** dan **Agenda Sekolah**: judul, slug otomatis, ringkasan, gambar, tanggal, isi, kategori, dan status publikasi.

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

## Keamanan

- Simpan semua secret di Vercel Environment Variables.
- Jangan pernah memberi prefix `NEXT_PUBLIC_` pada service role key atau secret lain.
- Service role key melewati Row Level Security; batasi penggunaannya hanya di server CMS.
- Koleksi Media bersifat publik sesuai desain website. Jangan mengunggah file rahasia ke sana.
- Rotasi credential yang pernah terpublikasi di repository lama.
- Aktifkan branch protection dan wajibkan CI berhasil sebelum merge ke `main`.

## Deployment

- `main`: Production deployment melalui Vercel Git Integration.
- Pull request dan branch fitur: Vercel Preview deployment.
- GitHub Actions CI menjalankan typecheck, lint, tests, dan build sebelum merge.

## Migrasi database

Payload menggunakan adapter PostgreSQL resmi `@payloadcms/db-postgres`. Gunakan Supabase PostgreSQL dengan connection string Session Pooler untuk Vercel. Simpan kredensial hanya di environment variables.

- `pnpm migrate:create` membuat file migrasi.
- `pnpm migrate` menjalankan migrasi yang belum diterapkan.
- `pnpm migrate:status` memeriksa status migrasi.

Aktifkan `RUN_PAYLOAD_MIGRATIONS=true` hanya pada environment yang telah memiliki database dan file migrasi siap dijalankan.
