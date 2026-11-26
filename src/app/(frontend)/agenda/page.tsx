import type { Metadata } from 'next'
import { ContentCard } from '../../../components/ContentCard'
import { SiteFooter } from '../../../components/SiteFooter'
import { SiteHeader } from '../../../components/SiteHeader'
import { getPublicContent, getSchoolSettings } from '../../../lib/website'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Agenda Sekolah' }
export default async function AgendaPage() {
  const [settings, items] = await Promise.all([getSchoolSettings(), getPublicContent('takwim', 50)])
  return <><SiteHeader settings={settings} /><main className="page-main">
    <section className="page-banner"><div className="container"><p className="eyebrow">INFORMASI SEKOLAH</p><h1>Agenda Sekolah</h1><p>Jadwal kegiatan dan agenda resmi sekolah.</p></div></section>
    <section className="section container">{items.length ? <div className="content-grid">{items.map(item => <ContentCard key={item.id} item={item} type="agenda" />)}</div> : <div className="empty-state"><strong>Belum ada konten yang diterbitkan.</strong><span>Silakan kembali lagi untuk melihat pembaruan.</span></div>}</section>
  </main><SiteFooter settings={settings} /></>
}
