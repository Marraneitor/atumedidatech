import { MotionConfig } from 'framer-motion';
import { PrefsProvider } from '@/lib/prefs';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Why, { Marquee } from '@/components/Why';
import Pricing from '@/components/Pricing';
import Contact, { Footer, WaFloat } from '@/components/Contact';
import WaterRipple from '@/components/WaterRipple';

export default function Page() {
  return (
    <PrefsProvider>
      <MotionConfig reducedMotion="user">
        <WaterRipple />
        <Header />
        <main>
          <Hero />
          <Marquee />
          <Services />
          <Portfolio />
          <Why />
          <Pricing />
          <Contact />
        </main>
        <Footer />
        <WaFloat />
      </MotionConfig>
    </PrefsProvider>
  );
}
