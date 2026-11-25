import { APIError, type CollectionConfig } from 'payload'
import { apiKeyStrategy } from '../auth/apiKeyStrategy'
import { hasAnyRole, isSchoolAdmin } from '../access/roles'
import { PASSWORD_POLICY_ERROR_MESSAGE, PASSWORD_POLICY_UI_DESCRIPTION, validatePasswordComplexity } from '../utils/password-policy.util'
export const Users: CollectionConfig = {
  slug: 'users', labels: { singular: 'Pengguna', plural: 'Pengguna' },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'name', 'role', 'updatedAt'], description: `Password policy: ${PASSWORD_POLICY_UI_DESCRIPTION}` },
  access: {
    admin: isSchoolAdmin,
    create: async ({ req }) => {
      if (req.user) return hasAnyRole(req.user, ['super-admin', 'admin-sekolah'])
      const existing = await req.payload.find({ collection: 'users', limit: 1, overrideAccess: true, depth: 0 })
      return existing.totalDocs === 0
    },
    read: ({ req }) => hasAnyRole(req.user, ['super-admin', 'admin-sekolah']) ? true : req.user ? { id: { equals: req.user.id } } : false,
    update: ({ req }) => hasAnyRole(req.user, ['super-admin', 'admin-sekolah']) ? true : req.user ? { id: { equals: req.user.id } } : false,
    delete: isSchoolAdmin,
  },
  auth: {
    useSessions: true,
    cookies: { sameSite: 'Strict', secure: process.env.NODE_ENV === 'production' },
    strategies: [apiKeyStrategy], maxLoginAttempts: 5, lockTime: 15 * 60 * 1000,
  },
  hooks: { beforeChange: [async ({ data, operation, req }) => {
    if (operation === 'create') {
      const existing = await req.payload.find({ collection: 'users', limit: 1, overrideAccess: true, depth: 0 })
      if (existing.totalDocs === 0) data.role = 'super-admin'
    }
    if (!data.password) return data
    if (typeof data.password === 'string' && !validatePasswordComplexity(data.password)) throw new APIError(PASSWORD_POLICY_ERROR_MESSAGE, 400)
    return data
  }] },
  fields: [
    { name: 'name', type: 'text', label: 'Nama Lengkap' },
    { name: 'role', type: 'select', label: 'Peran Pengguna', required: true, defaultValue: 'editor',
      options: [
        { label: 'Super Admin', value: 'super-admin' }, { label: 'Admin Sekolah', value: 'admin-sekolah' },
        { label: 'Kepala Sekolah', value: 'kepala-sekolah' }, { label: 'Editor', value: 'editor' }, { label: 'Guru', value: 'guru' },
      ],
      access: { update: isSchoolAdmin }, admin: { position: 'sidebar', description: 'Peran menentukan akses pengguna pada CMS.' },
    },
  ],
}
