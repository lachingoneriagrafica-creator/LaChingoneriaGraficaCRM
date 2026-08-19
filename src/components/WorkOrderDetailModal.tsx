import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Clock, 
  Calendar, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Layers, 
  Cpu, 
  Palette, 
  Scissors, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight,
  Send,
  Download,
  ShieldCheck,
  Tag,
  Hash,
  RotateCw
} from 'lucide-react';
import { ProductionJob, ProductionStatus } from '../types';
import { BrandLogo } from './BrandLogo';
import { formatMXN } from '../utils/currencyUtils';

interface WorkOrderDetailModalProps {
  job: ProductionJob | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateJobStatus?: (jobId: string, newStatus: ProductionStatus) => void;
  onAddProductionNote?: (jobId: string, note: string) => void;
}

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onUpdateJobStatus,
  onAddProductionNote
}) => {
  const [newNote, setNewNote] = useState('');
  const [localLogs, setLocalLogs] = useState<{ date: string; message: string; user: string }[]>([]);

  if (!isOpen || !job) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newLogItem = {
      date: timeStr,
      message: newNote.trim(),
      user: 'Operador / Taller'
    };

    setLocalLogs(prev => [newLogItem, ...prev]);
    if (onAddProductionNote) {
      onAddProductionNote(job.id, newNote.trim());
    }
    setNewNote('');
  };

  const getStatusInfo = (status: ProductionStatus) => {
    switch (status) {
      case 'por_aprobar':
        return { label: 'Por Aprobar', color: 'bg-zinc-700 text-zinc-200 border-zinc-500/30', step: 1 };
      case 'preprensa':
        return { label: 'En Pre-prensa / CTP', color: 'bg-[#8d153e]/40 text-[#ffb1bf] border-[#ffb1bf]/30', step: 2 };
      case 'impresion':
        return { label: 'En Impresión / Prensa', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', step: 3 };
      case 'finalizado':
        return { label: 'Finalizado / Listo para Entrega', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', step: 4 };
      default:
        return { label: 'En Cola', color: 'bg-zinc-700 text-zinc-200 border-zinc-500/30', step: 1 };
    }
  };

  const statusInfo = getStatusInfo(job.status);

  const combinedLogs = [
    ...(localLogs || []),
    ...(job.productionLog || [
      { date: job.createdAt ? `${job.createdAt} 09:00` : '2023-10-20 09:00', message: 'Orden generada y asignada al taller', user: 'Admin' }
    ])
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#17130e] text-[#ebe1d9] rounded-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Top Header Bar (Non-printable) */}
        <div className="p-4 sm:p-5 bg-[#1f1b16] border-b border-white/10 flex flex-wrap justify-between items-center gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8d153e] flex items-center justify-center text-white shadow-md border border-[#ffb1bf]/30 shrink-0">
              <Layers className="w-5 h-5 text-[#ff9aaf]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffb1bf] bg-[#8d153e]/20 px-2 py-0.5 rounded border border-[#ffb1bf]/20">
                  Hoja de Taller
                </span>
                <span className="font-mono font-bold text-sm text-[#ebe1d9]">
                  {job.orderNumber}
                </span>
                {job.quoteCode && (
                  <span className="text-[11px] text-[#a58a8e] font-mono">
                    (Ref: {job.quoteCode})
                  </span>
                )}
              </div>
              <h2 className="font-headline font-bold text-base sm:text-lg text-white leading-tight mt-0.5">
                Orden de Producción: {job.projectName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-[#2a241e] hover:bg-[#38312a] text-[#ebe1d9] text-xs font-semibold rounded-xl flex items-center gap-2 border border-white/15 transition-all cursor-pointer shadow-sm active:scale-98"
              title="Imprimir Hoja de Taller"
            >
              <Printer className="w-4 h-4 text-[#ffb1bf]" />
              <span className="hidden sm:inline">Imprimir Hoja de Taller</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#debfc3] hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6 bg-[#17130e] print:p-0 print:bg-white print:text-black">
          
          {/* Status Progression Bar */}
          <div className="bg-[#1f1b16] p-4 rounded-xl border border-white/10 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs text-[#a58a8e]">Estado Actual del Trabajo:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  {job.isUrgent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Prioridad Urgente
                    </span>
                  )}
                </div>
              </div>

              {/* Status Switcher (Kanban quick moves) */}
              {onUpdateJobStatus && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#a58a8e] mr-1">Cambiar Etapa:</span>
                  <button
                    onClick={() => onUpdateJobStatus(job.id, 'por_aprobar')}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                      job.status === 'por_aprobar' 
                        ? 'bg-[#8d153e] text-white font-bold' 
                        : 'bg-[#2a241e] hover:bg-[#3a3229] text-[#debfc3]'
                    }`}
                  >
                    Por Aprobar
                  </button>
                  <button
                    onClick={() => onUpdateJobStatus(job.id, 'preprensa')}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                      job.status === 'preprensa' 
                        ? 'bg-[#8d153e] text-white font-bold' 
                        : 'bg-[#2a241e] hover:bg-[#3a3229] text-[#debfc3]'
                    }`}
                  >
                    Pre-prensa
                  </button>
                  <button
                    onClick={() => onUpdateJobStatus(job.id, 'impresion')}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                      job.status === 'impresion' 
                        ? 'bg-[#8d153e] text-white font-bold' 
                        : 'bg-[#2a241e] hover:bg-[#3a3229] text-[#debfc3]'
                    }`}
                  >
                    Impresión
                  </button>
                  <button
                    onClick={() => onUpdateJobStatus(job.id, 'finalizado')}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                      job.status === 'finalizado' 
                        ? 'bg-emerald-600 text-white font-bold' 
                        : 'bg-[#2a241e] hover:bg-[#3a3229] text-[#debfc3]'
                    }`}
                  >
                    Finalizado
                  </button>
                </div>
              )}
            </div>

            {/* Stepper Visualization */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5 text-center text-[11px]">
              <div className={`p-1.5 rounded ${statusInfo.step >= 1 ? 'text-[#ffb1bf] font-semibold' : 'text-[#a58a8e]'}`}>
                1. Aprobación & Alta
              </div>
              <div className={`p-1.5 rounded ${statusInfo.step >= 2 ? 'text-[#ffb1bf] font-semibold' : 'text-[#a58a8e]'}`}>
                2. Pre-prensa / CTP
              </div>
              <div className={`p-1.5 rounded ${statusInfo.step >= 3 ? 'text-[#ffb1bf] font-semibold' : 'text-[#a58a8e]'}`}>
                3. Tiraje & Impresión
              </div>
              <div className={`p-1.5 rounded ${statusInfo.step >= 4 ? 'text-emerald-400 font-semibold' : 'text-[#a58a8e]'}`}>
                4. Acabados & Entrega
              </div>
            </div>
          </div>

          {/* Printable Header Format (visible only when printing) */}
          <div className="hidden print:block border-b-2 border-[#8d153e] pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-black">LA CHINGONERÍA GRÁFICA</h1>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                  HOJA DE RUTA / ORDEN DE TRABAJO DE PRODUCCIÓN
                </p>
                <p className="text-xs text-gray-500">
                  Taller de Impresión Offset, Digital y Acabados de Alta Precisión
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-black text-white px-3 py-1 text-sm font-mono font-bold">
                  {job.orderNumber}
                </div>
                <p className="text-xs text-gray-600 mt-1">Fecha OT: {job.createdAt || '2023-10-20'}</p>
                <p className="text-xs font-bold text-red-600">Entrega: {job.deliveryDate}</p>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Technical Specifications & Order Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column (7 cols): Customer & Technical Specs */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Customer & Logistic Card */}
              <div className="bg-[#1f1b16] rounded-xl p-4 sm:p-5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ffb1bf] uppercase tracking-wider border-b border-white/5 pb-2">
                  <Building2 className="w-4 h-4" />
                  <span>Datos del Cliente & Despacho</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#a58a8e] block text-[11px]">Empresa / Cliente:</span>
                    <span className="font-bold text-sm text-white">{job.clientName}</span>
                  </div>
                  <div>
                    <span className="text-[#a58a8e] block text-[11px]">Fecha Promesa de Entrega:</span>
                    <div className="flex items-center gap-1 font-semibold text-[#ebe1d9] mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#ffb1bf]" />
                      <span>{job.deliveryDate}</span>
                    </div>
                  </div>

                  {job.contactPhone && (
                    <div>
                      <span className="text-[#a58a8e] block text-[11px]">Teléfono / WhatsApp:</span>
                      <div className="flex items-center gap-1 text-[#debfc3] font-mono mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#a58a8e]" />
                        <span>{job.contactPhone}</span>
                      </div>
                    </div>
                  )}

                  {job.contactEmail && (
                    <div>
                      <span className="text-[#a58a8e] block text-[11px]">Correo Electrónico:</span>
                      <div className="flex items-center gap-1 text-[#debfc3] mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#a58a8e]" />
                        <span className="truncate">{job.contactEmail}</span>
                      </div>
                    </div>
                  )}

                  {job.deliveryAddress && (
                    <div className="sm:col-span-2 bg-[#251f19] p-2.5 rounded-lg border border-white/5">
                      <span className="text-[#a58a8e] block text-[10px] uppercase font-semibold">Dirección de Entrega:</span>
                      <div className="flex items-start gap-1.5 text-[#ebe1d9] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#ffb1bf] shrink-0 mt-0.5" />
                        <span>{job.deliveryAddress}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Graphic Arts Technical Production Specs */}
              <div className="bg-[#1f1b16] rounded-xl p-4 sm:p-5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#ffb1bf] uppercase tracking-wider">
                    <Cpu className="w-4 h-4" />
                    <span>Ficha Técnica de Producción</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#a58a8e] bg-[#2a241e] px-2 py-0.5 rounded border border-white/5">
                    {job.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Tiraje / Cantidad */}
                  <div className="bg-[#241e18] p-3 rounded-lg border border-white/5">
                    <span className="text-[#a58a8e] text-[11px] block">Tiraje / Cantidad Total:</span>
                    <span className="font-mono font-bold text-base text-[#ffb1bf]">
                      {(job.quantity || 1000).toLocaleString()} pzas
                    </span>
                  </div>

                  {/* Formato / Medidas */}
                  <div className="bg-[#241e18] p-3 rounded-lg border border-white/5">
                    <span className="text-[#a58a8e] text-[11px] block">Medida Final / Formato:</span>
                    <span className="font-semibold text-white">
                      {job.dimensions || 'Tamaño Carta Estándar (21.5 x 28 cm)'}
                    </span>
                  </div>

                  {/* Sustrato / Papel */}
                  <div className="sm:col-span-2 bg-[#241e18] p-3 rounded-lg border border-white/5">
                    <span className="text-[#a58a8e] text-[11px] block">Sustrato / Papel / Material:</span>
                    <span className="font-semibold text-white">
                      {job.paperStock || 'Couche 300g brillante importado'}
                    </span>
                  </div>

                  {/* Prensa / Máquina Asignada */}
                  <div className="bg-[#241e18] p-3 rounded-lg border border-white/5">
                    <span className="text-[#a58a8e] text-[11px] block">Prensa / Máquina:</span>
                    <span className="font-semibold text-amber-300">
                      {job.machineAssigned || 'Prensa Heidelberg Speedmaster 4C'}
                    </span>
                  </div>

                  {/* Tintas / Colores */}
                  <div className="bg-[#241e18] p-3 rounded-lg border border-white/5">
                    <span className="text-[#a58a8e] text-[11px] block">Esquema de Color / Tintas:</span>
                    <span className="font-semibold text-white">
                      {job.colorSpec || '4x4 CMYK Frente y Vuelta'}
                    </span>
                  </div>
                </div>

                {/* Acabados Especiales */}
                <div>
                  <span className="text-[#a58a8e] text-[11px] uppercase font-bold tracking-wider block mb-2">
                    Procesos y Acabados de Taller:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(job.finishes || [
                      'Laminado Mate Soft-Touch',
                      'Barniz a Registro UV',
                      'Suaje / Plecado',
                      'Refile a escuadra'
                    ]).map((finish, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 bg-[#8d153e]/20 text-[#ffb1bf] text-xs font-semibold rounded-lg border border-[#ffb1bf]/20 flex items-center gap-1.5"
                      >
                        <Scissors className="w-3.5 h-3.5 text-[#ff9aaf]" />
                        <span>{finish}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Observaciones Técnicas */}
                {job.technicalNotes && (
                  <div className="bg-[#291e1d] p-3 rounded-lg border border-[#ffb1bf]/20 text-xs">
                    <span className="text-[#ffb1bf] font-bold block mb-1">
                      Instrucciones Especiales del Prensista:
                    </span>
                    <p className="text-[#ebe1d9] leading-relaxed">
                      {job.technicalNotes}
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column (5 cols): Prepress, Personnel, Production Log */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Prepress and File Validation Card */}
              <div className="bg-[#1f1b16] rounded-xl p-4 sm:p-5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ffb1bf] uppercase tracking-wider border-b border-white/5 pb-2">
                  <FileText className="w-4 h-4" />
                  <span>Pre-prensa & Control de Arte</span>
                </div>

                <div className="bg-[#241e18] p-3 rounded-lg border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a58a8e] text-[11px]">Archivo de Impresión:</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Vo.Bo. Aprobado
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-mono font-medium truncate">
                    <FileText className="w-4 h-4 text-[#ffb1bf] shrink-0" />
                    <span className="truncate">{job.prepressFile || `${job.projectName.replace(/\s+/g, '_')}_Final_Curvas.pdf`}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#241e18] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[#a58a8e] text-[10px] block">Operador de Prensa:</span>
                    <span className="font-semibold text-white mt-0.5 block truncate">
                      {job.operatorName || job.assignees[0]?.name || 'Juan Díaz'}
                    </span>
                  </div>
                  <div className="bg-[#241e18] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[#a58a8e] text-[10px] block">Monto Producción:</span>
                    <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
                      {formatMXN(job.totalAmount || 8500)} MXN
                    </span>
                  </div>
                </div>
              </div>

              {/* Workshop Production Log & Add Note Form */}
              <div className="bg-[#1f1b16] rounded-xl p-4 sm:p-5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#ffb1bf] uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>Bitácora de Taller</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a58a8e]">
                    {combinedLogs.length} Entradas
                  </span>
                </div>

                {/* Log List */}
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {combinedLogs.map((log, index) => (
                    <div key={index} className="p-2.5 bg-[#251f19] rounded-lg border border-white/5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#a58a8e]">
                        <span className="font-semibold text-[#ffb1bf]">{log.user}</span>
                        <span className="font-mono">{log.date}</span>
                      </div>
                      <p className="text-[#ebe1d9] text-[11px] leading-relaxed">
                        {log.message}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add Quick Log Note Form */}
                <form onSubmit={handleAddNote} className="pt-2 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escribir nota de taller / avance..."
                    className="flex-1 bg-[#2a241e] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] placeholder-[#a58a8e] outline-none focus:border-[#ffb1bf]/50"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

          </div>

          {/* Printable Signature & Quality Checklist Area (for printed shop traveler) */}
          <div className="hidden print:block pt-8 mt-8 border-t-2 border-gray-300">
            <h4 className="text-xs font-bold text-gray-800 uppercase mb-3">
              Checklist de Control de Calidad y Firmas de Liberación:
            </h4>
            
            <div className="grid grid-cols-3 gap-4 text-[10px] text-gray-700 mb-8 border border-gray-300 p-3">
              <div>
                <p className="font-bold mb-1">Pre-prensa / Placas:</p>
                <p>[  ] Revisión de sangrías / rebases</p>
                <p>[  ] Curvas y fuentes incrustadas</p>
                <p>[  ] CTP / Placas verificadas</p>
              </div>
              <div>
                <p className="font-bold mb-1">Prensa / Impresión:</p>
                <p>[  ] Tono y densitometría aprobada</p>
                <p>[  ] Registro de tintas perfecto</p>
                <p>[  ] Secado y tiro adecuado</p>
              </div>
              <div>
                <p className="font-bold mb-1">Acabados & Empaque:</p>
                <p>[  ] Suaje / Corte a escuadra</p>
                <p>[  ] Conteo de piezas verificado</p>
                <p>[  ] Empaque etiquetado y protegido</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 text-center text-[10px] text-gray-600 pt-6">
              <div>
                <div className="border-t border-gray-400 w-32 mx-auto mb-1"></div>
                <p className="font-semibold">Firma Operador Prensa</p>
              </div>
              <div>
                <div className="border-t border-gray-400 w-32 mx-auto mb-1"></div>
                <p className="font-semibold">Firma Supervisor Calidad</p>
              </div>
              <div>
                <div className="border-t border-gray-400 w-32 mx-auto mb-1"></div>
                <p className="font-semibold">Firma Recepción Cliente</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#1f1b16] border-t border-white/10 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#a58a8e]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Orden controlada bajo estándar de producción LCG</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2a241e] hover:bg-[#38312a] text-[#ebe1d9] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            >
              <Printer className="w-4 h-4 text-[#ffb1bf]" />
              <span>Imprimir OT</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md"
            >
              Aceptar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
