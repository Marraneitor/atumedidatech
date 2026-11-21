import type { Metadata } from 'next';
import Booking from '@/components/citas/Booking';

export const metadata: Metadata = {
  title: 'Agenda una llamada · A TU MEDIDA TECH',
  description: 'Elige día y hora para platicar sin costo sobre tu página web, CRM con chatbot de WhatsApp o sistema POS. Te confirmamos por WhatsApp.',
  alternates: { canonical: '/citas' },
  openGraph: {
    title: 'Agenda una llamada · A TU MEDIDA TECH',
    description: 'Diagnóstico sin costo para tu negocio. Elige día y hora y te confirmamos por WhatsApp.',
    url: '/citas',
    images: [{ url: '/assets/img/og-image.png', width: 1200, height: 630, alt: 'A TU MEDIDA TECH' }],
  },
};

export default function CitasPage() {
  return <Booking />;
}
