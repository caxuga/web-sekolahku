import { APIError, type CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { canCreateContent, canDeleteContent, canPublishContent, canUpdateContent, publicOrAuthenticatedRead } from '../access/roles'
const slugify = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
export const Siaran: CollectionConfig = {
  slug: 'siaran', labels: { singular: 'Berita', plural: 'Berita' },
  access: { read: publicOrAuthenticatedRead, create: canCreateContent, update: canUpdateContent, delete: canDeleteContent },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'articleDate', 'category', 'updatedAt'], description: 'Berita sekolah. Konten berstatus Terbit akan tampil di website publik.' },
  hooks: { beforeChange: [({ data, operation, req, originalDoc }) => {
    if (data.title && (!data.slug || operation === 'create')) data.slug = slugify(data.title)
    if (operation === 'create' && req.user) data.createdBy = req.user.id
    const nextStatus = data.status ?? originalDoc?.status ?? 'draft'
    const wasPublished = originalDoc?.status === 'published'
    if (nextStatus === 'published' && !wasPublished && !canPublishContent(req.user)) throw new APIError('Hanya Admin Sekolah atau Kepala Sekolah yang dapat menerbitkan konten.', 403)
    if (wasPublished && nextStatus !== 'published' && !canPublishContent(req.user)) throw new APIError('Hanya Admin Sekolah atau Kepala Sekolah yang dapat mengubah status konten terbit.', 403)
    if (nextStatus === 'published' && !data.publishedAt && !originalDoc?.publishedAt) data.publishedAt = new Date().toISOString()
    return data
  }] },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Judul Berita' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar', description: 'URL dibuat otomatis dari judul.' } },
    { name: 'excerpt', type: 'textarea', label: 'Ringkasan', maxLength: 280 },
    { name: 'image', type: 'upload', relationTo: 'articles-media', required: false, label: 'Gambar Utama' },
    { name: 'articleDate', type: 'date', required: true, label: 'Tanggal', admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } } },
    { name: 'content', type: 'richText', required: true, label: 'Isi Konten', editor: lexicalEditor() },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: false, label: 'Kategori' },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', label: 'Status Publikasi',
      options: [{ label: 'Draft', value: 'draft' }, { label: 'Menunggu Persetujuan', value: 'review' }, { label: 'Terbit', value: 'published' }, { label: 'Ditolak', value: 'rejected' }],
      admin: { position: 'sidebar' },
    },
    { name: 'publishedAt', type: 'date', label: 'Tanggal Terbit', admin: { position: 'sidebar', readOnly: true } },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', label: 'Dibuat Oleh', access: { update: () => false }, admin: { position: 'sidebar', readOnly: true } },
  ],
  timestamps: true,
}
