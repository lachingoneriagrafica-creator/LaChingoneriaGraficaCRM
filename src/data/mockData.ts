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

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Editorial Nocturna',
    contactPerson: 'Elena M.',
    email: 'elena@ednocturna.com',
    phone: '+52 55 1234 5678',
    rfc: 'ENO890412TK1',
    tags: ['VIP', 'CDMX', 'Editorial'],
    initials: 'EN',
    notes: 'Cliente preferencial. Crédito 15 días con orden de compra. Requiere pruebas impresas de color.',
    address: 'Av. Insurgentes Sur 1450, Col. Actipan, Benito Juárez, CDMX',
    createdAt: '2023-01-15'
  },
  {
    id: 'c2',
    name: 'Industrias XYZ',
    contactPerson: 'Roberto Carlos',
    email: 'rcarlos@ixyz.mx',
    phone: '+52 81 9876 5432',
    rfc: 'IXY120304PL9',
    tags: ['Industrial', 'Monterrey', 'Gran Volumen'],
    initials: 'IX',
    notes: 'Empaques de cartón corrugado y etiquetas de seguridad.',
    address: 'Parque Industrial Milimex, Apodaca, NL',
    createdAt: '2023-02-10'
  },
  {
    id: 'c3',
    name: 'Agencia Creativa Alma',
    contactPerson: 'Sofía Vergara',
    email: 'sofia@alma.agency',
    phone: '+52 33 4567 8901',
    rfc: 'ACA1806209J4',
    tags: ['Agencia', 'Guadalajara', 'Alta Prioridad'],
    initials: 'AC',
    notes: 'Proyectos de branding, tirajes cortos con acabados especiales (barniz a registro, foil dorado).',
    address: 'Av. Américas 1500, Providencia, Guadalajara, JAL',
    createdAt: '2023-03-05'
  },
  {
    id: 'c4',
    name: 'Cervecería Artesanal',
    contactPerson: 'Mateo Ruiz',
    email: 'mateo@cerveza.mx',
    phone: '+52 55 2233 4455',
    rfc: 'CAR200115HQ3',
    tags: ['Bebidas', 'Etiquetas', 'CDMX'],
    initials: 'CA',
    notes: 'Etiquetas resistentes a la humedad y refrigeración. Vinil adhesivo con laminado mate.',
    address: 'Col. Roma Norte, Cuauhtémoc, CDMX',
    createdAt: '2023-04-18'
  },
  {
    id: 'c5',
    name: 'Grupo Modelo S.A.B.',
    contactPerson: 'Lic. David Torres',
    email: 'procurement@gmodelo.com',
    phone: '+52 55 5262 1000',
    rfc: 'GMO010101XYZ',
    tags: ['Corporativo', 'VIP', 'Nacional'],
    initials: 'GM',
    notes: 'Portal B2B de compras con cotizaciones estandarizadas y portal de facturación.',
    address: 'Cerrada de Palomas 22, Lomas de Chapultepec, CDMX',
    createdAt: '2023-05-01'
  },
  {
    id: 'c6',
    name: 'TechStart Inc.',
    contactPerson: 'Laura Sánchez',
    email: 'laura@techstart.io',
    phone: '+52 55 9088 7766',
    rfc: 'TSI220808MM1',
    tags: ['Startups', 'CDMX'],
    initials: 'TS',
    notes: 'Kits de bienvenida, libretas grabadas en serigrafía, stickers y swag corporativo.',
    address: 'Paseo de la Reforma 250, Juárez, CDMX',
    createdAt: '2023-06-12'
  }
];

