import config from '@payload-config'
import { getPayload, type Where } from 'payload'

export type SchoolSettingsData = {
  schoolName?: string
  tagline?: string
  heroTitle?: string
  heroDescription?: string
  address?: string
  phone?: string
  email?: string
  footerText?: string
  logo?: { url?: string; alt?: string } | string | null
}
export type PublicContent = {
  id: string | number
  title: string
  slug: string
  excerpt?: string | null
  articleDate?: string | null
  content?: unknown
  image?: { url?: string; alt?: string } | string | null
}
export async function getSchoolSettings(): Promise<SchoolSettingsData> {
  const payload = await getPayload({ config })
  return await payload.findGlobal({ slug: 'school-settings', depth: 1 }) as SchoolSettingsData
}
export async function getPublicContent(collection: 'siaran' | 'takwim', limit = 10): Promise<PublicContent[]> {
  const payload = await getPayload({ config })
  const options = { where: { status: { equals: 'published' as const } }, limit, depth: 2 as const }
  const result = collection === 'siaran'
    ? await payload.find({ collection: 'siaran', ...options, sort: '-publishedAt' })
    : await payload.find({ collection: 'takwim', ...options, sort: 'articleDate' })
  return result.docs as unknown as PublicContent[]
}
export async function getPublicContentBySlug(collection: 'siaran' | 'takwim', slug: string): Promise<PublicContent | null> {
  const payload = await getPayload({ config })
  const where: Where = { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] }
  const result = collection === 'siaran'
    ? await payload.find({ collection: 'siaran', where, limit: 1, depth: 2 })
    : await payload.find({ collection: 'takwim', where, limit: 1, depth: 2 })
  return (result.docs[0] as unknown as PublicContent | undefined) ?? null
}
export function formatSchoolDate(value?: string | null): string {
  if (!value) return 'Tanggal belum ditentukan'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
}
