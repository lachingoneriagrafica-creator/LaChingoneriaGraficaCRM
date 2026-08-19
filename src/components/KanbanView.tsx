import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  RotateCw, 
  CheckCircle, 
  MoreHorizontal, 
  Clock, 
  Tag, 
  ChevronRight, 
  ChevronLeft,
  Trash2,
  Edit2,
  Eye,
  FileText,
  Layers,
  Scissors,
  X
} from 'lucide-react';
import { ProductionJob, ProductionStatus } from '../types';
import { WorkOrderDetailModal } from './WorkOrderDetailModal';

interface KanbanViewProps {
  jobs: ProductionJob[];
  onUpdateJobStatus: (jobId: string, newStatus: ProductionStatus) => void;
  onAddNewJob: (job: ProductionJob) => void;
  onDeleteJob: (jobId: string) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  jobs,
  onUpdateJobStatus,
  onAddNewJob,
  onDeleteJob
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterUrgentOnly, setFilterUrgentOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'amount'>('date');
  const [showNewJobModal, setShowNewJobModal] = useState<boolean>(false);
  const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null);

  // Work Order Detail Modal state
  const [selectedWorkOrderJob, setSelectedWorkOrderJob] = useState<ProductionJob | null>(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState<boolean>(false);

  // New job modal form state
  const [newJobClient, setNewJobClient] = useState('');
  const [newJobProject, setNewJobProject] = useState('');
  const [newJobCategory, setNewJobCategory] = useState('Papelería');
  const [newJobDelivery, setNewJobDelivery] = useState('28 Oct, 2023');
  const [newJobStatus, setNewJobStatus] = useState<ProductionStatus>('por_aprobar');
  const [newJobUrgent, setNewJobUrgent] = useState(false);
  const [newJobQuantity, setNewJobQuantity] = useState(1000);
  const [newJobPaper, setNewJobPaper] = useState('Couche 300g brillante');
  const [newJobDimensions, setNewJobDimensions] = useState('Carta (21.5 x 28 cm)');

  // Close card menus on outside click
  useEffect(() => {
    const handleGlobalClick = () => {
      if (activeMenuJobId) {
        setActiveMenuJobId(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [activeMenuJobId]);

  // Define the 4 columns
  const columns: {
    id: ProductionStatus;
    title: string;
    dotColor: string;
    stripeColor: string;
    pulse?: boolean;
  }[] = [
    {
      id: 'por_aprobar',
      title: 'Cotizaciones / Por Aprobar',
      dotColor: 'bg-[#cac6be]',
      stripeColor: 'bg-[#cac6be]'
    },
    {
      id: 'preprensa',
      title: 'En Pre-prensa',
      dotColor: 'bg-[#8d153e]',
      stripeColor: 'bg-[#8d153e]'
    },
    {
      id: 'impresion',
      title: 'En Impresión',
      dotColor: 'bg-[#ffb1bf]',
      stripeColor: 'bg-[#ffb1bf]',
      pulse: true
    },
    {
      id: 'finalizado',
      title: 'Finalizado / Listo para Entrega',
      dotColor: 'bg-[#a58a8e]',
      stripeColor: 'bg-[#a58a8e]'
    }
  ];

  // Filter & sort logic
  let filteredJobs = jobs.filter(job => {
    if (filterCategory !== 'ALL' && job.category !== filterCategory) return false;
    if (filterUrgentOnly && !job.isUrgent && !job.isDelayed) return false;
    return true;
  });

  if (sortBy === 'name') {
    filteredJobs = [...filteredJobs].sort((a, b) => a.clientName.localeCompare(b.clientName));
  } else if (sortBy === 'amount') {
    filteredJobs = [...filteredJobs].sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
  }

  const getJobsByColumn = (status: ProductionStatus) => {
    return filteredJobs.filter(j => j.status === status);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobClient.trim() || !newJobProject.trim()) return;

    const newJob: ProductionJob = {
      id: 'job_' + Date.now(),
      orderNumber: '#ORD-' + Math.floor(8800 + Math.random() * 200),
      clientName: newJobClient,
      projectName: newJobProject,
      category: newJobCategory,
      categoryBadge: newJobCategory,
      deliveryDate: newJobDelivery,
      status: newJobStatus,
      progress: newJobStatus === 'impresion' ? 50 : newJobStatus === 'finalizado' ? 100 : 15,
      isUrgent: newJobUrgent,
      quantity: Number(newJobQuantity) || 1000,
      paperStock: newJobPaper,
      dimensions: newJobDimensions,
      machineAssigned: newJobCategory === 'Gran Formato' ? 'Plotter Roland TrueVIS' : newJobCategory === 'Etiquetas' ? 'Plotter Mimaki UV' : 'Prensa Heidelberg Speedmaster SM74',
      colorSpec: '4x4 CMYK Frente/Vuelta',
      finishes: ['Refile a escuadra', 'Control de calidad estándar'],
      prepressFile: `${newJobProject.replace(/\s+/g, '_')}_Final.pdf`,
      prepressApproved: newJobStatus !== 'por_aprobar',
      operatorName: 'Taller LCG',
      assignees: [{ initials: 'LC', name: 'La Chingonería Gráfica' }],
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddNewJob(newJob);
    setShowNewJobModal(false);
    setNewJobClient('');
    setNewJobProject('');
  };

  const moveJob = (jobId: string, currentStatus: ProductionStatus, direction: 'next' | 'prev', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const statusOrder: ProductionStatus[] = ['por_aprobar', 'preprensa', 'impresion', 'finalizado'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (direction === 'next' && currentIndex < statusOrder.length - 1) {
      onUpdateJobStatus(jobId, statusOrder[currentIndex + 1]);
      if (selectedWorkOrderJob && selectedWorkOrderJob.id === jobId) {
        setSelectedWorkOrderJob({ ...selectedWorkOrderJob, status: statusOrder[currentIndex + 1] });
      }
    } else if (direction === 'prev' && currentIndex > 0) {
      onUpdateJobStatus(jobId, statusOrder[currentIndex - 1]);
      if (selectedWorkOrderJob && selectedWorkOrderJob.id === jobId) {
        setSelectedWorkOrderJob({ ...selectedWorkOrderJob, status: statusOrder[currentIndex - 1] });
      }
    }
  };

  const handleOpenWorkOrder = (job: ProductionJob, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedWorkOrderJob(job);
    setIsWorkOrderModalOpen(true);
    setActiveMenuJobId(null);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'papelería':
      case 'papeleria':
        return 'text-[#ff9aaf] bg-[#8d153e]/20 border border-[#ffb1bf]/20';
      case 'etiquetas':
        return 'text-[#ffb1bf] bg-[#8d153e]/30 border border-[#ffb1bf]/30';
      case 'empaque':
        return 'text-[#ccc5bf] bg-[#4c4843]/60 border border-white/10';
      case 'gran formato':
        return 'text-[#ffb1bf] bg-[#ab2e53]/30 border border-[#ffb1bf]/30';
      default:
        return 'text-[#debfc3] bg-[#2e2924] border border-white/5';
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Kanban Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h2 className="font-headline font-bold text-xl sm:text-2xl text-[#ebe1d9]">
            Kanban de Producción
          </h2>
          <p className="text-xs sm:text-sm text-[#debfc3]">
            Haz clic en cualquier tarjeta para abrir su <strong className="text-[#ffb1bf]">Orden de Trabajo técnica</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-[#241f1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#debfc3]">
            <Filter className="w-3.5 h-3.5 text-[#ffb1bf]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-[#ebe1d9] text-xs outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#1f1b16]">Todas las categorías</option>
              <option value="Papelería" className="bg-[#1f1b16]">Papelería</option>
              <option value="Etiquetas" className="bg-[#1f1b16]">Etiquetas</option>
              <option value="Empaque" className="bg-[#1f1b16]">Empaque</option>
              <option value="Gran Formato" className="bg-[#1f1b16]">Gran Formato</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5 bg-[#241f1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#debfc3]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#ffb1bf]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-[#ebe1d9] text-xs outline-none cursor-pointer"
            >
              <option value="date" className="bg-[#1f1b16]">Ordenar por fecha</option>
              <option value="name" className="bg-[#1f1b16]">Ordenar por cliente</option>
              <option value="amount" className="bg-[#1f1b16]">Ordenar por monto</option>
            </select>
          </div>

          {/* New Job CTA */}
          <button
            onClick={() => setShowNewJobModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#ff9aaf]" />
            <span>Nuevo Trabajo</span>
          </button>

          <span className="text-xs text-[#a58a8e] hidden md:inline font-mono">
            {filteredJobs.length} Trabajos Activos
          </span>
        </div>
      </div>

      {/* Kanban Board Horizontal Scrolling Canvas */}
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 custom-scrollbar min-w-full">
        {columns.map((column) => {
          const colJobs = getJobsByColumn(column.id);

          return (
            <div
              key={column.id}
              className="flex flex-col w-[300px] sm:w-[320px] shrink-0 bg-[#1f1b16] rounded-xl border border-white/5 shadow-lg"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-white/5 bg-[#241f1a]/90 rounded-t-xl flex justify-between items-center sticky top-0 z-10 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor} ${column.pulse ? 'animate-pulse' : ''}`} />
                  <h3 className="font-headline font-semibold text-xs sm:text-sm text-[#ebe1d9] truncate">
                    {column.title}
                  </h3>
                </div>
                <span className="bg-[#39342f] text-[#ebe1d9] font-mono text-xs px-2 py-0.5 rounded-md font-bold">
                  {colJobs.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1 custom-scrollbar">
                {colJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleOpenWorkOrder(job)}
                    className={`bg-[#17130e] rounded-lg p-3.5 border transition-all duration-200 relative group shadow-md hover:border-[#ffb1bf]/50 hover:bg-[#201a14] cursor-pointer ${
                      job.status === 'impresion'
                        ? 'border-[#8d153e]/60 bg-[#241f1a]/50'
                        : job.status === 'finalizado'
                        ? 'opacity-75 hover:opacity-100 border-white/5'
                        : 'border-white/10'
                    }`}
                  >
                    {/* Status Stripe (rounded along card's left edge) */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${column.stripeColor}`} />

                    {/* Top Row: Category badge & 3-Dots Options Menu */}
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${getCategoryBadgeClass(job.category)}`}>
                        {job.category}
                      </span>

                      {/* 3-dots Menu container with Stop Propagation */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuJobId(activeMenuJobId === job.id ? null : job.id);
                          }}
                          className="text-[#a58a8e] hover:text-[#ffb1bf] p-1 rounded-md hover:bg-[#2a241e] transition-colors cursor-pointer"
                          title="Opciones de orden"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Unclipped Card Dropdown Menu with High Z-Index & Clean Positioning */}
                        {activeMenuJobId === job.id && (
                          <div 
                            className="absolute right-0 top-7 w-48 bg-[#1f1b16] border border-white/15 rounded-xl shadow-2xl z-50 py-1.5 text-left text-xs divide-y divide-white/5 animate-in fade-in-50 zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-1">
                              <span className="text-[10px] text-[#ffb1bf] uppercase font-bold tracking-wider">
                                {job.orderNumber}
                              </span>
                            </div>

                            {/* View Work Order action */}
                            <div className="py-1">
                              <button
                                onClick={(e) => handleOpenWorkOrder(job, e)}
                                className="w-full px-3 py-2 text-[#ebe1d9] hover:bg-[#2e2924] text-left flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#ffb1bf]" />
                                <span>Ver Orden de Trabajo</span>
                              </button>
                            </div>

                            {/* Move Stage submenu */}
                            <div className="py-1">
                              <div className="px-3 py-1 text-[10px] text-[#a58a8e] uppercase font-semibold">
                                Mover Etapa
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateJobStatus(job.id, 'por_aprobar');
                                  setActiveMenuJobId(null);
                                }}
                                className={`w-full px-3 py-1.5 text-left transition-colors ${
                                  job.status === 'por_aprobar' ? 'text-[#ffb1bf] font-bold bg-[#2e2924]/60' : 'text-[#ebe1d9] hover:bg-[#2e2924]'
                                }`}
                              >
                                1. Por Aprobar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateJobStatus(job.id, 'preprensa');
                                  setActiveMenuJobId(null);
                                }}
                                className={`w-full px-3 py-1.5 text-left transition-colors ${
                                  job.status === 'preprensa' ? 'text-[#ffb1bf] font-bold bg-[#2e2924]/60' : 'text-[#ebe1d9] hover:bg-[#2e2924]'
                                }`}
                              >
                                2. En Pre-prensa
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateJobStatus(job.id, 'impresion');
                                  setActiveMenuJobId(null);
                                }}
                                className={`w-full px-3 py-1.5 text-left transition-colors ${
                                  job.status === 'impresion' ? 'text-[#ffb1bf] font-bold bg-[#2e2924]/60' : 'text-[#ebe1d9] hover:bg-[#2e2924]'
                                }`}
                              >
                                3. En Impresión
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateJobStatus(job.id, 'finalizado');
                                  setActiveMenuJobId(null);
                                }}
                                className={`w-full px-3 py-1.5 text-left transition-colors ${
                                  job.status === 'finalizado' ? 'text-emerald-400 font-bold bg-[#2e2924]/60' : 'text-[#ebe1d9] hover:bg-[#2e2924]'
                                }`}
                              >
                                4. Finalizado
                              </button>
                            </div>

                            {/* Delete action */}
                            <div className="pt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteJob(job.id);
                                  setActiveMenuJobId(null);
                                }}
                                className="w-full px-3 py-1.5 text-[#ffb4ab] hover:bg-[#8d153e]/20 text-left flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar Orden</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Client & Project title */}
                    <div className="pl-2 mb-2">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-sm text-[#ebe1d9] group-hover:text-white ${job.status === 'finalizado' ? 'line-through decoration-white/30 text-[#debfc3]' : ''}`}>
                          {job.clientName}
                        </h4>
                        <span className="font-mono text-[11px] text-[#ffb1bf] font-medium">
                          {job.orderNumber}
                        </span>
                      </div>
                      <p className="text-xs text-[#debfc3] mt-0.5 line-clamp-2">
                        {job.projectName}
                      </p>
                    </div>

                    {/* Specifications preview line */}
                    {(job.paperStock || job.quantity) && (
                      <div className="pl-2 mb-2 text-[11px] text-[#a58a8e] flex items-center gap-2 truncate">
                        {job.quantity && (
                          <span className="font-mono text-[#debfc3]">
                            {job.quantity.toLocaleString()} pzas
                          </span>
                        )}
                        {job.dimensions && (
                          <span>• {job.dimensions}</span>
                        )}
                      </div>
                    )}

                    {/* Progress Bar (for preprensa / impresion) */}
                    {job.progress !== undefined && job.status !== 'finalizado' && (
                      <div className="w-[calc(100%-8px)] ml-2 bg-[#39342f] h-1.5 rounded-full mb-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            job.status === 'impresion' ? 'bg-[#ffb1bf]' : 'bg-[#8d153e]'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Footer Row: Status badge, Date, Assignees & quick shift buttons */}
                    <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2 pl-2">
                      {/* Date or Urgency Tag */}
                      {job.isDelayed ? (
                        <div className="flex items-center gap-1 text-[#ffb4ab] text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{job.delayedText || 'Atrasado'}</span>
                        </div>
                      ) : job.status === 'impresion' ? (
                        <div className="flex items-center gap-1 text-[#ffb1bf] text-xs font-semibold animate-pulse">
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Imprimiendo...</span>
                        </div>
                      ) : job.status === 'finalizado' ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Listo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[#a58a8e] text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{job.deliveryDate}</span>
                        </div>
                      )}

                      {/* Right controls: Quick move arrows + Assignee Avatars */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => moveJob(job.id, job.status, 'prev', e)}
                          disabled={column.id === 'por_aprobar'}
                          className="p-1 text-[#a58a8e] hover:text-white disabled:opacity-20 disabled:hover:text-[#a58a8e] rounded transition-colors cursor-pointer"
                          title="Mover a etapa anterior"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => moveJob(job.id, job.status, 'next', e)}
                          disabled={column.id === 'finalizado'}
                          className="p-1 text-[#a58a8e] hover:text-white disabled:opacity-20 disabled:hover:text-[#a58a8e] rounded transition-colors cursor-pointer"
                          title="Mover a siguiente etapa"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Assignee Avatar Badges */}
                        <div className="flex -space-x-1.5 ml-1">
                          {job.assignees.map((assignee, i) => (
                            <div
                              key={i}
                              title={assignee.name}
                              className="w-6 h-6 rounded-full bg-[#39342f] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#ebe1d9]"
                            >
                              {assignee.initials}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {colJobs.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#a58a8e] border border-dashed border-white/5 rounded-lg">
                    Sin trabajos en esta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Work Order Detail Modal (Orden de Trabajo técnica) */}
      <WorkOrderDetailModal
        job={selectedWorkOrderJob}
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        onUpdateJobStatus={onUpdateJobStatus}
      />

      {/* New Job Modal Form */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1f1b16] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl text-xs space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ffb1bf]" />
                <h3 className="font-headline font-bold text-base text-[#ebe1d9]">
                  Nueva Orden de Trabajo
                </h3>
              </div>
              <button onClick={() => setShowNewJobModal(false)} className="text-[#debfc3] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#debfc3] uppercase">Cliente / Empresa</label>
                <input
                  type="text"
                  required
                  value={newJobClient}
                  onChange={(e) => setNewJobClient(e.target.value)}
                  placeholder="Ej. Boutique Coffee Co"
                  className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-sm text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#debfc3] uppercase">Nombre del Proyecto / Trabajo</label>
                <input
                  type="text"
                  required
                  value={newJobProject}
                  onChange={(e) => setNewJobProject(e.target.value)}
                  placeholder="Ej. 1000 Etiquetas Foil Oro"
                  className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-sm text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#debfc3] uppercase">Categoría</label>
                  <select
                    value={newJobCategory}
                    onChange={(e) => setNewJobCategory(e.target.value)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  >
                    <option value="Papelería">Papelería</option>
                    <option value="Etiquetas">Etiquetas</option>
                    <option value="Empaque">Empaque</option>
                    <option value="Gran Formato">Gran Formato</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#debfc3] uppercase">Etapa Inicial</label>
                  <select
                    value={newJobStatus}
                    onChange={(e) => setNewJobStatus(e.target.value as any)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  >
                    <option value="por_aprobar">Por Aprobar</option>
                    <option value="preprensa">En Pre-prensa</option>
                    <option value="impresion">En Impresión</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#debfc3] uppercase">Tiraje (Piezas)</label>
                  <input
                    type="number"
                    value={newJobQuantity}
                    onChange={(e) => setNewJobQuantity(Number(e.target.value))}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#debfc3] uppercase">Sustrato / Papel</label>
                  <input
                    type="text"
                    value={newJobPaper}
                    onChange={(e) => setNewJobPaper(e.target.value)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#debfc3] uppercase">Fecha de Entrega</label>
                  <input
                    type="text"
                    value={newJobDelivery}
                    onChange={(e) => setNewJobDelivery(e.target.value)}
                    placeholder="28 Oct, 2023"
                    className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="urgentCheck"
                    checked={newJobUrgent}
                    onChange={(e) => setNewJobUrgent(e.target.checked)}
                    className="rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                  />
                  <label htmlFor="urgentCheck" className="text-xs text-[#debfc3] font-semibold cursor-pointer">
                    Marcar como Urgente
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#debfc3] hover:bg-[#2e2924]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Crear Orden de Trabajo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
