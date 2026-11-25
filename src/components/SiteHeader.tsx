import Link from 'next/link'
import type { SchoolSettingsData } from '../lib/website'
import { isVisualPreview } from '../config/env.config'
export function SiteHeader({ settings }: { settings: SchoolSettingsData }) {
  const previewOnly = isVisualPreview()
  const logo = typeof settings.logo === 'object' && settings.logo ? settings.logo.url : undefined
  return <header className="site-header"><div className="container header-inner">
    <Link href="/" className="brand">{logo ? <img src={logo} alt={settings.schoolName || 'Logo sekolah'} /> : <span className="brand-mark">S</span>}
      <span><strong>{settings.schoolName || 'Nama Sekolah'}</strong><small>{settings.tagline || 'Website Resmi Sekolah'}</small></span>
    </Link>
    <nav aria-label="Navigasi utama"><Link href="/">Beranda</Link><Link href="/berita">Berita</Link><Link href="/agenda">Agenda</Link>{previewOnly ? <span className="preview-chip">Preview UI</span> : <Link href="/admin" className="nav-admin">Login Admin</Link>}</nav>
  </div></header>
}
