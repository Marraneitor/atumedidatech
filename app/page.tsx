import { MotionConfig } from 'framer-motion';
import { PrefsProvider } from '@/lib/prefs';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Problem from '@/components/Problem';
import Services from '@/components/Services';
import Steps from '@/components/Steps';
import Trust from '@/components/Trust';
import Portfolio from '@/components/Portfolio';
import Why, { Marquee } from '@/components/Why';
import Pricing from '@/components/Pricing';
import Packages from '@/components/Packages';
import { TabPanel, TabsProvider } from '@/components/Tabs';
import Contact, { Footer, WaFloat } from '@/components/Contact';
import WaterRipple from '@/components/WaterRipple';

export default function Page() {
  return (
    <PrefsProvider>
      <MotionConfig reducedMotion="user">
        <TabsProvider>
          <WaterRipple />
          <Header />
          {/* Cada pestaña es un panel; se navega de izquierda a derecha con la barra de arriba. */}
          <main>
            <TabPanel id="inicio" pad={false}>
              <Hero />
              <Marquee />
              <Problem />
              <Why />
            </TabPanel>
            <TabPanel id="portafolio">
              <Portfolio />
            </TabPanel>
            <TabPanel id="soluciones">
              <Services />
              <Steps />
            </TabPanel>
            <TabPanel id="paquetes">
              <Packages />
            </TabPanel>
            <TabPanel id="precios">
              <Pricing />
              <Trust />
            </TabPanel>
            <TabPanel id="contacto">
              <Contact />
            </TabPanel>
          </main>
          <Footer />
          <WaFloat />
        </TabsProvider>
      </MotionConfig>
    </PrefsProvider>
  );
}
