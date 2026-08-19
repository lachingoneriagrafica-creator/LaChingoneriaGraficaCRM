import { Client, ClientTimelineEvent, ProductionJob, Quote, NotificationItem, Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // Papelería Corporativa
  {
    id: 'prd_1',
    sku: 'PRD-PAP-001',
    name: 'Tarjetas de Presentación Couche 350g',
    category: 'papeleria',
    categoryLabel: 'Papelería',
    description: 'Impresión 4x4 tintas en Couche 350g, laminado mate Soft-Touch frente y vuelta, esquinas rectas.',
    unitPrice: 650.00,
    unit: 'millar',
    minQuantity: 1000,
    paperStock: 'Couche 350g mate importado',
    suggestedFinishes: ['Laminado Mate Soft-Touch', 'Refile a escuadra'],
    estimatedProductionDays: 2,
    tags: ['Más vendido', 'Corporativo', 'Frecuente'],
    active: true,
    createdAt: '2023-10-01'
  },
  {
    id: 'prd_2',
    sku: 'PRD-PAP-002',
    name: 'Hojas Membretadas Bond 90g Optik White',
    category: 'papeleria',
    categoryLabel: 'Papelería',
    description: 'Impresión 4x0 tintas Offset de alta precisión sobre papel Bond 90g ultra blanco, apto para impresoras láser y de inyección.',
    unitPrice: 850.00,
    unit: 'millar',
    minQuantity: 1000,
    paperStock: 'Bond 90g Optik White',
    suggestedFinishes: ['Corte a escuadra', 'Empaque en resmas'],
    estimatedProductionDays: 3,
    tags: ['Oficina', 'Papelería'],
    active: true,
    createdAt: '2023-10-01'
  },
  {
    id: 'prd_3',
    sku: 'PRD-PAP-003',
    name: 'Folders Corporativos con Solapa y Ranura',
    category: 'papeleria',
    categoryLabel: 'Papelería',
    description: 'Cartulina Sulfatada 14pts 1 cara, impresión 4x0 tintas, plastificado mate en exterior, solapa pegada con ranuras para tarjeta.',
    unitPrice: 24.50,
    unit: 'pza',
    minQuantity: 100,
    paperStock: 'Cartulina Sulfatada 14pts',
    suggestedFinishes: ['Plastificado Mate', 'Suaje con Solapa', 'Pegado de Solapa'],
    estimatedProductionDays: 4,
    tags: ['Carpetas', 'Corporativo'],
    active: true,
    createdAt: '2023-10-02'
  },
  {
    id: 'prd_4',
    sku: 'PRD-PAP-004',
    name: 'Folletos Trípticos Couche 150g Brillante',
    category: 'papeleria',
    categoryLabel: 'Papelería',
    description: 'Impresión 4x4 tintas CMYK en Couche 150g brillante, tamaño carta extendido (21.5 x 28 cm), dos dobleces en acordeón o envolvente.',
    unitPrice: 3.20,
    unit: 'pza',
    minQuantity: 500,
    paperStock: 'Couche 150g brillante',
    suggestedFinishes: ['Doblado en Tríptico', 'Refile'],
    estimatedProductionDays: 3,
    tags: ['Publicidad', 'Folletería'],
    active: true,
    createdAt: '2023-10-02'
  },

  // Etiquetas y Stickers
  {
    id: 'prd_5',
    sku: 'PRD-ETQ-001',
    name: 'Etiquetas Vinil Autoadherible con Suaje',
    category: 'etiquetas',
    categoryLabel: 'Etiquetas',
    description: 'Vinil blanco mate o brillante con adhesivo permanente, impresión tintas eco-solventes HD, corte a registro (Kiss-cut individual o en planilla).',
    unitPrice: 1.50,
    unit: 'pza',
    minQuantity: 500,
    paperStock: 'Vinil Autoadherible Blanco',
    suggestedFinishes: ['Troquelado Kiss-cut', 'Medio Corte'],
    estimatedProductionDays: 2,
    tags: ['Productos', 'Resistente al agua', 'Popular'],
    active: true,
    createdAt: '2023-10-03'
  },
  {
    id: 'prd_6',
    sku: 'PRD-ETQ-002',
    name: 'Etiquetas Metalizadas Plata / Oro con Reserva',
    category: 'etiquetas',
    categoryLabel: 'Etiquetas',
    description: 'Polipropileno metalizado plata/oro con impresión CMYK + tinta blanca sectorizada para efectos holográficos y brillo metálico.',
    unitPrice: 2.80,
    unit: 'pza',
    minQuantity: 1000,
    paperStock: 'Polipropileno Metalizado Plata',
    suggestedFinishes: ['Tinta Blanca de Reserva', 'Barniz UV protector'],
    estimatedProductionDays: 4,
    tags: ['Premium', 'Bebidas', 'Cosmética'],
    active: true,
    createdAt: '2023-10-03'
  },
  {
    id: 'prd_7',
    sku: 'PRD-ETQ-003',
    name: 'Rollos de Etiquetas Térmicas 4x6"',
    category: 'etiquetas',
    categoryLabel: 'Etiquetas',
    description: 'Rollo de 500 etiquetas autoadheribles térmicas directas estándar para guías de envío y logística (E-commerce / Paquetería).',
    unitPrice: 180.00,
    unit: 'rollo',
    minQuantity: 5,
    paperStock: 'Papel Térmico Directo Autoadherible',
    suggestedFinishes: ['Embobinado en núcleo de 1" o 3"'],
    estimatedProductionDays: 1,
    tags: ['Logística', 'E-commerce'],
    active: true,
    createdAt: '2023-10-04'
  },

  // Gran Formato
  {
    id: 'prd_8',
    sku: 'PRD-GRN-001',
    name: 'Lona Frontlit 13oz con Ojillos y Bastilla',
    category: 'gran_formato',
    categoryLabel: 'Gran Formato',
    description: 'Lona vinílica 13oz brillante o mate para exteriores, impresión 1440 DPI tintas UV / Solvente, bastilla perimetral termosellada y ojillos metálicos.',
    unitPrice: 180.00,
    unit: 'm²',
    minQuantity: 1,
    paperStock: 'Lona Frontlit 13oz blanca',
    suggestedFinishes: ['Bastilla Termosellada', 'Ojillos cada 50cm'],
    estimatedProductionDays: 1,
    tags: ['Exterior', 'Lonas', 'Eventos'],
    active: true,
    createdAt: '2023-10-04'
  },
  {
    id: 'prd_9',
    sku: 'PRD-GRN-002',
    name: 'Vinil Microperforado para Cristales',
    category: 'gran_formato',
    categoryLabel: 'Gran Formato',
    description: 'Vinil microperforado 60/40 para escaparates, ventanas y vehículos. Permite visión hacia afuera sin bloquear la luz.',
    unitPrice: 320.00,
    unit: 'm²',
    minQuantity: 1,
    paperStock: 'Vinil Microperforado 160g',
    suggestedFinishes: ['Corte a escuadra'],
    estimatedProductionDays: 2,
    tags: ['Fachadas', 'Vehicular'],
    active: true,
    createdAt: '2023-10-05'
  },
  {
    id: 'prd_10',
    sku: 'PRD-GRN-003',
    name: 'Roll Up Banner de Aluminio (85 x 200 cm)',
    category: 'gran_formato',
    categoryLabel: 'Gran Formato',
    description: 'Estructura retráctil de aluminio reforzado con lona blackout antirrulos 13oz impresa en alta definición + estuche de transporte acolchado.',
    unitPrice: 850.00,
    unit: 'pza',
    minQuantity: 1,
    paperStock: 'Lona Blackout Anticurling 13oz',
    suggestedFinishes: ['Montaje en estructura retráctil'],
    estimatedProductionDays: 1,
    tags: ['Expos', 'Punto de Venta', 'Portátil'],
    active: true,
    createdAt: '2023-10-05'
  },

  // Empaque y Cajas
  {
    id: 'prd_11',
    sku: 'PRD-EMP-001',
    name: 'Bolsas Stand-Up Pouch Kraft con Cierre Zipper',
    category: 'empaque',
    categoryLabel: 'Empaque',
    description: 'Bolsa pouch con barrera tricapa de aluminio grado alimenticio, fondo expandible, cierre zipper hermético y muesca abre-fácil.',
    unitPrice: 14.50,
    unit: 'pza',
    minQuantity: 300,
    paperStock: 'Papel Kraft 120g + Foil Aluminio + PE',
    suggestedFinishes: ['Válvula aromática', 'Zipper hermético'],
    estimatedProductionDays: 7,
    tags: ['Café', 'Alimentos', 'Empaque'],
    active: true,
    createdAt: '2023-10-06'
  },
  {
    id: 'prd_12',
    sku: 'PRD-EMP-002',
    name: 'Cajas de Envío Microcorrugado Personalizadas',
    category: 'empaque',
    categoryLabel: 'Empaque',
    description: 'Cajas autoarmables tipo correo (Mailer Box) en cartón microcorrugado flauta E kraft o blanco, impresión serigráfica o flexo a 1-2 tintas.',
    unitPrice: 22.00,
    unit: 'pza',
    minQuantity: 200,
    paperStock: 'Cartón Microcorrugado Flauta E',
    suggestedFinishes: ['Suajado autoarmable', 'Plecado'],
    estimatedProductionDays: 6,
    tags: ['E-commerce', 'Empaque'],
    active: true,
    createdAt: '2023-10-06'
  },

  // Pre-prensa & Acabados
  {
    id: 'prd_13',
    sku: 'PRD-SRV-001',
    name: 'Servicio de Vectorización & Adaptación de Arte',
    category: 'preprensa',
    categoryLabel: 'Pre-prensa',
    description: 'Trazo vectorial de logotipos, separación de tintas directas/Pantone, creación de capas de barniz UV o Foil y armado de suajes.',
    unitPrice: 350.00,
    unit: 'servicio',
    minQuantity: 1,
    estimatedProductionDays: 1,
    tags: ['Diseño', 'Servicios'],
    active: true,
    createdAt: '2023-10-07'
  },
  {
    id: 'prd_14',
    sku: 'PRD-ACB-001',
    name: 'Aplicación de Hot Stamping Metálico (Lote)',
    category: 'acabados',
    categoryLabel: 'Acabados',
    description: 'Estampado térmico en caliente con foil metálico (Oro, Plata, Cobre, Holográfico o Negro brillante) con grabado de magnesio de alta precisión.',
    unitPrice: 1200.00,
    unit: 'lote',
    minQuantity: 1,
    suggestedFinishes: ['Hot Stamping', 'Grabado de Magnesio'],
    estimatedProductionDays: 2,
    tags: ['Lujo', 'Acabados'],
    active: true,
    createdAt: '2023-10-07'
  }
];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_TIMELINE_EVENTS: Record<string, ClientTimelineEvent[]> = {};

export const INITIAL_QUOTES: Quote[] = [];

export const INITIAL_PRODUCTION_JOBS: ProductionJob[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

