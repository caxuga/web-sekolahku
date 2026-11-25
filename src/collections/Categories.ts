import { APIError, type CollectionConfig } from 'payload'
import { isSchoolAdmin, canCreateContent, canDeleteContent } from '../access/roles'
export const Categories: CollectionConfig = {
  slug: 'categories', labels: { singular: 'Kategori', plural: 'Kategori' },
  access: { read: () => true, create: canCreateContent, update: isSchoolAdmin, delete: canDeleteContent },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'value'] },
  hooks: {
    beforeChange: [({ data }) => {
      if (data?.name) {
        data.name = data.name.charAt(0).toUpperCase() + data.name.slice(1)
        data.value = data.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
      }
      return data
    }],
    beforeDelete: [async ({ id, req }) => {
      const [news, events] = await Promise.all([
        req.payload.find({ collection: 'siaran', where: { category: { equals: id } }, limit: 1, depth: 0 }),
        req.payload.find({ collection: 'takwim', where: { category: { equals: id } }, limit: 1, depth: 0 }),
      ])
      if (news.totalDocs || events.totalDocs) throw new APIError('Kategori masih digunakan dan tidak dapat dihapus.', 400)
    }],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, minLength: 1, maxLength: 50, label: 'Nama Kategori' },
    { name: 'value', type: 'text', required: true, unique: true, admin: { hidden: true } },
    { name: 'colors', type: 'select', defaultValue: '#2563EB', options: [{ label: 'Hijau', value: '#10B981' }, { label: 'Biru', value: '#2563EB' }, { label: 'Emas', value: '#D69E36' }] },
  ], timestamps: true,
}
