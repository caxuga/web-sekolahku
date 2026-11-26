import Link from 'next/link'
import { ContentCard } from '../../components/ContentCard'
import { SiteFooter } from '../../components/SiteFooter'
import { SiteHeader } from '../../components/SiteHeader'
import { getPublicContent, getSchoolSettings } from '../../lib/website'
export const dynamic = 'force-dynamic'
export default async function HomePage() {
  const [settings, news, events] = await Promise.all([getSchoolSettings(), getPublicContent('siaran', 3), getPublicContent('takwim', 3)])
  return <>
    <SiteHeader settings={settings} />
    <main>
      <section className="hero"><div className="container hero-grid">
        <div className="hero-copy"><p className="eyebrow hero-eyebrow">WEBSITE RESMI SEKOLAH</p>
          <h1>{settings.heroTitle || 'Membangun Masa Depan, Mengukir Prestasi'}</h1>
          <p className="hero-description">{settings.heroDescription || 'Temukan informasi, berita, dan kegiatan terbaru dari sekolah kami.'}</p>
          <div className="hero-actions"><Link className="button button-primary" href="/berita">Jelajahi Berita</Link><Link className="button button-outline" href="/agenda">Lihat Agenda</Link></div>
          <div className="hero-note"><span className="status-dot" /> Informasi resmi dan terkini dari sekolah</div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-card"><span className="art-icon">✦</span><strong>Belajar</strong><small>Berkarakter · Berprestasi</small></div><div className="art-stamp">GENERASI<br/>UNGGUL</div></div>
      </div></section>
      <section className="intro-strip"><div className="container intro-inner"><span className="intro-number">01</span><p><strong>{settings.schoolName || 'Nama Sekolah'}</strong> — {settings.tagline || 'Tempat tumbuh, belajar, dan meraih cita-cita.'}</p><span className="intro-line" /></div></section>
      <section className="section container"><div className="section-heading"><div><p className="eyebrow">KABAR TERBARU</p><h2>Berita Sekolah</h2><p>Informasi dan cerita terbaru dari lingkungan sekolah.</p></div><Link className="text-link" href="/berita">Semua berita →</Link></div>
        {news.length ? <div className="content-grid">{news.map(item => <ContentCard key={item.id} item={item} type="berita" />)}</div> : <div className="empty-state"><strong>Belum ada berita yang diterbitkan.</strong><span>Berita yang sudah disetujui akan tampil di bagian ini.</span></div>}
      </section>
      <section className="section section-tint"><div className="container"><div className="section-heading"><div><p className="eyebrow">JADWAL KEGIATAN</p><h2>Agenda Sekolah</h2><p>Catat kegiatan penting dan agenda mendatang.</p></div><Link className="text-link" href="/agenda">Semua agenda →</Link></div>
        {events.length ? <div className="content-grid">{events.map(item => <ContentCard key={item.id} item={item} type="agenda" />)}</div> : <div className="empty-state"><strong>Belum ada agenda yang diterbitkan.</strong><span>Agenda sekolah akan ditampilkan setelah dipublikasikan.</span></div>}
      </div></section>
    </main><SiteFooter settings={settings} />
  </>
}
