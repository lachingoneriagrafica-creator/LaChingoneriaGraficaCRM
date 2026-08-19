import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  Tag, 
  Clock, 
  ArrowUpDown, 
  Calculator, 
  Boxes, 
  Sparkles, 
  FileText, 
  Scissors, 
  CheckCircle2, 
  X, 
  AlertCircle,
  LayoutGrid,
  List,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { Product } from '../types';
import { formatMXN } from '../utils/currencyUtils';

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onQuoteProduct: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onQuoteProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'sku' | 'recent'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Product['category']>('papeleria');
  const [formDescription, setFormDescription] = useState('');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(0);
  const [formUnit, setFormUnit] = useState('pza');
  const [formMinQuantity, setFormMinQuantity] = useState<number>(100);
  const [formPaperStock, setFormPaperStock] = useState('');
  const [formFinishes, setFormFinishes] = useState<string>('');
  const [formDays, setFormDays] = useState<number>(3);
  const [formTags, setFormTags] = useState<string>('');
  const [formActive, setFormActive] = useState<boolean>(true);

  // Filter & Search logic
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch = 
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      (product.paperStock && product.paperStock.toLowerCase().includes(q)) ||
      (product.tags && product.tags.some(t => t.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'price_asc') return a.unitPrice - b.unitPrice;
    if (sortBy === 'price_desc') return b.unitPrice - a.unitPrice;
    if (sortBy === 'sku') return a.sku.localeCompare(b.sku);
    if (sortBy === 'recent') return (b.createdAt || '').localeCompare(a.createdAt || '');
    return 0;
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    const catCode = 'PAP';
    const randNum = Math.floor(100 + Math.random() * 900);
    setFormSku(`PRD-${catCode}-${randNum}`);
    setFormName('');
    setFormCategory('papeleria');
    setFormDescription('');
    setFormUnitPrice(150);
    setFormUnit('pza');
    setFormMinQuantity(100);
    setFormPaperStock('');
    setFormFinishes('');
    setFormDays(3);
    setFormTags('Nuevo');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormSku(product.sku);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormDescription(product.description);
    setFormUnitPrice(product.unitPrice);
    setFormUnit(product.unit);
    setFormMinQuantity(product.minQuantity);
    setFormPaperStock(product.paperStock || '');
    setFormFinishes(product.suggestedFinishes ? product.suggestedFinishes.join(', ') : '');
    setFormDays(product.estimatedProductionDays || 3);
    setFormTags(product.tags ? product.tags.join(', ') : '');
    setFormActive(product.active);
    setIsModalOpen(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: 'prd_' + Date.now(),
      sku: product.sku + '-CP',
      name: `${product.name} (Copia)`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    onAddProduct(duplicated);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) return;

    const finishesArray = formFinishes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const tagsArray = formTags
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const productData: Product = {
      id: editingProduct ? editingProduct.id : 'prd_' + Date.now(),
      sku: formSku.trim().toUpperCase(),
      name: formName.trim(),
      category: formCategory,
      categoryLabel: getCategoryLabel(formCategory),
      description: formDescription.trim(),
      unitPrice: Number(formUnitPrice) || 0,
      unit: formUnit.trim() || 'pza',
      minQuantity: Number(formMinQuantity) || 1,
      paperStock: formPaperStock.trim() || undefined,
      suggestedFinishes: finishesArray.length > 0 ? finishesArray : undefined,
      estimatedProductionDays: Number(formDays) || 3,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      active: formActive,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingProduct) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }

    setIsModalOpen(false);
  };

  const handleCopySku = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  const getCategoryLabel = (cat: Product['category']) => {
    switch (cat) {
      case 'papeleria': return 'Papelería';
      case 'etiquetas': return 'Etiquetas';
      case 'gran_formato': return 'Gran Formato';
      case 'empaque': return 'Empaque';
      case 'offset': return 'Offset';
      case 'acabados': return 'Acabados';
      case 'preprensa': return 'Pre-prensa';
      default: return 'General';
    }
  };

  const getCategoryBadgeClass = (cat: Product['category']) => {
    switch (cat) {
      case 'papeleria':
        return 'text-[#ff9aaf] bg-[#8d153e]/20 border border-[#ffb1bf]/20';
      case 'etiquetas':
        return 'text-[#ffb1bf] bg-[#8d153e]/30 border border-[#ffb1bf]/30';
      case 'gran_formato':
        return 'text-[#ffb1bf] bg-[#ab2e53]/30 border border-[#ffb1bf]/30';
      case 'empaque':
        return 'text-[#ccc5bf] bg-[#4c4843]/60 border border-white/10';
      case 'offset':
        return 'text-amber-300 bg-amber-500/20 border border-amber-500/30';
      case 'acabados':
        return 'text-purple-300 bg-purple-500/20 border border-purple-500/30';
      case 'preprensa':
        return 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/30';
      default:
        return 'text-[#debfc3] bg-[#2e2924] border border-white/5';
    }
  };

  // Metrics
  const totalActive = products.filter(p => p.active).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;
  const avgPrice = products.length > 0 
    ? Math.round(products.reduce((acc, p) => acc + p.unitPrice, 0) / products.length) 
    : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-[#8d153e] flex items-center justify-center text-white shadow-md border border-[#ffb1bf]/30">
                <Boxes className="w-4 h-4 text-[#ff9aaf]" />
              </div>
              <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#ebe1d9]">
                Catálogo de Productos y Servicios
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#8d153e]/40 text-[#ffb1bf] border border-[#ffb1bf]/30">
                Exclusivo Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#debfc3]">
              Administra tu inventario de productos de imprenta, tarifas base y sustratos para acelerar las cotizaciones en 1 clic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#ff9aaf]" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#1f1b16] p-3.5 rounded-xl border border-white/5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2a241e] flex items-center justify-center text-[#ffb1bf] border border-white/5">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#a58a8e] block">Productos Activos</span>
              <span className="font-headline font-bold text-lg text-white">
                {totalActive} <span className="text-xs text-[#a58a8e] font-normal">/ {products.length}</span>
              </span>
            </div>
          </div>

          <div className="bg-[#1f1b16] p-3.5 rounded-xl border border-white/5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2a241e] flex items-center justify-center text-[#ff9aaf] border border-white/5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#a58a8e] block">Categorías</span>
              <span className="font-headline font-bold text-lg text-white">{categoriesCount}</span>
            </div>
          </div>

          <div className="bg-[#1f1b16] p-3.5 rounded-xl border border-white/5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2a241e] flex items-center justify-center text-emerald-400 border border-white/5">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#a58a8e] block">Tarifa Promedio</span>
              <span className="font-headline font-bold text-lg text-white">{formatMXN(avgPrice)} <span className="text-[10px] text-[#a58a8e]">MXN</span></span>
            </div>
          </div>

          <div className="bg-[#1f1b16] p-3.5 rounded-xl border border-white/5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2a241e] flex items-center justify-center text-amber-300 border border-white/5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#a58a8e] block">Entrega Promedio</span>
              <span className="font-headline font-bold text-lg text-white">2.8 <span className="text-xs text-[#a58a8e] font-normal">días</span></span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#1f1b16] p-4 rounded-xl border border-white/5 shadow-md space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#a58a8e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, SKU (PRD-...), sustrato o palabras clave..."
                className="w-full bg-[#241f1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#ebe1d9] placeholder-[#a58a8e] outline-none focus:border-[#ffb1bf]/50 transition-colors"
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

            {/* Sort and View controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#241f1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#debfc3]">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#ffb1bf]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-[#ebe1d9] text-xs outline-none cursor-pointer"
                >
                  <option value="name" className="bg-[#1f1b16]">Nombre (A - Z)</option>
                  <option value="price_asc" className="bg-[#1f1b16]">Menor Precio</option>
                  <option value="price_desc" className="bg-[#1f1b16]">Mayor Precio</option>
                  <option value="sku" className="bg-[#1f1b16]">Por Código SKU</option>
                  <option value="recent" className="bg-[#1f1b16]">Más Recientes</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-[#241f1a] border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#8d153e] text-white shadow-xs' : 'text-[#a58a8e] hover:text-white'
                  }`}
                  title="Vista Cuadrícula"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-[#8d153e] text-white shadow-xs' : 'text-[#a58a8e] hover:text-white'
                  }`}
                  title="Vista Tabla"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: 'ALL', label: 'Todas las Categorías' },
              { id: 'papeleria', label: 'Papelería' },
              { id: 'etiquetas', label: 'Etiquetas & Stickers' },
              { id: 'gran_formato', label: 'Gran Formato' },
              { id: 'empaque', label: 'Empaque & Cajas' },
              { id: 'offset', label: 'Offset Comercial' },
              { id: 'acabados', label: 'Acabados Especiales' },
              { id: 'preprensa', label: 'Pre-prensa & Diseño' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#8d153e] text-white shadow-sm border border-[#ffb1bf]/30'
                    : 'bg-[#241f1a] text-[#debfc3] hover:bg-[#2e2924] border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Results List */}
        {sortedProducts.length === 0 ? (
          <div className="bg-[#1f1b16] rounded-xl border border-white/5 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#2a241e] text-[#a58a8e] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-semibold text-base text-white">
              No se encontraron productos
            </h3>
            <p className="text-xs text-[#a58a8e] max-w-sm mx-auto">
              Prueba con otro término de búsqueda o agrega un nuevo producto al catálogo.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-[#8d153e] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agregar Producto
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#1f1b16] rounded-xl border border-white/10 p-5 shadow-lg flex flex-col justify-between hover:border-[#ffb1bf]/40 transition-all group"
              >
                <div>
                  {/* Top SKU & Category badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <button
                      onClick={(e) => handleCopySku(product.sku, e)}
                      className="font-mono text-[11px] font-bold text-[#ffb1bf] bg-[#2a241e] hover:bg-[#38312a] px-2 py-0.5 rounded border border-white/5 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copiar SKU"
                    >
                      <span>{product.sku}</span>
                      {copiedSku === product.sku ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#a58a8e] group-hover:text-white" />
                      )}
                    </button>

                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getCategoryBadgeClass(product.category)}`}>
                      {getCategoryLabel(product.category)}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3 className="font-headline font-bold text-base text-white leading-snug mb-1.5 group-hover:text-[#ffb1bf] transition-colors">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#debfc3] line-clamp-2 mb-3 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Technical Meta Chips */}
                  <div className="space-y-1.5 mb-4 text-[11px]">
                    {product.paperStock && (
                      <div className="flex items-center gap-1.5 text-[#a58a8e] truncate">
                        <Layers className="w-3.5 h-3.5 text-[#ffb1bf] shrink-0" />
                        <span className="truncate text-[#ebe1d9]">{product.paperStock}</span>
                      </div>
                    )}
                    {product.suggestedFinishes && product.suggestedFinishes.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[#a58a8e] truncate">
                        <Scissors className="w-3.5 h-3.5 text-[#ff9aaf] shrink-0" />
                        <span className="truncate text-[#debfc3]">
                          {product.suggestedFinishes.join(', ')}
                        </span>
                      </div>
                    )}
                    {product.estimatedProductionDays && (
                      <div className="flex items-center gap-1.5 text-[#a58a8e]">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Entrega estimada: <strong>{product.estimatedProductionDays} días hábiles</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Price + Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                  <div>
                    <span className="text-[10px] text-[#a58a8e] uppercase block font-semibold">Tarifa Base:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline font-bold text-lg text-white font-mono">
                        {formatMXN(product.unitPrice)}
                      </span>
                      <span className="text-xs text-[#a58a8e]">/ {product.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Fast Quote Button */}
                    <button
                      onClick={() => onQuoteProduct(product)}
                      className="px-3 py-1.5 bg-[#8d153e]/40 hover:bg-[#8d153e] text-[#ffb1bf] hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1 border border-[#ffb1bf]/20 transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Generar cotización con este producto"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Cotizar</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="p-1.5 text-[#a58a8e] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Editar Producto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicateProduct(product)}
                      className="p-1.5 text-[#a58a8e] hover:text-[#ffb1bf] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Duplicar Producto"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Seguro que deseas eliminar el producto "${product.name}"?`)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                      className="p-1.5 text-[#a58a8e] hover:text-[#ffb4ab] hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar Producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View Mode */
          <div className="bg-[#1f1b16] rounded-xl border border-white/5 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#241f1a] text-[#debfc3] uppercase font-semibold">
                    <th className="p-3.5">SKU / Código</th>
                    <th className="p-3.5">Nombre & Descripción</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Sustrato / Papel</th>
                    <th className="p-3.5 text-right">Precio Unitario</th>
                    <th className="p-3.5 text-center">Mínimo</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#241f1a]/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#ffb1bf]">
                        {product.sku}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-white truncate">{product.name}</div>
                        <div className="text-[11px] text-[#a58a8e] truncate">{product.description}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCategoryBadgeClass(product.category)}`}>
                          {getCategoryLabel(product.category)}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#ebe1d9] max-w-[180px] truncate">
                        {product.paperStock || '—'}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {formatMXN(product.unitPrice)}
                        <span className="text-[10px] text-[#a58a8e] block font-normal">/ {product.unit}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono text-[#debfc3]">
                        {product.minQuantity} {product.unit}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onQuoteProduct(product)}
                            className="px-2.5 py-1 bg-[#8d153e]/40 hover:bg-[#8d153e] text-[#ffb1bf] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="Cotizar este producto"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Cotizar</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-[#a58a8e] hover:text-white rounded-lg hover:bg-white/10"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar ${product.name}?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 text-[#a58a8e] hover:text-[#ffb4ab] rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Product Create / Edit Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-[#17130e] text-[#ebe1d9] rounded-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150 my-auto">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#1f1b16] border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8d153e] flex items-center justify-center text-white">
                  <Package className="w-4 h-4 text-[#ff9aaf]" />
                </div>
                <h3 className="font-headline font-bold text-base sm:text-lg text-white">
                  {editingProduct ? 'Editar Producto del Catálogo' : 'Nuevo Producto / Servicio'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#debfc3] hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* SKU */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3] uppercase">
                    Código SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                    placeholder="PRD-PAP-001"
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#ffb1bf] outline-none focus:border-[#ffb1bf]/50"
                  />
                </div>

                {/* Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3] uppercase">
                    Nombre del Producto / Servicio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Folletos Trípticos Couche 150g"
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold outline-none focus:border-[#ffb1bf]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3] uppercase">
                    Categoría
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="papeleria">Papelería Institucional</option>
                    <option value="etiquetas">Etiquetas & Stickers</option>
                    <option value="gran_formato">Gran Formato y Viniles</option>
                    <option value="empaque">Empaque & Cajas</option>
                    <option value="offset">Offset Comercial</option>
                    <option value="acabados">Acabados Especiales</option>
                    <option value="preprensa">Pre-prensa & Diseño</option>
                  </select>
                </div>

                {/* Unit of measure */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3] uppercase">
                    Unidad de Medida
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="pza">Pieza (pza)</option>
                    <option value="millar">Millar (1,000 pzas)</option>
                    <option value="paquete 100">Paquete de 100 pzas</option>
                    <option value="paquete 500">Paquete de 500 pzas</option>
                    <option value="m²">Metro Cuadrado (m²)</option>
                    <option value="rollo">Rollo</option>
                    <option value="lote">Lote</option>
                    <option value="servicio">Servicio / Proyecto</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#debfc3] uppercase">
                  Descripción Técnica Predeterminada *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalles técnicos que aparecerán en la cotización (tintas, medidas, acabados incluidos)..."
                  className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none focus:border-[#ffb1bf]/50 custom-scrollbar resize-none"
                />
              </div>

              {/* Prices & Quantities */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#1f1b16] p-3 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#a58a8e] uppercase">
                    Precio Unitario ($ MXN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#a58a8e] font-mono">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      value={formUnitPrice}
                      onChange={(e) => setFormUnitPrice(Number(e.target.value))}
                      className="w-full bg-[#2a241e] border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white font-mono font-bold outline-none focus:border-[#ffb1bf]/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#a58a8e] uppercase">
                    Cantidad Mínima Sugerida
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formMinQuantity}
                    onChange={(e) => setFormMinQuantity(Number(e.target.value))}
                    className="w-full bg-[#2a241e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#ffb1bf]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#a58a8e] uppercase">
                    Días de Producción
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formDays}
                    onChange={(e) => setFormDays(Number(e.target.value))}
                    className="w-full bg-[#2a241e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#ffb1bf]/50"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3] uppercase">
                    Sustrato / Papel Sugerido
                  </label>
                  <input
                    type="text"
                    value={formPaperStock}
                    onChange={(e) => setFormPaperStock(e.target.value)}
                    placeholder="Ej. Couche 300g brillante"
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#ffb1bf]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3] uppercase">
                    Acabados Sugeridos (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={formFinishes}
                    onChange={(e) => setFormFinishes(e.target.value)}
                    placeholder="Ej. Laminado Mate, Barniz UV, Suaje"
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#ffb1bf]/50"
                  />
                </div>
              </div>

              {/* Tags and Active Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3] uppercase">
                    Etiquetas / Tags
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Ej. Más vendido, Corporativo, Urgente"
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="activeProductCheck"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="activeProductCheck" className="text-xs text-[#debfc3] font-semibold cursor-pointer">
                    Producto Activo en el Catálogo
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#debfc3] hover:bg-[#2a241e] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
