import type { Access } from 'payload'
export type SchoolRole = 'super-admin' | 'admin-sekolah' | 'kepala-sekolah' | 'editor' | 'guru'
export const hasAnyRole = (user: unknown, roles: SchoolRole[]) => {
  if (!user || typeof user !== 'object' || !('role' in user)) return false
  const role = (user as { role?: SchoolRole }).role
  return !!role && roles.includes(role)
}
export const isSchoolAdmin: Access = ({ req }) => hasAnyRole(req.user, ['super-admin', 'admin-sekolah'])
export const canCreateContent: Access = ({ req }) => hasAnyRole(req.user, ['super-admin', 'admin-sekolah', 'kepala-sekolah', 'editor', 'guru'])
export const canUpdateContent: Access = ({ req }) => {
  if (hasAnyRole(req.user, ['super-admin', 'admin-sekolah', 'kepala-sekolah', 'editor'])) return true
  if (hasAnyRole(req.user, ['guru']) && req.user) return { createdBy: { equals: req.user.id } }
  return false
}
export const canDeleteContent: Access = ({ req }) => hasAnyRole(req.user, ['super-admin', 'admin-sekolah', 'editor'])
export const canPublishContent = (user: unknown) => hasAnyRole(user, ['super-admin', 'admin-sekolah', 'kepala-sekolah'])
export const publicOrAuthenticatedRead: Access = ({ req }) => req.user ? true : { status: { equals: 'published' } }