export const INITIAL_TIMELINE_EVENTS: Record<string, ClientTimelineEvent[]> = {
  c1: [
    {
      id: 't1',
      clientId: 'c1',
      title: 'Orden Completada',
      type: 'order_completed',
      date: 'Hoy, 10:30',
      code: 'ORD-2023-089',
      description: '500 Brochures corporativos, acabado mate y dobleces perfectos.'
    },
    {
      id: 't2',
      clientId: 'c1',
      title: 'Cotización Aprobada',
      type: 'quote_approved',
      date: 'Ayer, 16:45',
      code: 'COT-2023-142',
      description: 'Aprobado formalmente por Elena M. con orden de compra enviada.'
    },
    {
      id: 't3',
      clientId: 'c1',
      title: 'Archivo Recibido',
      type: 'file_received',
      date: 'Hace 3 días',
      description: 'Archivos en alta resolución recibidos en servidor FTP.',
      fileAttachment: {
        name: 'Brochure_VFinal_Alta.pdf',
        size: '24.5 MB',
        type: 'PDF'
      }
    }
  ],
  c2: [
    {
      id: 't4',
      clientId: 'c2',
      title: 'Cotización Solicitada',
      type: 'quote_approved',
      date: 'Hace 2 días',
      code: 'COT-2023-145',
      description: '10,000 Cajas corrugadas con impresión flexográfica a 2 tintas.'
    }
  ],
  c3: [
    {
      id: 't5',
      clientId: 'c3',
      title: 'Orden en Impresión',
      type: 'order_completed',
      date: 'Hoy, 09:15',
      code: 'ORD-8902',
      description: 'Catálogos Corporativos (x500) en prensa Heidelberg Speedmaster.'
    }
  ]
};

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'q1',
    code: 'CHIN-1001',
    clientId: 'c5',
    clientName: 'Grupo Modelo S.A.B.',
    contactEmail: 'procurement@gmodelo.com',
    contactPhone: '+52 55 5262 1000',
    items: [
      {
        id: 'qi1',
        category: 'etiquetas',
        categoryLabel: 'Etiquetas Personalizadas',
        description: 'Troquelado vinil mate 5x5cm',
        quantity: 5000,
        unitPrice: 2.50,
        total: 12500.00
      },
      {
        id: 'qi2',
        category: 'papeleria',
        categoryLabel: 'Papelería Institucional',
        description: 'Tarjetas de presentación 4x4, laminado soft touch',
        quantity: 1000,
        unitPrice: 1.20,
        total: 1200.00
      }
    ],
    subtotal: 13700.00,
    taxRate: 0.16,
    taxAmount: 2192.00,
    total: 15892.00,
    validityDays: 15,
    commercialTerms: '50% Anticipo para inicio de producción. 50% Contra entrega. Tiempo estimado: 5-7 días hábiles tras visto bueno de arte.',
    status: 'DRAFT',
    createdAt: '2023-10-23'
  },
  {
    id: 'q2',
    code: 'CHIN-1002',
    clientId: 'c1',
    clientName: 'Editorial Nocturna',
    contactEmail: 'elena@ednocturna.com',
    items: [
      {
        id: 'qi3',
        category: 'papeleria',
        categoryLabel: 'Papelería Institucional',
        description: 'Brochures corporativos 16pp couche 200g',
        quantity: 500,
        unitPrice: 18.50,
        total: 9250.00
      }
    ],
    subtotal: 9250.00,
    taxRate: 0.16,
    taxAmount: 1480.00,
    total: 10730.00,
    validityDays: 15,
    commercialTerms: 'Crédito a 15 días tras entrega. Facturación automática.',
    status: 'APPROVED',
    createdAt: '2023-10-22'
  }
];

