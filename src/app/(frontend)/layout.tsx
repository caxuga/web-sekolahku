import type { Metadata } from 'next'
import React from 'react'
import './styles.css'
export const metadata: Metadata = {
  title: { default: 'Website Resmi Sekolah', template: '%s | Website Resmi Sekolah' },
  description: 'Website resmi sekolah untuk informasi, berita, dan agenda kegiatan.',
  applicationName: 'Web Sekolahku',
  robots: { index: true, follow: true },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>{children}</body></html>
}
