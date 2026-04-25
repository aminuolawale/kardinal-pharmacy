import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import ScrollReveal from '@/components/ScrollReveal'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kardinal Pharmacy — Ijegun, Lagos',
  description:
    'Professional pharmaceutical consultations, prescription services and bespoke cosmetic products in Ijegun, Lagos. Led by Pharm. Aminu Abdulsalam.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <Nav />
        {children}
        <Footer />
        <WhatsAppButton />
        <ScrollReveal />
      </body>
    </html>
  )
}
