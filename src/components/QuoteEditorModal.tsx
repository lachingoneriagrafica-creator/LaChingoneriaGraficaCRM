import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  FileDown, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Boxes, 
  User, 
  FileText, 
  DollarSign, 
  Clock, 
  Sparkles,
  ChevronDown,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { Quote, QuoteItem, Client, Product } from '../types';
import { ProductPickerModal } from './ProductPickerModal';

interface QuoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  clients: Client[];
  products: Product[];
  onSaveQuote: (quote: Quote) => void;
  onConvertToOrder?: (quote: Quote) => void;
  onOpenPdfModal?: (quote: Quote) => void;
  isNew?: boolean;
}

export const QuoteEditorModal: React.FC<QuoteEditorModalProps> = ({
  isOpen,
  onClose,
  quote,
  clients,
  products,
  onSaveQuote,
  onConvertToOrder,
  onOpenPdfModal,
  isNew = false
}) => {
  const [formData, setFormData] = useState<Quote | null>(null);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (quote) {
      setFormData(JSON.parse(JSON.stringify(quote)));
    }
  }, [quote, isOpen]);

  if (!isOpen || !formData) return null;

  // Recalculate financial totals
  const recalculateTotals = (items: QuoteItem[], taxRate = 0.16) => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      total
    };
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...formData.items];
    const currentItem = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Math.max(0, Number(value) || 0) : currentItem.quantity;
      const p = field === 'unitPrice' ? Math.max(0, Number(value) || 0) : currentItem.unitPrice;
      currentItem.total = q * p;
    }
    
    updatedItems[index] = currentItem;
    const totals = recalculateTotals(updatedItems, formData.taxRate);

    setFormData({
      ...formData,
      items: updatedItems,
      ...totals
    });
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: 'qi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      category: 'etiquetas',
      categoryLabel: 'Etiquetas Personalizadas',
      description: 'Nuevo producto o servicio de impresión',
      quantity: 1000,
      unitPrice: 2.50,
      total: 2500.00
    };

    const updatedItems = [...formData.items, newItem];
    const totals = recalculateTotals(updatedItems, formData.taxRate);

    setFormData({
      ...formData,
      items: updatedItems,
      ...totals
    });
  };

  const handleDeleteItem = (index: number) => {
    if (formData.items.length <= 1) {
      alert('La cotización debe tener al menos una partida.');
      return;
    }
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const totals = recalculateTotals(updatedItems, formData.taxRate);

    setFormData({
      ...formData,
      items: updatedItems,
      ...totals
    });
  };

  const handleSelectProductFromCatalog = (product: Product, quantity?: number) => {
    const qty = quantity || product.minQuantity || 1;
    const desc = `${product.name} - ${product.description}${product.paperStock ? ` (Sustrato: ${product.paperStock})` : ''}`;
    
    const newItem: QuoteItem = {
      id: 'qi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      category: product.category,
      categoryLabel: product.categoryLabel || product.name,
      description: desc,
      quantity: qty,
      unitPrice: product.unitPrice,
      total: qty * product.unitPrice
    };

    // If current items list has only one generic default item, replace it
    let updatedItems: QuoteItem[];
    if (
      formData.items.length === 1 &&
      (formData.items[0].description === 'Nuevo producto o servicio de impresión' || formData.items[0].description.trim() === '')
    ) {
      updatedItems = [newItem];
    } else {
      updatedItems = [...formData.items, newItem];
    }

    const totals = recalculateTotals(updatedItems, formData.taxRate);
    setFormData({
      ...formData,
      items: updatedItems,
      ...totals
    });
  };

  const handleSelectMultipleProducts = (selectedList: { product: Product; quantity: number }[]) => {
    const newItems: QuoteItem[] = selectedList.map(({ product, quantity }) => {
      const qty = quantity || product.minQuantity || 1;
      const desc = `${product.name} - ${product.description}${product.paperStock ? ` (Sustrato: ${product.paperStock})` : ''}`;
      return {
        id: 'qi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        category: product.category,
        categoryLabel: product.categoryLabel || product.name,
        description: desc,
        quantity: qty,
        unitPrice: product.unitPrice,
        total: qty * product.unitPrice
      };
    });

    let updatedItems: QuoteItem[];
    if (
      formData.items.length === 1 &&
      (formData.items[0].description === 'Nuevo producto o servicio de impresión' || formData.items[0].description.trim() === '')
    ) {
      updatedItems = newItems;
    } else {
      updatedItems = [...formData.items, ...newItems];
    }

    const totals = recalculateTotals(updatedItems, formData.taxRate);
    setFormData({
      ...formData,
      items: updatedItems,
      ...totals
    });
  };

  const handleClientSelect = (clientId: string) => {
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setFormData({
        ...formData,
        clientId: found.id,
        clientName: found.name,
        contactEmail: found.email,
        contactPhone: found.phone
      });
    }
  };

  const handleSave = () => {
    if (!formData.clientName.trim()) {
      alert('Por favor especifica el nombre del cliente o empresa.');
      return;
    }
    onSaveQuote(formData);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 600);
  };

  const handleConvert = () => {
    if (onConvertToOrder) {
      onConvertToOrder(formData);
      onClose();
    }
  };

  const handlePdf = () => {
    if (onOpenPdfModal) {
      onOpenPdfModal(formData);
    }
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'SENT':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'APPROVED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'CONVERTED':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-[#191511] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-4 bg-[#201b16] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8d153e] flex items-center justify-center text-white shadow-md border border-[#ffb1bf]/30">
              <FileText className="w-5 h-5 text-[#ff9aaf]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-headline font-bold text-lg sm:text-xl text-[#ebe1d9]">
                  {isNew ? 'Nueva Cotización' : `Editar Cotización ${formData.code}`}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#2a241e] text-[#debfc3] border border-white/10">
                  {formData.code}
                </span>
              </div>
              <p className="text-xs text-[#debfc3]">
                Ingresa partidas, cliente y precios para formalizar el presupuesto comercial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Dropdown Selector */}
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Quote['status'] })}
                aria-label="Estado de la cotización"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer outline-none transition-all pr-7 appearance-none ${getStatusColor(formData.status)}`}
              >
                <option value="DRAFT" className="bg-[#201b16] text-amber-300">🟡 Borrador</option>
                <option value="SENT" className="bg-[#201b16] text-sky-300">🔵 Enviada</option>
                <option value="APPROVED" className="bg-[#201b16] text-emerald-300">🟢 Aprobada</option>
                <option value="CONVERTED" className="bg-[#201b16] text-purple-300">🟣 Convertida</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#debfc3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-[#15110d]">
          
          {/* Section 1: Client Information */}
          <div className="bg-[#1f1b16] p-4 sm:p-5 rounded-xl border border-white/5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#ffb1bf]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb1bf]">
                  Información del Cliente
                </h3>
              </div>
              <span className="text-[11px] text-[#debfc3]">
                Selecciona un cliente registrado o ingresa datos directos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#debfc3] uppercase mb-1">
                  Cliente Registrado
                </label>
                <select
                  value={formData.clientId || ''}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  aria-label="Seleccionar cliente registrado"
                  className="w-full bg-[#2a241e] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none focus:border-[#ffb1bf]/50 cursor-pointer"
                >
                  <option value="">-- Seleccionar de Directorio --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.contactPerson})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#debfc3] uppercase mb-1">
                  Nombre Empresa / Cliente *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ej: Mezcal Ancestral S.A."
                  className="w-full bg-[#2a241e] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none focus:border-[#ffb1bf]/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#debfc3] uppercase mb-1">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contacto@cliente.com"
                  className="w-full bg-[#2a241e] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none focus:border-[#ffb1bf]/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Items / Partidas Table */}
          <div className="bg-[#1f1b16] p-4 sm:p-5 rounded-xl border border-white/5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#ffb1bf]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb1bf]">
                  Partidas de Producción ({formData.items.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Catalog Picker Button */}
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(true)}
                  className="px-3 py-1.5 bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5 text-[#ff9aaf]" />
                  <span>📦 Catálogo de Productos</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-[#2a241e] hover:bg-[#342e27] text-[#debfc3] hover:text-white border border-white/10 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ffb1bf]" />
                  <span>+ Partida Manual</span>
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-bold text-[#debfc3] uppercase">
                    <th className="pb-2.5 px-2 w-[160px]">Categoría</th>
                    <th className="pb-2.5 px-2">Descripción Técnica</th>
                    <th className="pb-2.5 px-2 w-[110px] text-right">Cantidad</th>
                    <th className="pb-2.5 px-2 w-[130px] text-right">Precio Unit. ($)</th>
                    <th className="pb-2.5 px-2 w-[130px] text-right">Total ($)</th>
                    <th className="pb-2.5 px-2 w-[40px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {formData.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-2 align-top">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                          aria-label="Categoría de la partida"
                          className="w-full bg-[#2a241e] border border-white/10 rounded-md px-2 py-1.5 text-xs text-[#ebe1d9] outline-none"
                        >
                          <option value="papeleria">Papelería</option>
                          <option value="etiquetas">Etiquetas</option>
                          <option value="gran_formato">Gran Formato</option>
                          <option value="empaque">Empaque</option>
                          <option value="offset">Offset</option>
                          <option value="acabados">Acabados</option>
                          <option value="preprensa">Pre-prensa</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-2 align-top">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Descripción detallada, gramaje, tintas y medidas..."
                          className="w-full bg-[#2a241e] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#ebe1d9] outline-none focus:border-[#ffb1bf]/50"
                        />
                      </td>
                      <td className="py-2.5 px-2 align-top text-right">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full bg-[#2a241e] border border-white/10 rounded-md px-2 py-1.5 text-xs text-[#ebe1d9] text-right font-mono outline-none focus:border-[#ffb1bf]/50"
                        />
                      </td>
                      <td className="py-2.5 px-2 align-top text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full bg-[#2a241e] border border-white/10 rounded-md px-2 py-1.5 text-xs text-[#ebe1d9] text-right font-mono outline-none focus:border-[#ffb1bf]/50"
                        />
                      </td>
                      <td className="py-2.5 px-2 align-top text-right font-mono font-bold text-[#ffb1bf]">
                        ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 align-top text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          title="Eliminar partida"
                          className="text-[#debfc3] hover:text-red-400 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Commercial Terms & Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Terms & Validity */}
            <div className="bg-[#1f1b16] p-4 sm:p-5 rounded-xl border border-white/5 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#ffb1bf]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb1bf]">
                  Términos y Validez
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#debfc3] uppercase mb-1">
                  Vigencia de la Cotización
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.validityDays}
                    onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) || 15 })}
                    className="w-24 bg-[#2a241e] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] font-mono outline-none"
                  />
                  <span className="text-xs text-[#debfc3]">Días naturales</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#debfc3] uppercase mb-1">
                  Condiciones Comerciales y de Pago
                </label>
                <textarea
                  rows={3}
                  value={formData.commercialTerms}
                  onChange={(e) => setFormData({ ...formData, commercialTerms: e.target.value })}
                  placeholder="Condiciones de pago, tiempos de entrega y requerimientos..."
                  className="w-full bg-[#2a241e] border border-white/10 rounded-lg p-2.5 text-xs text-[#ebe1d9] outline-none resize-none focus:border-[#ffb1bf]/50"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#1f1b16] p-4 sm:p-5 rounded-xl border border-white/5 shadow-md flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-[#ffb1bf]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb1bf]">
                  Resumen Económico ($ MXN)
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#debfc3] pb-2 border-b border-white/5">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-[#ebe1d9]">
                    ${formData.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#debfc3] pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span>IVA (16%)</span>
                  </div>
                  <span className="font-mono font-semibold text-[#ebe1d9]">
                    ${formData.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-sm font-headline font-bold text-white block">TOTAL NETO</span>
                    <span className="text-[10px] text-[#debfc3]">Pesos Mexicanos (MXN)</span>
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#ffb1bf]">
                    ${formData.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#debfc3]">
                <span>Partidas: {formData.items.length}</span>
                <span>Unidades Totales: {formData.items.reduce((acc, it) => acc + (it.quantity || 0), 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Sticky Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#201b16] flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenPdfModal && (
              <button
                type="button"
                onClick={handlePdf}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#2a241e] hover:bg-[#342e27] text-xs font-semibold text-[#debfc3] hover:text-white border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-[#ffb1bf]" />
                <span>Exportar PDF</span>
              </button>
            )}

            {onConvertToOrder && (
              <button
                type="button"
                onClick={handleConvert}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 text-xs font-semibold text-purple-300 border border-purple-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-purple-400" />
                <span>Convertir a Orden</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#debfc3] hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4 text-[#ff9aaf]" />
              <span>{isNew ? 'Guardar Cotización' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Product Catalog Picker Modal */}
      <ProductPickerModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        products={products}
        onSelectProduct={handleSelectProductFromCatalog}
        onSelectMultiple={handleSelectMultipleProducts}
      />
    </div>
  );
};
