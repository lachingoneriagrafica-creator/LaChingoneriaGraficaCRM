import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  ArrowRight, 
  MoreVertical,
  Inbox,
  Eye
} from 'lucide-react';
import { ProductionJob, ProductionStatus, Quote, Client } from '../types';

interface DashboardViewProps {
  jobs: ProductionJob[];
  quotes?: Quote[];
  clients?: Client[];
  onNewQuoteClick: () => void;
  onViewAllOrders: () => void;
  onSelectJob: (job: ProductionJob) => void;
  onUpdateJobStatus: (jobId: string, newStatus: ProductionStatus) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs = [],
  quotes = [],
  clients = [],
  onNewQuoteClick,
  onViewAllOrders,
  onSelectJob,
  onUpdateJobStatus
}) => {
  const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null);

  // Compute 100% dynamic live statistics based on real state
  const activeQuotesCount = quotes.filter(q => q.status !== 'CANCELLED').length;
  const inPrintCount = jobs.filter(j => j.status === 'impresion').length;
  const urgentCount = jobs.filter(j => j.isUrgent).length;
  const registeredClientsCount = clients.length.toLocaleString('es-MX');
  const totalSales = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const totalSalesFormatted = '$' + totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getStatusBadge = (status: ProductionStatus) => {
    switch (status) {
      case 'impresion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> En Impresión
          </span>
        );
      case 'preprensa':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-400/10 text-blue-400 border border-blue-400/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Pre-prensa
          </span>
        );
      case 'finalizado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Terminado
          </span>
        );
      case 'por_aprobar':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-400/10 text-purple-400 border border-purple-400/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Por Aprobar
          </span>
        );
      case 'en_cola':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3e3833] text-[#debfc3] border border-white/10 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#debfc3]" /> En Cola
          </span>
        );
    }
  };

  const recentOrders = jobs.slice(0, 6);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1440px] mx-auto w-full flex-1 flex flex-col gap-8 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8d153e]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl lg:text-4xl text-[#ebe1d9] tracking-tight">
            Vista General
          </h1>
          <p className="text-sm sm:text-base text-[#debfc3] mt-1">
            Resumen en tiempo real de producción y cotizaciones
          </p>
        </div>
        <button
          onClick={onNewQuoteClick}
          className="bg-[#8d153e] hover:bg-[#a61c4b] active:bg-[#721031] text-white font-headline font-semibold py-3 px-5 rounded-lg flex items-center gap-2 shadow-lg border border-[#ffb1bf]/20 transition-all cursor-pointer hover:scale-101 active:scale-98"
        >
          <PlusCircle className="w-5 h-5 text-[#ff9aaf]" />
          <span>Nueva Cotización</span>
        </button>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group hover:border-[#ffb1bf]/30 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#8d153e]/10 rounded-full blur-xl group-hover:bg-[#8d153e]/20 transition-all" />
          <div className="flex justify-between items-start z-10">
            <div className="w-10 h-10 rounded-lg bg-[#17130e] flex items-center justify-center border border-white/5 shadow-inner">
              <FileText className="w-5 h-5 text-[#ccc5bf]" />
            </div>
            {activeQuotesCount > 0 && (
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                <TrendingUp className="w-3.5 h-3.5" /> Activas
              </span>
            )}
          </div>
          <div className="z-10 mt-1">
            <p className="text-xs font-semibold text-[#debfc3] uppercase tracking-wider mb-1">
              Cotizaciones Activas
            </p>
            <h2 className="font-headline font-bold text-3xl text-[#ebe1d9]">
              {activeQuotesCount}
            </h2>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group hover:border-[#ffb1bf]/30 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#8d153e]/10 rounded-full blur-xl group-hover:bg-[#8d153e]/20 transition-all" />
          <div className="flex justify-between items-start z-10">
            <div className="w-10 h-10 rounded-lg bg-[#17130e] flex items-center justify-center border border-white/5 shadow-inner">
              <Printer className="w-5 h-5 text-[#ccc5bf]" />
            </div>
            {urgentCount > 0 && (
              <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                <Clock className="w-3.5 h-3.5" /> {urgentCount} urgentes
              </span>
            )}
          </div>
          <div className="z-10 mt-1">
            <p className="text-xs font-semibold text-[#debfc3] uppercase tracking-wider mb-1">
              Órdenes en Impresión
            </p>
            <h2 className="font-headline font-bold text-3xl text-[#ebe1d9]">
              {inPrintCount}
            </h2>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group hover:border-[#ffb1bf]/30 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#8d153e]/10 rounded-full blur-xl group-hover:bg-[#8d153e]/20 transition-all" />
          <div className="flex justify-between items-start z-10">
            <div className="w-10 h-10 rounded-lg bg-[#17130e] flex items-center justify-center border border-white/5 shadow-inner">
              <Users className="w-5 h-5 text-[#ccc5bf]" />
            </div>
          </div>
          <div className="z-10 mt-1">
            <p className="text-xs font-semibold text-[#debfc3] uppercase tracking-wider mb-1">
              Clientes Registrados
            </p>
            <h2 className="font-headline font-bold text-3xl text-[#ebe1d9]">
              {registeredClientsCount}
            </h2>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group hover:border-[#ffb1bf]/30 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#8d153e]/10 rounded-full blur-xl group-hover:bg-[#8d153e]/20 transition-all" />
          <div className="flex justify-between items-start z-10">
            <div className="w-10 h-10 rounded-lg bg-[#17130e] flex items-center justify-center border border-white/5 shadow-inner">
              <DollarSign className="w-5 h-5 text-[#ccc5bf]" />
            </div>
          </div>
          <div className="z-10 mt-1">
            <p className="text-xs font-semibold text-[#debfc3] uppercase tracking-wider mb-1">
              Preventas Totales
            </p>
            <h2 className="font-headline font-bold text-3xl text-[#ebe1d9]">
              {totalSalesFormatted}
            </h2>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="flex-1 flex flex-col gap-4 mt-2">
        <div className="flex justify-between items-center">
          <h3 className="font-headline font-semibold text-xl text-[#ebe1d9]">
            Órdenes Recientes
          </h3>
          {jobs.length > 0 && (
            <button
              onClick={onViewAllOrders}
              className="text-[#ffb1bf] hover:text-white font-medium text-sm flex items-center gap-1.5 group transition-colors cursor-pointer"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-white/5 bg-[#2e2924]/60">
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                    ID de Orden
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                    Fecha de Entrega
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-5 text-center text-[#debfc3]">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#a58a8e]">
                          <Inbox className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-[#ebe1d9]">No hay órdenes de producción registradas</p>
                        <p className="text-xs text-[#a58a8e] max-w-sm">
                          Cuando apruebes una cotización y la conviertas a orden de trabajo, aparecerá aquí y en el tablero Kanban.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#241f1a]/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectJob(order)}
                    >
                      <td className="py-4 px-5 font-mono text-[#ffb1bf] font-medium">
                        {order.orderNumber}
                      </td>
                      <td className="py-4 px-5 text-[#ebe1d9] font-medium">
                        {order.clientName}
                      </td>
                      <td className="py-4 px-5 text-[#debfc3]">
                        {order.projectName}
                      </td>
                      <td className="py-4 px-5 text-[#debfc3] font-mono text-xs">
                        {order.deliveryDate}
                      </td>
                      <td className="py-4 px-5">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-5 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveMenuJobId(activeMenuJobId === order.id ? null : order.id)}
                          className="text-[#a58a8e] hover:text-[#ffb1bf] p-1.5 rounded hover:bg-[#39342f] transition-colors cursor-pointer"
                          title="Opciones"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuJobId === order.id && (
                          <div className="absolute right-4 top-10 w-48 bg-[#1f1b16] border border-white/10 rounded-lg shadow-2xl z-50 py-1.5 text-left text-xs">
                            <button
                              onClick={() => {
                                onSelectJob(order);
                                setActiveMenuJobId(null);
                              }}
                              className="w-full px-3 py-2 text-[#ebe1d9] hover:bg-[#2e2924] flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#ffb1bf]" /> Ver en Kanban
                            </button>
                            <div className="border-t border-white/5 my-1" />
                            <div className="px-3 py-1 text-[10px] text-[#a58a8e] uppercase font-bold tracking-wider">
                              Cambiar Estado
                            </div>
                            <button
                              onClick={() => {
                                onUpdateJobStatus(order.id, 'preprensa');
                                setActiveMenuJobId(null);
                              }}
                              className="w-full px-3 py-1.5 text-[#ebe1d9] hover:bg-[#2e2924] flex items-center gap-2 cursor-pointer"
                            >
                              <span className="w-2 h-2 rounded-full bg-blue-400" /> A Pre-prensa
                            </button>
                            <button
                              onClick={() => {
                                onUpdateJobStatus(order.id, 'impresion');
                                setActiveMenuJobId(null);
                              }}
                              className="w-full px-3 py-1.5 text-[#ebe1d9] hover:bg-[#2e2924] flex items-center gap-2 cursor-pointer"
                            >
                              <span className="w-2 h-2 rounded-full bg-amber-400" /> A Impresión
                            </button>
                            <button
                              onClick={() => {
                                onUpdateJobStatus(order.id, 'finalizado');
                                setActiveMenuJobId(null);
                              }}
                              className="w-full px-3 py-1.5 text-[#ebe1d9] hover:bg-[#2e2924] flex items-center gap-2 cursor-pointer"
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-400" /> A Terminado
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
