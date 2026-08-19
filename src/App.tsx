import React, { useState, useEffect } from 'react';
import { 
  ViewType, 
  Client, 
  Quote, 
  ProductionJob, 
  ProductionStatus, 
  NotificationItem,
  Product,
  ClientTimelineEvent
} from './types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_TIMELINE_EVENTS, 
  INITIAL_QUOTES, 
  INITIAL_PRODUCTION_JOBS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_PRODUCTS
} from './data/mockData';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { AdminProfilesView } from './components/AdminProfilesView';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { QuoterView } from './components/QuoterView';
import { KanbanView } from './components/KanbanView';
import { CRMView } from './components/CRMView';
import { ProductsView } from './components/ProductsView';
import { formatMXN } from './utils/currencyUtils';
import { PdfExportModal } from './components/PdfExportModal';
import { SettingsModal } from './components/SettingsModal';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';
import { ShieldAlert, RotateCcw } from 'lucide-react';

function MainAppShell() {
  const { currentUser, userProfile, loading, activeRole, isSimulatingRole, setSimulatedRole, logout } = useAuth();
  
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [timelineEvents, setTimelineEvents] = useState<Record<string, ClientTimelineEvent[]>>(INITIAL_TIMELINE_EVENTS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [jobs, setJobs] = useState<ProductionJob[]>(INITIAL_PRODUCTION_JOBS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // UI states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pdfModalQuote, setPdfModalQuote] = useState<Quote | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync with Firestore if authenticated
  useEffect(() => {
    if (!currentUser) return;

    // Clients listener (real-time sync with /clients collection)
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const fetched: Client[] = [];
      snapshot.forEach((d) => fetched.push(d.data() as Client));
      setClients(fetched);
    }, (err) => console.warn("Clients sync:", err.message));

    // Quotes listener (reflects empty arrays if purged)
    const unsubQuotes = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      const fetched: Quote[] = [];
      snapshot.forEach((d) => fetched.push(d.data() as Quote));
      setQuotes(fetched);
      if (fetched.length > 0) {
        setCurrentQuote(fetched[0]);
      } else {
        setCurrentQuote(null);
      }
    }, (err) => console.warn("Quotes sync:", err.message));

    // Jobs listener (reflects empty arrays if purged)
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const fetched: ProductionJob[] = [];
      snapshot.forEach((d) => fetched.push(d.data() as ProductionJob));
      setJobs(fetched);
    }, (err) => console.warn("Jobs sync:", err.message));

    // Products listener
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fetched: Product[] = [];
      snapshot.forEach((d) => fetched.push(d.data() as Product));
      if (fetched.length > 0) {
        setProducts(fetched);
      }
    }, (err) => console.warn("Products sync:", err.message));

    // One-time check: clean up any legacy mock documents if present in Firestore
    const purgeLegacyMockDocs = async () => {
      try {
        const legacyQuoteIds = ['q1', 'q2'];
        for (const qid of legacyQuoteIds) {
          deleteDoc(doc(db, 'quotes', qid)).catch(() => {});
        }
        const legacyJobIds = ['j1', 'j2', 'j3', 'j4', 'j5', 'j6', 'j7'];
        for (const jid of legacyJobIds) {
          deleteDoc(doc(db, 'jobs', jid)).catch(() => {});
        }
        const legacyClientIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
        for (const cid of legacyClientIds) {
          deleteDoc(doc(db, 'clients', cid)).catch(() => {});
        }
      } catch (e) {}
    };
    purgeLegacyMockDocs();

    return () => {
      unsubClients();
      unsubQuotes();
      unsubJobs();
      unsubProducts();
    };
  }, [currentUser]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // If loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#100c08] flex items-center justify-center text-[#ffb1bf]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#8d153e] border-t-[#ffb1bf] rounded-full animate-spin" />
          <p className="font-headline text-sm font-semibold tracking-wide">Cargando La Chingonería Gráfica...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show Login Screen
  if (!currentUser && !userProfile) {
    return <LoginView />;
  }

  // Helper to generate sequential CHIN-XXXX codes
  const generateNextQuoteCode = (currentQuotes: Quote[]) => {
    const numbers = currentQuotes
      .map(q => {
        const match = q.code?.match(/CHIN-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n) && n > 0);

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1000;
    const nextNum = Math.max(1001, maxNum + 1);
    return `CHIN-${String(nextNum).padStart(4, '0')}`;
  };

  // Handler for creating a fresh new quote
  const handleCreateNewQuote = (presetClient?: Client) => {
    const nextCode = generateNextQuoteCode(quotes);
    const newQuote: Quote = {
      id: 'q_' + Date.now(),
      code: nextCode,
      clientId: presetClient?.id || '',
      clientName: presetClient?.name || '',
      contactEmail: presetClient?.email || '',
      contactPhone: presetClient?.phone || '',
      items: [
        {
          id: 'qi_' + Date.now(),
          category: 'etiquetas',
          categoryLabel: 'Etiquetas Personalizadas',
          description: 'Troquelado vinil mate 5x5cm',
          quantity: 1000,
          unitPrice: 2.50,
          total: 2500.00
        }
      ],
      subtotal: 2500.00,
      taxRate: 0.16,
      taxAmount: 400.00,
      total: 2900.00,
      validityDays: 15,
      commercialTerms: '50% Anticipo para inicio de producción. 50% Contra entrega. Tiempo estimado: 5-7 días hábiles tras visto bueno de arte.',
      status: 'DRAFT',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCurrentQuote(newQuote);
    setQuotes(prev => [newQuote, ...prev]);
    setCurrentView('quoter');

    // Persist to Firestore
    try {
      setDoc(doc(db, 'quotes', newQuote.id), newQuote).catch(() => {});
    } catch (e) {}
  };

  // Save quote handler
  const handleSaveQuote = (updatedQuote: Quote) => {
    setQuotes(prev => {
      const idx = prev.findIndex(q => q.id === updatedQuote.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedQuote;
        return next;
      }
      return [updatedQuote, ...prev];
    });
    setCurrentQuote(updatedQuote);

    // Save to Firestore
    try {
      setDoc(doc(db, 'quotes', updatedQuote.id), updatedQuote).catch(() => {});
    } catch (e) {}

    // If linked to a client, record event
    if (updatedQuote.clientId) {
      const newEvent = {
        id: 't_' + Date.now(),
        clientId: updatedQuote.clientId,
        title: 'Cotización Generada',
        type: 'quote_approved' as const,
        date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        code: updatedQuote.code,
        description: `Presupuesto de ${formatMXN(updatedQuote.total)} MXN generado (${updatedQuote.items.length} partidas).`
      };
      setTimelineEvents(prev => ({
        ...prev,
        [updatedQuote.clientId!]: [newEvent, ...(prev[updatedQuote.clientId!] || [])]
      }));
    }
  };

  // Delete quote handler
  const handleDeleteQuote = (quoteId: string) => {
    setQuotes(prev => prev.filter(q => q.id !== quoteId));
    try {
      deleteDoc(doc(db, 'quotes', quoteId)).catch(() => {});
    } catch (e) {}
  };

  // Update quote status directly
  const handleUpdateQuoteStatus = (quoteId: string, newStatus: Quote['status']) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, status: newStatus };
      }
      return q;
    }));

    try {
      updateDoc(doc(db, 'quotes', quoteId), { status: newStatus }).catch(() => {});
    } catch (e) {}
  };

  // Convert quote to production order
  const handleConvertToOrder = (quote: Quote) => {
    const orderNum = `#ORD-${Math.floor(8900 + Math.random() * 100)}`;
    const mainItem = quote.items[0]?.description || 'Producción Gráfica General';
    const mainCategory = quote.items[0]?.category === 'etiquetas' ? 'Etiquetas' : 'Papelería';
    const totalQty = quote.items.reduce((acc, it) => acc + (it.quantity || 0), 0) || 1000;

    const newJob: ProductionJob = {
      id: 'job_' + Date.now(),
      orderNumber: orderNum,
      clientId: quote.clientId,
      clientName: quote.clientName || 'Cliente General',
      projectName: `${mainItem} (${quote.items.length} partidas)`,
      category: mainCategory,
      categoryBadge: mainCategory,
      deliveryDate: '28 Oct, 2023',
      status: 'por_aprobar',
      progress: 10,
      quantity: totalQty,
      paperStock: quote.items[0]?.category === 'etiquetas' ? 'Vinil Autoadherible Blanco' : 'Couche 300g brillante',
      dimensions: 'Carta (21.5 x 28 cm)',
      machineAssigned: 'Prensa Heidelberg SM74',
      colorSpec: '4x4 CMYK',
      finishes: ['Refile a escuadra', 'Control de calidad'],
      prepressFile: `${mainItem.replace(/\s+/g, '_')}_Arte.pdf`,
      prepressApproved: false,
      operatorName: userProfile?.displayName || 'Taller LCG',
      assignees: [{ initials: 'AU', name: userProfile?.displayName || 'Admin User' }],
      totalAmount: quote.total,
      quoteCode: quote.code,
      createdAt: new Date().toISOString().split('T')[0],
      productionLog: [
        {
          date: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: `Orden creada automáticamente a partir de la Cotización ${quote.code}`,
          user: userProfile?.displayName || 'Administrador'
        }
      ]
    };

    setJobs(prev => [newJob, ...prev]);

    // Save to Firestore
    try {
      setDoc(doc(db, 'jobs', newJob.id), newJob).catch(() => {});
    } catch (e) {}

    // Add notification
    const newNotif: NotificationItem = {
      id: 'n_' + Date.now(),
      title: 'Nueva orden generada',
      message: `Cotización ${quote.code} convertida en orden ${orderNum} para ${quote.clientName}.`,
      time: 'Hace un momento',
      read: false,
      type: 'order',
      linkTarget: 'kanban'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Switch to Kanban view
    setCurrentView('kanban');
  };

  // Kanban update status
  const handleUpdateJobStatus = (jobId: string, newStatus: ProductionStatus) => {
    const newProgress = newStatus === 'finalizado' ? 100 : newStatus === 'impresion' ? 75 : newStatus === 'preprensa' ? 40 : 10;
    
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: newStatus,
          progress: newProgress
        };
      }
      return job;
    }));

    try {
      updateDoc(doc(db, 'jobs', jobId), {
        status: newStatus,
        progress: newProgress
      }).catch(() => {});
    } catch (e) {}
  };

  // Kanban add job
  const handleAddNewJob = (newJob: ProductionJob) => {
    setJobs(prev => [newJob, ...prev]);
    try {
      setDoc(doc(db, 'jobs', newJob.id), newJob).catch(() => {});
    } catch (e) {}
  };

  // Kanban delete job
  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    try {
      deleteDoc(doc(db, 'jobs', jobId)).catch(() => {});
    } catch (e) {}
  };

  // Client handlers
  const handleAddNewClient = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
    try {
      setDoc(doc(db, 'clients', newClient.id), newClient).catch(() => {});
    } catch (e) {}

    const welcomeEvent = {
      id: 't_' + Date.now(),
      clientId: newClient.id,
      title: 'Cliente Registrado',
      type: 'note' as const,
      date: 'Hoy',
      description: 'Cliente añadido al directorio comercial de La Chingonería Gráfica.'
    };
    setTimelineEvents(prev => ({
      ...prev,
      [newClient.id]: [welcomeEvent]
    }));
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    try {
      updateDoc(doc(db, 'clients', updatedClient.id), { ...updatedClient }).catch(() => {});
    } catch (e) {}
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    try {
      deleteDoc(doc(db, 'clients', clientId)).catch(() => {});
    } catch (e) {}
  };

  const handleNewQuoteForClient = (client: Client) => {
    handleCreateNewQuote(client);
  };

  // Product Catalog Handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    try {
      setDoc(doc(db, 'products', newProduct.id), newProduct).catch(() => {});
    } catch (e) {}
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    try {
      updateDoc(doc(db, 'products', updatedProduct.id), { ...updatedProduct }).catch(() => {});
    } catch (e) {}
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    try {
      deleteDoc(doc(db, 'products', productId)).catch(() => {});
    } catch (e) {}
  };

  const handleQuoteProduct = (product: Product) => {
    const newQuoteNum = Math.floor(100 + Math.random() * 900);
    const qty = product.minQuantity || 100;
    const desc = `${product.name} - ${product.description}${product.paperStock ? ` (Sustrato: ${product.paperStock})` : ''}`;
    const subtotal = qty * product.unitPrice;
    const taxAmount = subtotal * 0.16;

    const newQuote: Quote = {
      id: 'q_' + Date.now(),
      code: `QTE-2023-${newQuoteNum}`,
      clientId: '',
      clientName: '',
      contactEmail: '',
      contactPhone: '',
      items: [
        {
          id: 'qi_' + Date.now(),
          category: product.category,
          categoryLabel: product.categoryLabel || product.name,
          description: desc,
          quantity: qty,
          unitPrice: product.unitPrice,
          total: subtotal
        }
      ],
      subtotal: subtotal,
      taxRate: 0.16,
      taxAmount: taxAmount,
      total: subtotal + taxAmount,
      validityDays: 15,
      commercialTerms: '50% Anticipo para inicio de producción. 50% Contra entrega. Tiempo estimado: ' + (product.estimatedProductionDays || 3) + ' días hábiles tras visto bueno de arte.',
      status: 'DRAFT',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCurrentQuote(newQuote);
    setQuotes(prev => [newQuote, ...prev]);
    setCurrentView('quoter');

    try {
      setDoc(doc(db, 'quotes', newQuote.id), newQuote).catch(() => {});
    } catch (e) {}
  };

  // Purge quotes and production jobs to start fresh
  const handlePurgeAllQuotesAndOrders = async () => {
    setQuotes([]);
    setJobs([]);
    setCurrentQuote(null);
    setTimelineEvents({});
    setNotifications([]);

    try {
      const quotesSnap = await getDocs(collection(db, 'quotes'));
      const deleteQuotePromises = quotesSnap.docs.map(docSnap => deleteDoc(doc(db, 'quotes', docSnap.id)));
      
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      const deleteJobPromises = jobsSnap.docs.map(docSnap => deleteDoc(doc(db, 'jobs', docSnap.id)));

      await Promise.all([...deleteQuotePromises, ...deleteJobPromises]);
    } catch (e) {
      console.warn("Error purging quotes/jobs from Firestore:", e);
    }
  };

  // Purge all clients from Firestore
  const handlePurgeClients = async () => {
    setClients([]);
    try {
      const clientsSnap = await getDocs(collection(db, 'clients'));
      const deleteClientPromises = clientsSnap.docs.map(docSnap => deleteDoc(doc(db, 'clients', docSnap.id)));
      await Promise.all(deleteClientPromises);
    } catch (e) {
      console.warn("Error purging clients from Firestore:", e);
    }
  };

  // PDF modal handler
  const handleOpenPdfModal = (quote: Quote) => {
    setPdfModalQuote(quote);
    setIsPdfModalOpen(true);
  };

  return (
    <div className="bg-[#100c08] text-[#ebe1d9] font-sans min-h-screen flex selection:bg-[#8d153e] selection:text-white">
      {/* Side Navigation Bar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onNewQuoteClick={() => handleCreateNewQuote()}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen">
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          notifications={notifications}
          onMarkNotificationAsRead={(id) => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
          }}
          onMarkAllNotificationsAsRead={() => {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          }}
          clients={clients}
          jobs={jobs}
          quotes={quotes}
          onSelectClient={(client) => {
            setCurrentView('crm');
          }}
          onSelectJob={(job) => {
            setCurrentView('kanban');
          }}
          onSelectQuote={(quote) => {
            setCurrentQuote(quote);
            setCurrentView('quoter');
          }}
          onNavigate={(view) => setCurrentView(view)}
        />

        {/* Role Simulation Notification Banner */}
        {isSimulatingRole && (
          <div className="bg-[#8d153e]/30 border-b border-[#ffb1bf]/30 px-4 py-2 flex items-center justify-between text-xs text-[#ffb1bf]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ff9aaf]" />
              <span>
                <strong>Modo Vista Previa Activo:</strong> Estás explorando la interfaz con el rol de <strong className="uppercase font-mono">{activeRole}</strong>.
              </span>
            </div>
            <button
              onClick={() => setSimulatedRole(null)}
              className="flex items-center gap-1 bg-[#8d153e] hover:bg-[#a61c4b] text-white px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer a mi Rol</span>
            </button>
          </div>
        )}

        {/* View Switcher */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              jobs={jobs}
              quotes={quotes}
              clients={clients}
              onNewQuoteClick={() => handleCreateNewQuote()}
              onViewAllOrders={() => setCurrentView('kanban')}
              onSelectJob={(job) => {
                setCurrentView('kanban');
              }}
              onUpdateJobStatus={handleUpdateJobStatus}
            />
          )}

          {currentView === 'quoter' && (
            <QuoterView
              quotesList={quotes}
              clients={clients}
              products={products}
              onSaveQuote={handleSaveQuote}
              onDeleteQuote={handleDeleteQuote}
              onUpdateQuoteStatus={handleUpdateQuoteStatus}
              onConvertToOrder={handleConvertToOrder}
              onOpenPdfModal={handleOpenPdfModal}
              onCreateNewQuote={() => handleCreateNewQuote()}
            />
          )}

          {currentView === 'products' && (
            activeRole === 'admin' ? (
              <ProductsView
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onQuoteProduct={handleQuoteProduct}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
                <div className="w-16 h-16 rounded-2xl bg-[#8d153e]/20 border border-[#8d153e]/40 flex items-center justify-center mb-4 text-[#ffb1bf]">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-headline font-bold text-[#ebe1d9] mb-2">Acceso Restringido</h2>
                <p className="text-sm text-[#debfc3] max-w-md mb-6 leading-relaxed">
                  La administración del catálogo de productos y precios está reservada exclusivamente para usuarios con perfil de <strong>Administrador</strong>.
                </p>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-5 py-2.5 bg-[#8d153e] hover:bg-[#a61c4b] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Volver al Panel Principal
                </button>
              </div>
            )
          )}

          {currentView === 'kanban' && (
            <KanbanView
              jobs={jobs}
              onUpdateJobStatus={handleUpdateJobStatus}
              onAddNewJob={handleAddNewJob}
              onDeleteJob={handleDeleteJob}
            />
          )}

          {currentView === 'crm' && (
            <CRMView
              clients={clients}
              timelineEvents={timelineEvents}
              onAddNewClient={handleAddNewClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onNewQuoteForClient={handleNewQuoteForClient}
            />
          )}

          {currentView === 'profiles' && (
            <AdminProfilesView />
          )}
        </main>
      </div>

      {/* PDF Export Modal */}
      <PdfExportModal
        quote={pdfModalQuote}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onPurgeData={handlePurgeAllQuotesAndOrders}
        onPurgeClients={handlePurgeClients}
      />
    </div>
  );

}

export default function App() {
  return (
    <AuthProvider>
      <MainAppShell />
    </AuthProvider>
  );
}
