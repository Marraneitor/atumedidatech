/* PORTAFOLIO — para agregar un proyecto copia un bloque y pon su captura en
   public/assets/img/projects/<id>.webp (960x600). Si además tienes captura de celular,
   ponla en public/assets/img/mobile/<id>.webp (585x1266) y marca mobile: true.
   cat: 'web' | 'system' | 'ai' · sector: 'food' | 'health' | 'retail' | 'local' | 'tech' */
import type { Lang } from './config';
type L = Record<Lang, string>;
export type Project = { id: string; name: string; url: string; cat: 'web' | 'system' | 'ai'; featured?: boolean; mobile?: boolean; type: L; desc: L };

export const PROJECTS: Project[] = [
  {
    id: 'srsburger', name: 'Sr & Sra Burger', url: 'https://www.srsburger.com', cat: 'web', mobile: true, featured: true,
    type: { es: 'Restaurante · Pedidos en línea', en: 'Restaurant · Online ordering', pt: 'Restaurante · Pedidos online' },
    desc: {
      es: 'Sitio con menú interactivo, carrito para celular, cuentas de cliente y pedidos directos a WhatsApp.',
      en: 'Website with interactive menu, mobile cart, customer accounts and orders sent straight to WhatsApp.',
      pt: 'Site com cardápio interativo, carrinho para celular, contas de cliente e pedidos direto no WhatsApp.',
    },
  },
  {
    id: 'beautymina', name: 'Importaciones Beauty Mina', url: 'https://www.beautymina.lat', cat: 'web', mobile: true, featured: true,
    type: { es: 'Tienda en línea · Belleza', en: 'Online store · Beauty', pt: 'Loja online · Beleza' },
    desc: {
      es: 'E-commerce de fragancias y cuidado corporal importado, con catálogo por categorías y pedidos por WhatsApp.',
      en: 'E-commerce for imported fragrances and body care, with a category catalog and WhatsApp ordering.',
      pt: 'E-commerce de fragrâncias e cuidados corporais importados, com catálogo por categorias e pedidos via WhatsApp.',
    },
  },
  {
    id: 'gestia', name: 'Gestia POS', url: 'https://gestia.rest', cat: 'system', mobile: true, featured: true,
    type: { es: 'SaaS · Punto de venta', en: 'SaaS · Point of sale', pt: 'SaaS · Ponto de venda' },
    desc: {
      es: 'Sistema TPV para restaurantes que funciona sin internet y sincroniza en tiempo real: ventas, mesas e inventario.',
      en: 'Restaurant POS that works offline and syncs in real time: sales, tables and inventory.',
      pt: 'Sistema PDV para restaurantes que funciona offline e sincroniza em tempo real: vendas, mesas e estoque.',
    },
  },
  {
    id: 'denti7', name: 'Denti7', url: 'https://denti7.vercel.app', cat: 'web', mobile: true,
    type: { es: 'Salud · Clínica dental', en: 'Healthcare · Dental clinic', pt: 'Saúde · Clínica odontológica' },
    desc: {
      es: 'Sitio para clínica de especialidades dentales con tratamientos, casos reales y citas por WhatsApp.',
      en: 'Website for a specialty dental clinic with treatments, real cases and WhatsApp appointments.',
      pt: 'Site para clínica odontológica com tratamentos, casos reais e agendamento pelo WhatsApp.',
    },
  },
  {
    id: 'hotelmadrid', name: 'Hotel Madrid Minatitlán', url: 'https://hotel-madrid-minatitlan.vercel.app', cat: 'web', mobile: true,
    type: { es: 'Hotelería · Reservas directas', en: 'Hospitality · Direct booking', pt: 'Hotelaria · Reservas diretas' },
    desc: {
      es: 'Sitio bilingüe para hotel con habitaciones, tarifas para empresas y reservación directa sin comisiones.',
      en: 'Bilingual hotel website with rooms, corporate rates and commission-free direct booking.',
      pt: 'Site bilíngue para hotel com quartos, tarifas corporativas e reserva direta sem comissões.',
    },
  },
  {
    id: 'oxford', name: 'Instituto Oxford', url: 'https://instituto-oxford.vercel.app', cat: 'web', mobile: true,
    type: { es: 'Educación · Escuela de inglés', en: 'Education · English school', pt: 'Educação · Escola de inglês' },
    desc: {
      es: 'Sitio para escuela de inglés con programas por edad, propuesta educativa e inscripciones por WhatsApp.',
      en: 'English school website with age-based programs, teaching approach and WhatsApp enrollment.',
      pt: 'Site para escola de inglês com programas por idade, proposta pedagógica e matrículas pelo WhatsApp.',
    },
  },
  {
    id: 'funeraria', name: 'Funeraria La Paz & Peña', url: 'https://funeraria-lapaz.vercel.app', cat: 'web',
    type: { es: 'Servicios · Atención 24 h', en: 'Services · 24/7 care', pt: 'Serviços · Atendimento 24 h' },
    desc: {
      es: 'Sitio sobrio y empático con servicios, planes previsores y contacto inmediato las 24 horas.',
      en: 'A calm, empathetic website with services, pre-need plans and 24/7 immediate contact.',
      pt: 'Site sóbrio e empático com serviços, planos preventivos e contato imediato 24 horas.',
    },
  },
  {
    id: 'littlecakes', name: 'Little Cakes by Nicole', url: 'https://little-cakes-by-nicole.vercel.app', cat: 'web', mobile: true,
    type: { es: 'Repostería · Catálogo', en: 'Bakery · Catalog', pt: 'Confeitaria · Catálogo' },
    desc: {
      es: 'Catálogo visual de cupcakes y pasteles personalizados con precios y pedidos en un toque.',
      en: 'Visual catalog of custom cupcakes and cakes with prices and one-tap ordering.',
      pt: 'Catálogo visual de cupcakes e bolos personalizados com preços e pedidos em um toque.',
    },
  },
  {
    id: 'prettythings', name: 'Pretty Things by Nicole', url: 'https://pretty-things-by-nicole.vercel.app', cat: 'web',
    type: { es: 'Arte y decoración', en: 'Art & decoration', pt: 'Arte e decoração' },
    desc: {
      es: 'Portafolio de lonas pintadas a mano, murales y decoración personalizada con cotización por WhatsApp.',
      en: 'Portfolio of hand-painted banners, murals and custom decoration with WhatsApp quotes.',
      pt: 'Portfólio de faixas pintadas à mão, murais e decoração personalizada com orçamento pelo WhatsApp.',
    },
  },
  {
    id: 'websights', name: 'WebSights Analytics', url: 'https://websightsanalytics.com', cat: 'web',
    type: { es: 'Inmobiliaria · Proptech', en: 'Real estate · Proptech', pt: 'Imobiliária · Proptech' },
    desc: {
      es: 'Plataforma de propiedades en venta y renta con publicación gratuita, filtros y CRM para asesores.',
      en: 'Property listings platform for sale and rent with free posting, filters and a CRM for agents.',
      pt: 'Plataforma de imóveis à venda e para alugar com anúncio grátis, filtros e CRM para corretores.',
    },
  },
  {
    id: 'yuridia', name: 'Yuridia Makeup', url: 'https://yuridia-makeup-citas-zsu7.vercel.app', cat: 'web', mobile: true,
    type: { es: 'Belleza · Agenda de citas', en: 'Beauty · Appointment booking', pt: 'Beleza · Agendamento' },
    desc: {
      es: 'Sitio de maquillista profesional con galería, servicios y agenda de citas en línea.',
      en: 'Professional makeup artist website with gallery, services and online appointment booking.',
      pt: 'Site de maquiadora profissional com galeria, serviços e agendamento online.',
    },
  },
  {
    id: 'debate', name: 'Debate Científico', url: 'https://new-git-main-joel-maciels-projects.vercel.app', cat: 'web',
    type: { es: 'Comunidad · Divulgación', en: 'Community · Science outreach', pt: 'Comunidade · Divulgação' },
    desc: {
      es: 'Portal de divulgación científica con temas organizados, evidencias y comunidad en redes.',
      en: 'Science outreach portal with organized topics, evidence and a social community.',
      pt: 'Portal de divulgação científica com temas organizados, evidências e comunidade nas redes.',
    },
  },
  {
    id: 'gps', name: 'GPS y la Relatividad', url: 'https://gps-git-main-joel-maciels-projects.vercel.app', cat: 'web',
    type: { es: 'Educación · Experiencia interactiva', en: 'Education · Interactive story', pt: 'Educação · Experiência interativa' },
    desc: {
      es: 'Explicación interactiva de cómo la relatividad de Einstein hace posible el GPS, con narrativa visual.',
      en: 'Interactive explainer on how Einstein’s relativity makes GPS possible, told visually.',
      pt: 'Explicação interativa de como a relatividade de Einstein torna o GPS possível, com narrativa visual.',
    },
  },
  {
    id: 'streamly', name: 'Streamly', url: 'https://stremly.vercel.app', cat: 'system',
    type: { es: 'SaaS · Automatización', en: 'SaaS · Automation', pt: 'SaaS · Automação' },
    desc: {
      es: 'Plataforma para gestionar cuentas de streaming, clientes y cobros, con WhatsApp automatizado con IA.',
      en: 'Platform to manage streaming accounts, customers and billing, with AI-powered WhatsApp automation.',
      pt: 'Plataforma para gerenciar contas de streaming, clientes e cobranças, com WhatsApp automatizado por IA.',
    },
  },
  {
    id: 'sigi', name: 'SIGI · Inventario de laboratorio', url: 'https://sigi-pemex.vercel.app', cat: 'system',
    type: { es: 'Industria · Inventarios', en: 'Industry · Inventory', pt: 'Indústria · Estoque' },
    desc: {
      es: 'Sistema de inventario de instrumentos, reactivos y material para un laboratorio del sector energético.',
      en: 'Inventory system for instruments, reagents and supplies in an energy-sector laboratory.',
      pt: 'Sistema de estoque de instrumentos, reagentes e materiais para um laboratório do setor de energia.',
    },
  },
  {
    id: 'burgermanager', name: 'Burger Manager', url: 'https://manager-phi-liard.vercel.app', cat: 'system',
    type: { es: 'Panel administrativo', en: 'Admin dashboard', pt: 'Painel administrativo' },
    desc: {
      es: 'Panel de gestión para restaurante: punto de venta, productos, clientes, compras y reportes de ventas.',
      en: 'Restaurant management dashboard: POS, products, customers, purchases and sales reports.',
      pt: 'Painel de gestão para restaurante: PDV, produtos, clientes, compras e relatórios de vendas.',
    },
  },
  {
    id: 'chatbot', name: 'Pedidos WhatsApp', url: 'https://chatbotsrysraburger.vercel.app', cat: 'system',
    type: { es: 'Chatbot · Cocina en vivo', en: 'Chatbot · Live kitchen board', pt: 'Chatbot · Cozinha ao vivo' },
    desc: {
      es: 'Tablero en tiempo real que recibe los pedidos del chatbot de WhatsApp y los organiza por estado.',
      en: 'Real-time board that receives WhatsApp chatbot orders and organizes them by status.',
      pt: 'Painel em tempo real que recebe os pedidos do chatbot do WhatsApp e os organiza por status.',
    },
  },
  {
    id: 'cobranza', name: 'Gestor de Cobranza', url: 'https://prototipo-gestordecobranza-joel-maciels-projects.vercel.app', cat: 'system',
    type: { es: 'Cobranza · Recordatorios', en: 'Billing · Reminders', pt: 'Cobrança · Lembretes' },
    desc: {
      es: 'Control de clientes y servicios con fechas de vencimiento, calendario y recordatorios de renovación.',
      en: 'Customer and service tracking with due dates, calendar and renewal reminders.',
      pt: 'Controle de clientes e serviços com vencimentos, calendário e lembretes de renovação.',
    },
  },
  {
    id: 'homework', name: 'HomeWorkIA', url: 'https://homework-ia.vercel.app', cat: 'ai',
    type: { es: 'App con IA · Estudio', en: 'AI app · Study', pt: 'App com IA · Estudos' },
    desc: {
      es: 'Gestor de estudio inteligente: organiza tareas, materias y fechas de entrega con ayuda de IA.',
      en: 'Smart study manager: organizes homework, subjects and deadlines with AI assistance.',
      pt: 'Gerenciador de estudos inteligente: organiza tarefas, matérias e prazos com ajuda de IA.',
    },
  },
  {
    id: 'hexalia', name: 'Hexalia', url: 'https://tacan-seven.vercel.app', cat: 'ai',
    type: { es: 'Juego web · Multijugador', en: 'Web game · Multiplayer', pt: 'Jogo web · Multijogador' },
    desc: {
      es: 'Juego de estrategia por turnos en el navegador, con tablero hexagonal, salas y varios jugadores.',
      en: 'Turn-based strategy game in the browser with a hex board, rooms and multiple players.',
      pt: 'Jogo de estratégia por turnos no navegador, com tabuleiro hexagonal, salas e vários jogadores.',
    },
  },
  {
    id: 'redbook', name: 'RedBook', url: 'https://project-pi-black.vercel.app', cat: 'ai',
    type: { es: 'App · Productividad', en: 'App · Productivity', pt: 'App · Produtividade' },
    desc: {
      es: 'Agenda personal con tareas diarias, finanzas, objetivos y calendario en una sola app.',
      en: 'Personal planner with daily tasks, finances, goals and calendar in one app.',
      pt: 'Agenda pessoal com tarefas diárias, finanças, metas e calendário em um só app.',
    },
  },
];
