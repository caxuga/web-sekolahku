import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichTextContent } from '../../../../components/RichTextContent'
import { SiteFooter } from '../../../../components/SiteFooter'
import { SiteHeader } from '../../../../components/SiteHeader'
import { formatSchoolDate, getPublicContentBySlug, getSchoolSettings } from '../../../../lib/website'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getPublicContentBySlug('siaran', slug)
  return { title: item?.title || 'Berita', description: item?.excerpt || 'Informasi terbaru sekolah' }
}
export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params
  const [settings, item] = await Promise.all([getSchoolSettings(), getPublicContentBySlug('siaran', slug)])
  if (!item) notFound()
  const image = typeof item.image === 'object' && item.image ? item.image.url : undefined
  const imageAlt = typeof item.image === 'object' && item.image ? item.image.alt || item.title : item.title
  return <><SiteHeader settings={settings} /><main className="article-main container">
    <Link className="back-link" href="/berita">← Kembali ke berita</Link>
    <article className="article-detail"><p className="eyebrow">BERITA · {formatSchoolDate(item.articleDate)}</p><h1>{item.title}</h1>
      {item.excerpt && <p className="article-excerpt">{item.excerpt}</p>}
      {image && <img className="article-cover" src={image} alt={imageAlt} />}
      <RichTextContent content={item.content} />
    </article>
  </main><SiteFooter settings={settings} /></>
}
