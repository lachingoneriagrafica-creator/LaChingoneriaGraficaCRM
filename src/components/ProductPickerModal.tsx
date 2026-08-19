import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Package, 
  Check, 
  Plus, 
  Layers, 
  Scissors, 
  Clock, 
  Sparkles,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { Product, QuoteItem } from '../types';

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product, quantity?: number) => void;
  onSelectMultipleProducts?: (items: { product: Product; quantity: number }[]) => void;
}

export const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onSelectMultipleProducts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProductIds, setSelectedProductIds] = useState<Record<string, number>>({});
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => {
    if (!p.active) return false;
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    const matchesSearch = 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.paperStock && p.paperStock.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
    return matchesCat && matchesSearch;
  });

  const handleQuickAdd = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const qty = selectedProductIds[product.id] || product.minQuantity || 1;
    onSelectProduct(product, qty);
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1500);
  };

  const handleToggleSelect = (productId: string, defaultMin: number) => {
    setSelectedProductIds(prev => {
      const copy = { ...prev };
      if (copy[productId]) {
        delete copy[productId];
      } else {
        copy[productId] = defaultMin || 1;
      }
      return copy;
    });
  };

  const handleUpdateQty = (productId: string, newQty: number, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setSelectedProductIds(prev => ({
      ...prev,
      [productId]: Math.max(1, newQty)
    }));
  };

  const handleAddAllSelected = () => {
    const itemsToAdd = Object.entries(selectedProductIds).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId)!;
      return { product, quantity };
    }).filter(i => i.product);

    if (itemsToAdd.length > 0) {
      if (onSelectMultipleProducts) {
        onSelectMultipleProducts(itemsToAdd);
      } else {
        itemsToAdd.forEach(i => onSelectProduct(i.product, i.quantity));
      }
      onClose();
    }
  };

  const totalSelectedCount = Object.keys(selectedProductIds).length;

  const getCategoryBadgeClass = (cat: Product['category']) => {
    switch (cat) {
      case 'papeleria': return 'text-[#ff9aaf] bg-[#8d153e]/20 border border-[#ffb1bf]/20';
      case 'etiquetas': return 'text-[#ffb1bf] bg-[#8d153e]/30 border border-[#ffb1bf]/30';
      case 'gran_formato': return 'text-[#ffb1bf] bg-[#ab2e53]/30 border border-[#ffb1bf]/30';
      case 'empaque': return 'text-[#ccc5bf] bg-[#4c4843]/60 border border-white/10';
      case 'offset': return 'text-amber-300 bg-amber-500/20 border border-amber-500/30';
      case 'acabados': return 'text-purple-300 bg-purple-500/20 border border-purple-500/30';
      case 'preprensa': return 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/30';
      default: return 'text-[#debfc3] bg-[#2e2924] border border-white/5';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#17130e] text-[#ebe1d9] rounded-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh] my-auto animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#1f1b16] border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8d153e] flex items-center justify-center text-white shadow-md">
              <Boxes className="w-4 h-4 text-[#ff9aaf]" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base sm:text-lg text-white">
                Catálogo Rápido de Productos
              </h3>
              <p className="text-[11px] text-[#debfc3]">
                Selecciona productos del catálogo para agregarlos instantáneamente como partidas a la cotización.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#debfc3] hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 bg-[#1f1b16]/70 border-b border-white/5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#a58a8e] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre (ej. Folletos, Etiquetas, Lonas), código SKU o material..."
              className="w-full bg-[#241f1a] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#ebe1d9] placeholder-[#a58a8e] outline-none focus:border-[#ffb1bf]/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a58a8e] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'papeleria', label: 'Papelería' },
              { id: 'etiquetas', label: 'Etiquetas' },
              { id: 'gran_formato', label: 'Gran Formato' },
              { id: 'empaque', label: 'Empaque' },
              { id: 'offset', label: 'Offset' },
              { id: 'acabados', label: 'Acabados' },
              { id: 'preprensa', label: 'Pre-prensa' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#8d153e] text-white shadow-xs border border-[#ffb1bf]/30'
                    : 'bg-[#241f1a] text-[#debfc3] hover:bg-[#2e2924] border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-[#a58a8e] space-y-2">
              <Package className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-xs">No se encontraron productos coincidentes en el catálogo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProducts.map(product => {
                const isSelected = !!selectedProductIds[product.id];
                const currentQty = selectedProductIds[product.id] || product.minQuantity || 1;
                const wasRecentlyAdded = recentlyAddedId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleToggleSelect(product.id, product.minQuantity)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                      isSelected
                        ? 'bg-[#8d153e]/15 border-[#ffb1bf]/60 shadow-md ring-1 ring-[#ffb1bf]/40'
                        : 'bg-[#1f1b16] border-white/10 hover:border-white/20 hover:bg-[#241f1a]'
                    }`}
                  >
                    <div>
                      {/* Top Bar: SKU & Badge */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-[10px] font-bold text-[#ffb1bf] bg-[#2a241e] px-1.5 py-0.5 rounded border border-white/5">
                          {product.sku}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCategoryBadgeClass(product.category)}`}>
                          {product.categoryLabel || product.category}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h4 className="font-headline font-bold text-xs sm:text-sm text-white mb-1">
                        {product.name}
                      </h4>

                      {/* Description */}
                      <p className="text-[11px] text-[#debfc3] line-clamp-2 mb-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Specs */}
                      {product.paperStock && (
                        <div className="text-[10px] text-[#a58a8e] truncate mb-2">
                          <strong className="text-[#debfc3]">Sustrato:</strong> {product.paperStock}
                        </div>
                      )}
                    </div>

                    {/* Bottom: Price + Quick Add Action */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 mt-1">
                      <div>
                        <div className="font-mono font-bold text-sm text-white">
                          ${product.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-[10px] text-[#a58a8e] font-normal"> / {product.unit}</span>
                        </div>
                        <span className="text-[10px] text-[#a58a8e] block">
                          Mínimo: {product.minQuantity} {product.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Instant 1-Click Add Button */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                            wasRecentlyAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#8d153e] hover:bg-[#a61c4b] text-white'
                          }`}
                          title="Agregar esta partida directamente"
                        >
                          {wasRecentlyAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>¡Agregado!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-[#ff9aaf]" />
                              <span>Agregar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#1f1b16] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#debfc3]">
            {totalSelectedCount > 0 ? (
              <span className="font-semibold text-white">
                {totalSelectedCount} {totalSelectedCount === 1 ? 'producto seleccionado' : 'productos seleccionados'}
              </span>
            ) : (
              <span>Haz clic en "Agregar" en cualquier producto o selecciona varios.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#debfc3] hover:bg-[#2a241e] rounded-xl cursor-pointer"
            >
              Cerrar
            </button>

            {totalSelectedCount > 0 && (
              <button
                onClick={handleAddAllSelected}
                className="px-5 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
              >
                <span>Insertar Seleccionados ({totalSelectedCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