export const INITIAL_PRODUCTION_JOBS: ProductionJob[] = [
  {
    id: 'j1',
    orderNumber: '#ORD-8902',
    quoteCode: 'CHIN-1001',
    clientId: 'c3',
    clientName: 'Agencia Creativa MX',
    projectName: 'Catálogos Corporativos (x500)',
    category: 'Papelería',
    categoryBadge: 'Papelería',
    deliveryDate: '24 Oct, 2023',
    status: 'impresion',
    progress: 75,
    isUrgent: true,
    quantity: 500,
    paperStock: 'Interiores: Couche 150g brillante | Portada: Sulfatada 12pts 1 cara',
    dimensions: 'Carta cerrado (21.5 x 28 cm) | Extendido (43 x 28 cm) - 24 páginas',
    machineAssigned: 'Prensa Heidelberg Speedmaster SM74 (4 Colores)',
    colorSpec: '4x4 CMYK Portadas e Interiores',
    finishes: ['Laminado Mate Soft-Touch en portada', 'Barniz a Registro UV en logotipo', 'Grapa a caballo (2 grapas omega)', 'Desbaste y refile'],
    prepressFile: 'Catalogos_AgenciaMX_Rev4_Curvas.pdf',
    prepressApproved: true,
    operatorName: 'Juan Díaz (Prensa 1)',
    priority: 'urgente',
    contactPhone: '+52 55 9876 5432',
    contactEmail: 'contacto@agenciacreativa.mx',
    deliveryAddress: 'Av. Insurgentes Sur 1602, Piso 4, Benito Juárez, CDMX',
    technicalNotes: 'Cuidar registro de barniz UV en portada oscura. Empacar en cajas de 50 piezas con separador de papel bond para evitar pegado.',
    productionLog: [
      { date: '2023-10-20 09:30', message: 'Orden ingresada desde cotización CHIN-1001', user: 'Admin' },
      { date: '2023-10-20 14:15', message: 'Visto Bueno de preprensa y CTP autorizado', user: 'Tomás Bravo' },
      { date: '2023-10-21 11:00', message: 'Tiraje de pliegos al 75% en Speedmaster', user: 'Juan Díaz' }
    ],
    assignees: [
      { initials: 'JD', name: 'Juan Díaz' },
      { initials: 'AL', name: 'Andrea López' }
    ],
    totalAmount: 18500,
    createdAt: '2023-10-20'
  },
  {
    id: 'j2',
    orderNumber: '#ORD-8901',
    quoteCode: 'CHIN-1003',
    clientId: 'c4',
    clientName: 'Restaurante El Rincón',
    projectName: 'Menús Laminados Gruesos (x50)',
    category: 'Papelería',
    categoryBadge: 'Papelería',
    deliveryDate: '25 Oct, 2023',
    status: 'preprensa',
    progress: 40,
    quantity: 50,
    paperStock: 'Cartulina Sulfatada 18pts 2 caras',
    dimensions: 'Tabloide rebasado 30 x 45 cm (Díptico)',
    machineAssigned: 'Prensa Digital Konica Minolta AccurioPress C4080',
    colorSpec: '4x4 CMYK Alta Saturación Fotográfica',
    finishes: ['Laminado Poliéster Térmico 10 milésimas (Grado Restaurante)', 'Plecado central de alto impacto', 'Boleado de 4 esquinas radio 5mm'],
    prepressFile: 'Menus_Rincon_Oct2023_Final.ai',
    prepressApproved: false,
    operatorName: 'Tomás Bravo (Pre-prensa)',
    priority: 'alta',
    contactPhone: '+52 55 4567 8901',
    contactEmail: 'gerencia@elrinconrestaurante.com',
    deliveryAddress: 'Calle Durango 185, Col. Roma Norte, Cuauhtémoc, CDMX',
    technicalNotes: 'Asegurar sellado de orillas de poliéster para resistencia a líquidos.',
    productionLog: [
      { date: '2023-10-21 10:00', message: 'Orden generada', user: 'Gerente' },
      { date: '2023-10-21 15:30', message: 'Ajuste de rebase y línea de plecado en pre-prensa', user: 'Tomás Bravo' }
    ],
    assignees: [
      { initials: 'TB', name: 'Tomás Bravo' }
    ],
    totalAmount: 4200,
    createdAt: '2023-10-21'
  },
  {
    id: 'j3',
    orderNumber: '#ORD-8899',
    clientId: 'c6',
    clientName: 'TechStart Inc.',
    projectName: 'Tarjetas de Presentación (x1000)',
    category: 'Papelería',
    categoryBadge: 'Papelería',
    deliveryDate: '22 Oct, 2023',
    status: 'finalizado',
    progress: 100,
    quantity: 1000,
    paperStock: 'Couche 350g mate importado',
    dimensions: '9.0 x 5.0 cm estándar',
    machineAssigned: 'Prensa Digital Indigo / C4080',
    colorSpec: '4x4 CMYK + Hot Stamping Oro Holográfico',
    finishes: ['Laminado Mate Soft-touch 2 caras', 'Hot Stamping Oro en isotipo', 'Corte a registro perfecto'],
    prepressFile: 'Tarjetas_TechStart_Gold_v2.pdf',
    prepressApproved: true,
    operatorName: 'Mateo Ramos (Acabados)',
    priority: 'normal',
    contactPhone: '+52 55 7890 1234',
    contactEmail: 'rh@techstart.io',
    deliveryAddress: 'Paseo de la Reforma 222, Piso 18, Juárez, CDMX',
    technicalNotes: 'Entregado con satisfacción del cliente.',
    productionLog: [
      { date: '2023-10-18 11:00', message: 'Orden registrada', user: 'Admin' },
      { date: '2023-10-19 14:00', message: 'Impresión y laminado completados', user: 'Andrea López' },
      { date: '2023-10-20 16:30', message: 'Hot Stamping aplicado y corte final', user: 'Mateo Ramos' },
      { date: '2023-10-22 10:00', message: 'Paquete entregado a mensajería', user: 'Admin' }
    ],
    assignees: [
      { initials: 'MR', name: 'Mateo Ramos' }
    ],
    totalAmount: 2800,
    createdAt: '2023-10-18'
  },
  {
    id: 'j4',
    orderNumber: '#ORD-8898',
    clientId: 'c4',
    clientName: 'Boutique Local',
    projectName: 'Etiquetas de Producto (x5000)',
    category: 'Etiquetas',
    categoryBadge: 'Etiquetas',
    deliveryDate: '28 Oct, 2023',
    status: 'en_cola',
    progress: 10,
    quantity: 5000,
    paperStock: 'Vinil Autoadherible Blanco Mate con adhesivo reforzado',
    dimensions: '6.5 x 6.5 cm forma circular',
    machineAssigned: 'Plotter Roland VersaCAMM / Mimaki UV',
    colorSpec: '4x0 CMYK Tintas Eco-Solventes resistentes a intemperie',
    finishes: ['Troquelado / Medio corte a registro (Kiss-cut)', 'Entregado en rollos de 1,000 etiquetas'],
    prepressFile: 'Etiquetas_Boutique_Oct2023.ai',
    prepressApproved: true,
    operatorName: 'Juan Díaz (Gran Formato/Viniles)',
    priority: 'normal',
    contactPhone: '+52 55 3344 5566',
    contactEmail: 'boutique@estilo.mx',
    deliveryAddress: 'Av. Mazatlán 45, Condesa, CDMX',
    technicalNotes: 'Verificar que la cuchilla de corte no perfore el liner base.',
    productionLog: [
      { date: '2023-10-22 16:00', message: 'Orden en cola de impresión de rollos', user: 'Admin' }
    ],
    assignees: [
      { initials: 'JD', name: 'Juan Díaz' }
    ],
    totalAmount: 7600,
    createdAt: '2023-10-22'
  },
  {
    id: 'j5',
    orderNumber: '#ORD-8890',
    clientName: 'Acme Corp Branding',
    projectName: '500 Business Cards, 100 Letterheads',
    category: 'Papelería',
    categoryBadge: 'Papelería',
    deliveryDate: '24 Oct',
    status: 'por_aprobar',
    quantity: 600,
    paperStock: 'Bond 90g Optik White + Couche 300g Mate',
    dimensions: 'Carta 21.5 x 28 cm y Tarjetas 9 x 5 cm',
    machineAssigned: 'Konica Minolta C4080',
    colorSpec: 'Pantone 286C Azul + Negro',
    finishes: ['Refile a escuadra'],
    prepressFile: 'Acme_Stationery_v1.pdf',
    prepressApproved: false,
    operatorName: 'Por Asignar',
    priority: 'normal',
    contactPhone: '+52 55 1122 3344',
    contactEmail: 'brand@acmecorp.com',
    deliveryAddress: 'Torre Mayor, CDMX',
    technicalNotes: 'Esperando confirmación final del cliente sobre tono Pantone.',
    assignees: [
      { initials: 'JD', name: 'Juan Díaz' }
    ],
    totalAmount: 5100,
    createdAt: '2023-10-21'
  },
  {
    id: 'j6',
    orderNumber: '#ORD-8885',
    clientName: 'Boutique Coffee Co',
    projectName: '1000 Custom Coffee Bags',
    category: 'Empaque',
    categoryBadge: 'Empaque',
    deliveryDate: '20 Oct',
    status: 'por_aprobar',
    isDelayed: true,
    delayedText: 'Atrasado (20 Oct)',
    quantity: 1000,
    paperStock: 'Papel Kraft 120g trilaminado con barrera de aluminio y válvula desgasificadora',
    dimensions: 'Bolsa Stand-up Pouch 250g (13 x 20 + 7 cm fuelle)',
    machineAssigned: 'Flexografía / Rotograbado Digital',
    colorSpec: '3 Tintas directas (Blanco, Negro, Bronce)',
    finishes: ['Válvula aromática termosellada', 'Cierre zipper hermético', 'Muesca de abrefácil'],
    prepressFile: 'CoffeeBag_Kraft_v5.pdf',
    prepressApproved: true,
    operatorName: 'Mateo Ramos',
    priority: 'urgente',
    contactPhone: '+52 55 9988 7766',
    contactEmail: 'tueste@boutiquecoffee.mx',
    deliveryAddress: 'Col. Juárez, CDMX',
    technicalNotes: 'URGENTE: Requiere despacho prioritario por retraso de materia prima.',
    assignees: [
      { initials: 'MR', name: 'Mateo Ramos' }
    ],
    totalAmount: 14500,
    createdAt: '2023-10-15'
  },
  {
    id: 'j7',
    orderNumber: '#ORD-8877',
    clientName: 'Artisan Brewery',
    projectName: 'Die-cut Beer Labels (CMYK + Foil)',
    category: 'Etiquetas',
    categoryBadge: 'Etiquetas',
    deliveryDate: '26 Oct',
    status: 'preprensa',
    progress: 60,
    quantity: 8000,
    paperStock: 'Polipropileno Metalizado Plata Autoadherible',
    dimensions: '18 x 9 cm envolvente para botella 355ml',
    machineAssigned: 'Prensa Flexográfica / Indigo WS6800',
    colorSpec: 'CMYK + Tinta Blanca de Reserva',
    finishes: ['Barniz UV mate de sobreimpresión', 'Foil plata brillante reservado', 'Troquel semicilíndrico'],
    prepressFile: 'BeerLabels_Artisan_Stout_Final.pdf',
    prepressApproved: true,
    operatorName: 'Tomás Bravo',
    priority: 'alta',
    contactPhone: '+52 55 2233 4455',
    contactEmail: 'master@artisanbrewery.mx',
    deliveryAddress: 'Planta Cervecería, Tlalnepantla, Edo Mex',
    technicalNotes: 'Revisar opacidad de la capa blanca bajo el texto negro.',
    assignees: [
      { initials: 'AL', name: 'Andrea López' },
      { initials: 'TB', name: 'Tomás Bravo' }
    ],
    totalAmount: 9800,
    createdAt: '2023-10-19'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Nueva orden en prensa',
    message: 'Tech Summit 2024 ha iniciado producción en plotter Mimaki.',
    time: 'Hace 10 min',
    read: false,
    type: 'order',
    linkTarget: 'kanban'
  },
  {
    id: 'n2',
    title: 'Cotización aprobada',
    message: 'Elena M. (Editorial Nocturna) aprobó COT-2023-142.',
    time: 'Hace 45 min',
    read: false,
    type: 'quote',
    linkTarget: 'crm'
  },
  {
    id: 'n3',
    title: 'Alerta de entrega atrasada',
    message: 'Boutique Coffee Co requiere revisión de fecha de entrega.',
    time: 'Hace 2 horas',
    read: false,
    type: 'alert',
    linkTarget: 'kanban'
  },
  {
    id: 'n4',
    title: 'Archivo recibido',
    message: 'Brochure_VFinal_Alta.pdf validado por RIP sin errores de fuentes.',
    time: 'Ayer',
    read: true,
    type: 'system',
    linkTarget: 'crm'
  }
];
