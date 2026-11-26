import type { SchoolSettingsData } from '../lib/website'
export function SiteFooter({ settings }: { settings: SchoolSettingsData }) {
  return <footer className="site-footer"><div className="container footer-inner">
    <div><strong>{settings.schoolName || 'Nama Sekolah'}</strong><p>{settings.footerText || 'Website resmi sekolah.'}</p></div>
    <div className="footer-contact">{settings.address && <span>{settings.address}</span>}{settings.phone && <span>{settings.phone}</span>}{settings.email && <span>{settings.email}</span>}</div>
    <small>© {new Date().getFullYear()} {settings.schoolName || 'Nama Sekolah'}. Hak cipta dilindungi.</small>
  </div></footer>
}
