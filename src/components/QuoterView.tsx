import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Edit3, 
  FileDown, 
  CheckSquare, 
  Copy, 
  CheckCircle2, 
  LayoutGrid, 
  List, 
  DollarSign, 
  Building, 
  Calendar, 
  ArrowUpDown, 
  AlertTriangle,
  Sparkles,
  Boxes,
  Clock,
  Send,
  Eye
} from 'lucide-react';
import { Quote, Client, Product } from '../types';
import { QuoteEditorModal } from './QuoteEditorModal';
import { QuoteStatusDropdown } from './QuoteStatusDropdown';

interface QuoterViewProps {
  quotesList: Quote[];
  clients: Client[];
  products: Product[];
  onSaveQuote: (quote: Quote) => void;
  onDeleteQuote: (quoteId: string) => void;
  onUpdateQuoteStatus: (quoteId: string, status: Quote['status']) => void;
  onConvertToOrder: (quote: Quote) => void;
  onOpenPdfModal: (quote: Quote) => void;
  onCreateNewQuote?: () => void;
}

export const QuoterView: React.FC<QuoterViewProps> = ({
  quotesList,
  clients,
  products,
  onSaveQuote,
  onDeleteQuote,
  onUpdateQuoteStatus,
  onConvertToOrder,
  onOpenPdfModal,
  onCreateNewQuote
}) => {
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SENT' | 'APPROVED' | 'CONVERTED'>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'total_desc' | 'total_asc' | 'client'>('date_desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal states
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [selectedQuoteForEdit, setSelectedQuoteForEdit] = useState<Quote | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Delete confirmation modal state
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Summary Metrics calculations
  const totalQuotesCount = quotesList.length;
  const totalAmount = quotesList.reduce((acc, q) => acc + (q.total || 0), 0);
  
  const draftQuotes = quotesList.filter(q => q.status === 'DRAFT');
  const draftTotal = draftQuotes.reduce((acc, q) => acc + (q.total || 0), 0);

  const sentQuotes = quotesList.filter(q => q.status === 'SENT');
  const sentTotal = sentQuotes.reduce((acc, q) => acc + (q.total || 0), 0);

  const approvedQuotes = quotesList.filter(q => q.status === 'APPROVED' || q.status === 'CONVERTED');
  const approvedTotal = approvedQuotes.reduce((acc, q) => acc + (q.total || 0), 0);

  // Filtered & Sorted Quotes
  const filteredQuotes = useMemo(() => {
    return quotesList.filter(quote => {
      const qLower = searchQuery.toLowerCase();
      const matchesSearch = 
        quote.code.toLowerCase().includes(qLower) ||
        quote.clientName.toLowerCase().includes(qLower) ||
        (quote.contactEmail && quote.contactEmail.toLowerCase().includes(qLower)) ||
        quote.items.some(it => it.description.toLowerCase().includes(qLower) || (it.categoryLabel && it.categoryLabel.toLowerCase().includes(qLower)));

      if (statusFilter === 'ALL') return matchesSearch;
      return matchesSearch && quote.status === statusFilter;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return (b.createdAt || '').localeCompare(a.createdAt || '');
      if (sortBy === 'date_asc') return (a.createdAt || '').localeCompare(b.createdAt || '');
      if (sortBy === 'total_desc') return (b.total || 0) - (a.total || 0);
      if (sortBy === 'total_asc') return (a.total || 0) - (b.total || 0);
      if (sortBy === 'client') return a.clientName.localeCompare(b.clientName);
      return 0;
    });
  }, [quotesList, searchQuery, statusFilter, sortBy]);

  // Handler for creating a fresh new quote in the floating window
  const handleOpenCreateNew = () => {
    const existingNumbers = quotesList
      .map(q => {
        const match = q.code?.match(/CHIN-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n) && n > 0);

    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 1000;
    const nextNum = Math.max(1001, maxNum + 1);
    const nextCode = `CHIN-${String(nextNum).padStart(4, '0')}`;

    const newQuote: Quote = {
      id: 'q_' + Date.now(),
      code: nextCode,
      clientId: '',
      clientName: '',
      contactEmail: '',
      contactPhone: '',
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

    setSelectedQuoteForEdit(newQuote);
    setIsCreatingNew(true);
    setIsEditorModalOpen(true);
  };

  // Handler for editing an existing quote
  const handleOpenEditQuote = (quote: Quote) => {
    setSelectedQuoteForEdit(quote);
    setIsCreatingNew(false);
    setIsEditorModalOpen(true);
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const confirmDelete = () => {
    if (quoteToDelete) {
      onDeleteQuote(quoteToDelete.id);
      setQuoteToDelete(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#8d153e] flex items-center justify-center text-white shadow-md border border-[#ffb1bf]/30">
                <FileText className="w-4 h-4 text-[#ff9aaf]" />
              </div>
              <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#ebe1d9]">
                Cotizaciones Comerciales
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2a241e] text-[#ffb1bf] border border-white/10">
                {totalQuotesCount} presupuestos
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#debfc3]">
              Administra tus cotizaciones, actualiza estados al instante y genera presupuestos en ventana flotante.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateNew}
              className="px-4 py-2.5 bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[#8d153e]/20 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#ff9aaf]" />
              <span>Nueva Cotización</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Total */}
          <div className="bg-[#1f1b16] p-4 rounded-xl border border-white/5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2a241e] flex items-center justify-center text-[#ffb1bf] border border-white/5">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[#debfc3] uppercase tracking-wider">Total Presupuestado</div>
              <div className="text-lg font-headline font-bold text-white truncate">
                ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-[#debfc3]">{totalQuotesCount} cotizaciones</div>
            </div>
          </div>

          {/* Aprobadas */}
          <div className="bg-[#1f1b16] p-4 rounded-xl border border-white/5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/40 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Aprobadas</div>
              <div className="text-lg font-headline font-bold text-white truncate">
                ${approvedTotal.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-emerald-400/80">{approvedQuotes.length} aceptadas</div>
            </div>
          </div>

          {/* Enviadas */}
          <div className="bg-[#1f1b16] p-4 rounded-xl border border-white/5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-950/40 flex items-center justify-center text-sky-400 border border-sky-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Enviadas</div>
              <div className="text-lg font-headline font-bold text-white truncate">
                ${sentTotal.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-sky-400/80">{sentQuotes.length} en revisión</div>
            </div>
          </div>

          {/* Borradores */}
          <div className="bg-[#1f1b16] p-4 rounded-xl border border-white/5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/40 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Borradores</div>
              <div className="text-lg font-headline font-bold text-white truncate">
                ${draftTotal.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-amber-400/80">{draftQuotes.length} pendientes</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#191511] p-3 sm:p-4 rounded-xl border border-white/5 shadow-md flex flex-col lg:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-[#debfc3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, cliente o partida..."
              className="w-full bg-[#241f1a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-[#ebe1d9] placeholder-[#8a7f76] outline-none focus:border-[#ffb1bf]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#debfc3] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Tabs & Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Status Filter Buttons */}
            <div className="flex items-center bg-[#241f1a] p-1 rounded-lg border border-white/5 overflow-x-auto text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-[#8d153e] text-white' : 'text-[#debfc3] hover:text-white'
                }`}
              >
                Todas ({quotesList.length})
              </button>
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'DRAFT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-[#debfc3] hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Borrador</span>
              </button>
              <button
                onClick={() => setStatusFilter('SENT')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'SENT' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-[#debfc3] hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Enviada</span>
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-[#debfc3] hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Aprobada</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#241f1a] px-2.5 py-1.5 rounded-lg border border-white/5 text-xs text-[#debfc3]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#ffb1bf]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Ordenar cotizaciones"
                className="bg-transparent text-xs text-[#ebe1d9] outline-none cursor-pointer"
              >
                <option value="date_desc" className="bg-[#241f1a]">Más recientes</option>
                <option value="date_asc" className="bg-[#241f1a]">Más antiguas</option>
                <option value="total_desc" className="bg-[#241f1a]">Mayor importe</option>
                <option value="total_asc" className="bg-[#241f1a]">Menor importe</option>
                <option value="client" className="bg-[#241f1a]">Cliente (A-Z)</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#241f1a] p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setViewMode('table')}
                title="Vista de Tabla"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#8d153e] text-white' : 'text-[#debfc3] hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Vista de Tarjetas"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-[#8d153e] text-white' : 'text-[#debfc3] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Quotes Display Area */}
        {filteredQuotes.length === 0 ? (
          <div className="bg-[#191511] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#8d153e]/20 border border-[#8d153e]/30 flex items-center justify-center text-[#ffb1bf] mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-headline font-bold text-lg text-white mb-1">
              No se encontraron cotizaciones
            </h3>
            <p className="text-xs text-[#debfc3] max-w-md mb-5">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No hay registros que coincidan con los filtros aplicados. Intenta restablecer la búsqueda.'
                : 'Aún no tienes cotizaciones creadas. Genera un nuevo presupuesto para tus clientes con el botón flotante.'}
            </p>
            <button
              onClick={handleOpenCreateNew}
              className="px-4 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#ff9aaf]" />
              <span>Crear Nueva Cotización</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-[#191511] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#201b16] text-[11px] font-bold text-[#debfc3] uppercase tracking-wider">
                    <th className="py-3 px-4">Código / Fecha</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Partidas / Resumen</th>
                    <th className="py-3 px-4 text-right">Total ($ MXN)</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredQuotes.map((quote) => {
                    const firstItem = quote.items[0];
                    const itemsSummary = firstItem 
                      ? `${firstItem.description}${quote.items.length > 1 ? ` (+${quote.items.length - 1} más)` : ''}`
                      : 'Sin partidas';

                    return (
                      <tr 
                        key={quote.id} 
                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => handleOpenEditQuote(quote)}
                      >
                        {/* Code & Date */}
                        <td className="py-3 px-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#ffb1bf]">
                              {quote.code}
                            </span>
                            <button
                              onClick={(e) => handleCopyCode(quote.code, e)}
                              title="Copiar código"
                              className="text-[#8a7f76] hover:text-[#ffb1bf] transition-colors p-1 cursor-pointer"
                            >
                              {copiedCode === quote.code ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-[#8a7f76] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{quote.createdAt}</span>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="py-3 px-4 align-middle">
                          <div className="font-semibold text-white text-xs">
                            {quote.clientName || 'Cliente General'}
                          </div>
                          {quote.contactEmail && (
                            <div className="text-[11px] text-[#debfc3] truncate max-w-[200px]">
                              {quote.contactEmail}
                            </div>
                          )}
                        </td>

                        {/* Items Preview */}
                        <td className="py-3 px-4 align-middle">
                          <div className="text-xs text-[#ebe1d9] truncate max-w-[260px]" title={itemsSummary}>
                            {itemsSummary}
                          </div>
                          <div className="text-[10px] text-[#8a7f76] mt-0.5">
                            {quote.items.length} {quote.items.length === 1 ? 'partida' : 'partidas'} • {quote.items.reduce((acc, it) => acc + (it.quantity || 0), 0).toLocaleString()} uds.
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3 px-4 align-middle text-right font-mono">
                          <div className="font-bold text-sm text-white">
                            ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-[#8a7f76]">
                            Subtotal: ${quote.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3 px-4 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                          <QuoteStatusDropdown
                            status={quote.status}
                            onChangeStatus={(newStatus) => onUpdateQuoteStatus(quote.id, newStatus)}
                          />
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditQuote(quote)}
                              title="Editar Cotización"
                              className="p-1.5 rounded-lg bg-[#241f1a] hover:bg-[#2e2924] text-[#debfc3] hover:text-[#ffb1bf] border border-white/10 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onOpenPdfModal(quote)}
                              title="Exportar PDF"
                              className="p-1.5 rounded-lg bg-[#241f1a] hover:bg-[#2e2924] text-[#debfc3] hover:text-white border border-white/10 transition-colors cursor-pointer"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onConvertToOrder(quote)}
                              title="Convertir a Orden de Producción"
                              className="p-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 transition-colors cursor-pointer"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setQuoteToDelete(quote)}
                              title="Eliminar Cotización"
                              className="p-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuotes.map((quote) => {
              const firstItem = quote.items[0];
              return (
                <div
                  key={quote.id}
                  onClick={() => handleOpenEditQuote(quote)}
                  className="bg-[#191511] p-5 rounded-2xl border border-white/5 hover:border-[#ffb1bf]/30 shadow-lg flex flex-col justify-between gap-4 transition-all hover:bg-[#1f1b16] cursor-pointer group"
                >
                  <div>
                    {/* Top row: Code & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sm text-[#ffb1bf]">
                          {quote.code}
                        </span>
                        <button
                          onClick={(e) => handleCopyCode(quote.code, e)}
                          className="text-[#8a7f76] hover:text-[#ffb1bf] p-1 cursor-pointer"
                          title="Copiar código"
                        >
                          {copiedCode === quote.code ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <QuoteStatusDropdown
                          status={quote.status}
                          onChangeStatus={(newStatus) => onUpdateQuoteStatus(quote.id, newStatus)}
                        />
                      </div>
                    </div>

                    {/* Client info */}
                    <div className="mb-3">
                      <h4 className="font-headline font-bold text-base text-white group-hover:text-[#ffb1bf] transition-colors">
                        {quote.clientName || 'Cliente General'}
                      </h4>
                      {quote.contactEmail && (
                        <p className="text-xs text-[#debfc3] truncate mt-0.5">
                          {quote.contactEmail}
                        </p>
                      )}
                    </div>

                    {/* Items highlight */}
                    <div className="bg-[#241f1a] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                      <div className="text-[11px] font-bold text-[#debfc3] uppercase">
                        Partidas ({quote.items.length})
                      </div>
                      <p className="text-xs text-[#ebe1d9] line-clamp-2">
                        {firstItem?.description || 'Sin descripción'}
                      </p>
                      {quote.items.length > 1 && (
                        <span className="text-[10px] text-[#ffb1bf]">
                          +{quote.items.length - 1} partida(s) adicional(es)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom info & actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#8a7f76] uppercase">Importe Total</div>
                      <div className="font-mono font-bold text-base text-white">
                        ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditQuote(quote)}
                        title="Editar"
                        className="p-2 rounded-lg bg-[#241f1a] hover:bg-[#2e2924] text-[#debfc3] hover:text-[#ffb1bf] border border-white/10 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenPdfModal(quote)}
                        title="Exportar PDF"
                        className="p-2 rounded-lg bg-[#241f1a] hover:bg-[#2e2924] text-[#debfc3] hover:text-white border border-white/10 transition-colors cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setQuoteToDelete(quote)}
                        title="Eliminar"
                        className="p-2 rounded-lg bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Floating Window: Quote Editor Modal */}
      <QuoteEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => {
          setIsEditorModalOpen(false);
          setSelectedQuoteForEdit(null);
        }}
        quote={selectedQuoteForEdit}
        clients={clients}
        products={products}
        onSaveQuote={onSaveQuote}
        onConvertToOrder={onConvertToOrder}
        onOpenPdfModal={onOpenPdfModal}
        isNew={isCreatingNew}
      />

      {/* Delete Confirmation Modal */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-[#1f1b16] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-900/30 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-headline font-bold text-lg text-white">
                ¿Eliminar Cotización {quoteToDelete.code}?
              </h3>
              <p className="text-xs text-[#debfc3] mt-2">
                Esta acción eliminará de forma permanente el presupuesto para <strong>{quoteToDelete.clientName}</strong> por un total de <strong>${quoteToDelete.total.toLocaleString()} MXN</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#debfc3] hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
