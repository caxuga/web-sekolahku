import Link from 'next/link'
import type { PublicContent } from '../lib/website'
import { formatSchoolDate } from '../lib/website'
export function ContentCard({ item, type }: { item: PublicContent; type: 'berita' | 'agenda' }) {
  const image = typeof item.image === 'object' && item.image ? item.image.url : undefined
  const alt = typeof item.image === 'object' && item.image ? item.image.alt || item.title : item.title
  return <article className="content-card">
    {image ? <img className="content-card-image" src={image} alt={alt} /> : <div className="content-card-placeholder"><span>{type === 'berita' ? 'BERITA' : 'AGENDA'}</span></div>}
    <div className="content-card-body">
      <p className="eyebrow">{type === 'berita' ? 'Berita Sekolah' : 'Agenda Sekolah'} · {formatSchoolDate(item.articleDate)}</p>
      <h3><Link href={`/${type}/${item.slug}`}>{item.title}</Link></h3>
      <p>{item.excerpt || 'Baca informasi selengkapnya dari sekolah.'}</p>
      <Link className="text-link" href={`/${type}/${item.slug}`}>Baca selengkapnya →</Link>
    </div>
  </article>
}
