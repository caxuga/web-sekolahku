import type { GlobalConfig } from 'payload'
import { isSchoolAdmin } from '../access/roles'
export const SchoolSettings: GlobalConfig = {
  slug: 'school-settings', label: 'Identitas Sekolah',
  access: { read: () => true, update: isSchoolAdmin },
  fields: [
    { name: 'schoolName', type: 'text', label: 'Nama Sekolah', required: true, defaultValue: 'Nama Sekolah' },
    { name: 'tagline', type: 'text', label: 'Slogan', defaultValue: 'Membangun generasi berkarakter dan berprestasi' },
    { name: 'heroTitle', type: 'text', label: 'Judul Beranda', defaultValue: 'Selamat Datang di Website Resmi Sekolah' },
    { name: 'heroDescription', type: 'textarea', label: 'Deskripsi Beranda', defaultValue: 'Informasi, berita, dan kegiatan terbaru sekolah.' },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo Sekolah' },
    { name: 'address', type: 'textarea', label: 'Alamat Sekolah' },
    { name: 'phone', type: 'text', label: 'Telepon' },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'footerText', type: 'text', label: 'Teks Footer', defaultValue: 'Website resmi sekolah' },
  ],
}
