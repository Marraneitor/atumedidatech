import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/config';
import { DICTS } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-jakarta', display: 'swap' });

const t = DICTS.es;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: t.meta.title,
  description: t.meta.desc,
  alternates: {
    canonical: '/',
    languages: { es: '/?lang=es', en: '/?lang=en', pt: '/?lang=pt', 'x-default': '/' },
  },
  icons: { icon: '/assets/img/logo-mark.svg', apple: '/assets/img/logo-512.png' },
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: 'A TU MEDIDA TECH',
    title: t.meta.title,
    description: t.meta.desc,
    locale: 'es_MX',
    alternateLocale: ['en_US', 'pt_BR'],
    images: [{ url: '/assets/img/og-image.png', width: 1200, height: 630, alt: 'A TU MEDIDA TECH' }],
  },
  twitter: { card: 'summary_large_image', title: t.meta.title, description: t.meta.desc, images: ['/assets/img/og-image.png'] },
};

export const viewport: Viewport = {
  themeColor: '#05070d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'A TU MEDIDA TECH',
  url: SITE.url,
  logo: `${SITE.url}/assets/img/logo-512.png`,
  image: `${SITE.url}/assets/img/og-image.png`,
  telephone: SITE.contact.phoneDisplay,
  areaServed: 'Worldwide',
  address: { '@type': 'PostalAddress', addressCountry: 'MX' },
  sameAs: [SITE.contact.facebook],
  priceRange: 'MXN 999+',
  knowsLanguage: ['es', 'en', 'pt'],
  makesOffer: [
    'Desarrollo Web Premium',
    'Menús Inteligentes QR',
    'Tarjetas Digitales NFC',
    'Automatización Digital',
  ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
