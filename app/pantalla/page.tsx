import type { Metadata } from 'next';
import Screen from '@/components/pantalla/Screen';

/* Protector de pantalla para fondos (podcast, stands, TV). No aparece en buscadores ni en el menú. */
export const metadata: Metadata = {
  title: 'A TU MEDIDA TECH · Pantalla',
  description: 'Proyectos de A TU MEDIDA TECH en movimiento.',
  robots: { index: false, follow: false },
};

export default function PantallaPage() {
  return <Screen />;
}
