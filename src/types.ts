export type ViewType = 'dashboard' | 'quoter' | 'kanban' | 'crm' | 'profiles' | 'products' | 'settings';

export type UserRole = 'admin' | 'gerente' | 'disenador' | 'produccion';

export interface UserPermissions {
  canManageUsers: boolean;
  canManageClients: boolean;
  canCreateQuotes: boolean;
  canViewFinancials: boolean;
  canManageProduction: boolean;
  canDeleteRecords: boolean;
  canEditSettings: boolean;
}

export interface Product {
  id: string;
  sku: string; // e.g. "PRD-PAP-001"
  name: string; // e.g. "Folletos Trípticos Couche 150g"
  category: 'papeleria' | 'etiquetas' | 'gran_formato' | 'empaque' | 'offset' | 'acabados' | 'preprensa';
  categoryLabel?: string;
  description: string;
  unitPrice: number;
  unit: string; // e.g. "pza", "millar", "paquete 100", "m²", "rollo", "servicio"
  minQuantity: number;
  paperStock?: string; // Papel / Sustrato recomendado
  suggestedFinishes?: string[]; // Acabados sugeridos
  estimatedProductionDays?: number;
  tags?: string[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: 'active' | 'pending' | 'disabled';
  permissions: UserPermissions;
  phone?: string;
  department?: string;
  createdAt?: string;
  lastLogin?: string;
}

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canManageUsers: true,
    canManageClients: true,
    canCreateQuotes: true,
    canViewFinancials: true,
    canManageProduction: true,
    canDeleteRecords: true,
    canEditSettings: true,
  },
  gerente: {
    canManageUsers: false,
    canManageClients: true,
    canCreateQuotes: true,
    canViewFinancials: true,
    canManageProduction: true,
    canDeleteRecords: false,
    canEditSettings: false,
  },
  disenador: {
    canManageUsers: false,
    canManageClients: false,
    canCreateQuotes: false,
    canViewFinancials: false,
    canManageProduction: true,
    canDeleteRecords: false,
    canEditSettings: false,
  },
  produccion: {
    canManageUsers: false,
    canManageClients: false,
    canCreateQuotes: false,
    canViewFinancials: false,
    canManageProduction: true,
    canDeleteRecords: false,
    canEditSettings: false,
  },
};

export interface Client {
  id: string;
  name: string; // Empresa
  contactPerson: string; // Contacto
  email: string;
  phone: string;
  rfc?: string;
  notes?: string;
  tags?: string[];
  avatarText?: string;
  initials?: string;
  address?: string;
  createdAt: string;
}

export interface ClientTimelineEvent {
  id: string;
  clientId: string;
  title: string;
  type: 'order_completed' | 'quote_approved' | 'file_received' | 'note' | 'invoice';
  date: string;
  code?: string;
  description: string;
  fileAttachment?: {
    name: string;
    size?: string;
    type?: string;
  };
}

export interface QuoteItem {
  id: string;
  category: 'etiquetas' | 'papeleria' | 'preprensa' | 'gran_formato' | 'empaque' | 'offset' | 'acabados';
  categoryLabel?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  code: string; // e.g. CHIN-1001
  clientId?: string;
  clientName: string;
  contactEmail: string;
  contactPhone?: string;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.16
  taxAmount: number;
  total: number;
  validityDays: number;
  commercialTerms: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'CONVERTED' | 'REJECTED';
  createdAt: string;
}

export type ProductionStatus = 'por_aprobar' | 'preprensa' | 'impresion' | 'finalizado' | 'en_cola';

export interface ProductionJob {
  id: string;
  orderNumber: string; // e.g. #ORD-8902
  clientId?: string;
  clientName: string;
  projectName: string;
  category: string;
  categoryBadge: string;
  deliveryDate: string;
  status: ProductionStatus;
  progress?: number; // 0 to 100
  isUrgent?: boolean;
  isDelayed?: boolean;
  delayedText?: string;
  assignees: {
    initials: string;
    name: string;
    avatarUrl?: string;
  }[];
  notes?: string;
  totalAmount?: number;
  quoteCode?: string;
  createdAt: string;

  // Technical specifications for Orden de Trabajo
  quantity?: number;
  paperStock?: string; // Sustrato / Papel (e.g. Couche 300g, Sulfatada 14pts)
  dimensions?: string; // Medidas (e.g. 21.5 x 28 cm)
  machineAssigned?: string; // Máquina / Prensa (e.g. Heidelberg Speedmaster 4C)
  colorSpec?: string; // Tintas (e.g. 4x4 CMYK, 4x0 CMYK)
  finishes?: string[]; // Acabados (e.g. Laminado mate, Barniz UV, Suaje)
  prepressFile?: string; // Archivo de arte (e.g. Arte_v3_curvas.pdf)
  prepressApproved?: boolean;
  operatorName?: string;
  priority?: 'normal' | 'alta' | 'urgente';
  contactPhone?: string;
  contactEmail?: string;
  deliveryAddress?: string;
  technicalNotes?: string;
  productionLog?: {
    date: string;
    message: string;
    user: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'quote' | 'alert' | 'system';
  linkTarget?: ViewType;
}
