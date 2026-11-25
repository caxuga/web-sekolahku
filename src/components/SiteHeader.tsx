import Link from 'next/link'
import type { SchoolSettingsData } from '../lib/website'
export function SiteHeader({ settings }: { settings: SchoolSettingsData }) {
  const logo = typeof settings.logo === 'object' && settings.logo ? settings.logo.url : undefined
  return <header className="site-header"><div className="container header-inner">
    <Link href="/" className="brand">{logo ? <img src={logo} alt={settings.schoolName || 'Logo sekolah'} /> : <span className="brand-mark">S</span>}
      <span><strong>{settings.schoolName || 'Nama Sekolah'}</strong><small>{settings.tagline || 'Website Resmi Sekolah'}</small></span>
    </Link>
    <nav aria-label="Navigasi utama"><Link href="/">Beranda</Link><Link href="/berita">Berita</Link><Link href="/agenda">Agenda</Link><Link href="/admin" className="nav-admin">Login Admin</Link></nav>
  </div></header>
}
