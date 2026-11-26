import { MotionConfig } from 'framer-motion';
import { PrefsProvider } from '@/lib/prefs';
import Header from '@/components/Header';
import Portfolio from '@/components/Portfolio';
import Packages from '@/components/Packages';
import Home from '@/components/Home';
import ServiceList from '@/components/ServiceList';
import PriceList from '@/components/PriceList';
import { TabPanel, TabsProvider } from '@/components/Tabs';
import Contact, { Footer, WaFloat } from '@/components/Contact';
import IntroVortex from '@/components/IntroVortex';
import IdleScreen from '@/components/IdleScreen';

export default function Page() {
  return (
    <PrefsProvider>
      <IntroVortex />
      <MotionConfig reducedMotion="user">
        <TabsProvider>
          <Header />
          {/* Cada pestaña es un panel; se navega de izquierda a derecha con la barra de arriba. */}
          <main>
            <TabPanel id="inicio" pad={false}>
              <Home />
            </TabPanel>
            <TabPanel id="portafolio">
              <Portfolio />
            </TabPanel>
            <TabPanel id="soluciones">
              <ServiceList />
            </TabPanel>
            <TabPanel id="paquetes">
              <Packages />
            </TabPanel>
            <TabPanel id="precios">
              <PriceList />
            </TabPanel>
            <TabPanel id="contacto">
              <Contact />
            </TabPanel>
          </main>
          <Footer />
          <WaFloat />
          <IdleScreen />
        </TabsProvider>
      </MotionConfig>
    </PrefsProvider>
  );
}
