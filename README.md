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

- `main`: Production.
- Pull request dan branch fitur: Vercel Preview.
- GitHub Actions CI menjalankan typecheck, lint, tests, dan build.
