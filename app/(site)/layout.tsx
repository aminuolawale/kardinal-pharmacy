import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import ScrollReveal from '@/components/ScrollReveal'
import { getConfig } from '@/lib/config'

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, hero } = await getConfig()
  return {
    title: `${siteTitle} — Ijegun, Lagos`,
    description: hero.subtitle,
  }
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
      <WhatsAppButton />
      <ScrollReveal />
    </>
  )
}
