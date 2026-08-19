import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  User, 
  FileText, 
  X, 
  Phone, 
  Mail, 
  Building2, 
  Search, 
  Tag as TagIcon, 
  Trash2,
  Database,
  MapPin,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Client, ClientTimelineEvent } from '../types';

interface CRMViewProps {
  clients: Client[];
  timelineEvents: Record<string, ClientTimelineEvent[]>;
  onAddNewClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onNewQuoteForClient: (client: Client) => void;
}

export const CRMView: React.FC<CRMViewProps> = ({
  clients,
  timelineEvents,
  onAddNewClient,
  onUpdateClient,
  onDeleteClient,
  onNewQuoteForClient
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [isSlideoverOpen, setIsSlideoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'historial' | 'cotizaciones'>('historial');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Form state for new/edited client
  const [formEmpresa, setFormEmpresa] = useState('');
  const [formContacto, setFormContacto] = useState('');
  const [formCorreo, setFormCorreo] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formRFC, setFormRFC] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotas, setFormNotas] = useState('');
  const [formTags, setFormTags] = useState('VIP, CDMX');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId) || (clients.length > 0 ? clients[0] : null);
  const clientEvents = selectedClient ? (timelineEvents[selectedClient.id] || []) : [];

  // Extract all distinct tags across all clients for filtering
  const allAvailableTags = Array.from(
    new Set(clients.flatMap(c => c.tags || []).filter(Boolean))
  );

  // Filter clients
  const filteredClients = clients.filter(c => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(term) ||
      (c.contactPerson || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.rfc || '').toLowerCase().includes(term);
    
    if (selectedTagFilter !== 'ALL') {
      return matchesSearch && c.tags?.includes(selectedTagFilter);
    }
    return matchesSearch;
  });

  const handleOpenAddClient = () => {
    setEditingClient(null);
    setFormEmpresa('');
    setFormContacto('');
    setFormCorreo('');
    setFormTelefono('');
    setFormRFC('');
    setFormAddress('');
    setFormNotas('');
    setFormTags('VIP, CDMX');
    setIsSlideoverOpen(true);
  };

  const handleOpenEditClient = (client: Client) => {
    setEditingClient(client);
    setFormEmpresa(client.name);
    setFormContacto(client.contactPerson);
    setFormCorreo(client.email);
    setFormTelefono(client.phone);
    setFormRFC(client.rfc || '');
    setFormAddress(client.address || '');
    setFormNotas(client.notes || '');
    setFormTags(client.tags ? client.tags.join(', ') : '');
    setIsSlideoverOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpresa.trim() || !formContacto.trim()) {
      alert('Por favor complete los campos obligatorios (Empresa y Contacto).');
      return;
    }

    const initials = formEmpresa
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'CL';
    
    const tagList = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingClient) {
      const updated: Client = {
        ...editingClient,
        name: formEmpresa.trim(),
        contactPerson: formContacto.trim(),
        email: formCorreo.trim(),
        phone: formTelefono.trim(),
        rfc: formRFC.trim().toUpperCase(),
        address: formAddress.trim(),
        notes: formNotas.trim(),
        tags: tagList.length ? tagList : ['Cliente'],
        initials
      };
      onUpdateClient(updated);
    } else {
      const newClient: Client = {
        id: 'client_' + Date.now(),
        name: formEmpresa.trim(),
        contactPerson: formContacto.trim(),
        email: formCorreo.trim(),
        phone: formTelefono.trim(),
        rfc: formRFC.trim().toUpperCase(),
        address: formAddress.trim(),
        notes: formNotas.trim(),
        tags: tagList.length ? tagList : ['Cliente'],
        initials,
        createdAt: new Date().toISOString()
      };
      onAddNewClient(newClient);
      setSelectedClientId(newClient.id);
    }

    setIsSlideoverOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingClient) return;
    onDeleteClient(deletingClient.id);
    if (selectedClientId === deletingClient.id) {
      const remaining = clients.filter(c => c.id !== deletingClient.id);
      setSelectedClientId(remaining[0]?.id || '');
    }
    setDeletingClient(null);
  };

  return (
    <div className="flex-1 px-4 lg:px-8 py-6 max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row gap-6 h-[calc(100vh-64px)] overflow-hidden">
      
      {/* CRM Directory Column (Min 60%) */}
      <section className="flex-1 flex flex-col min-w-full lg:min-w-[60%] h-full overflow-hidden">
        
        {/* Directory Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[#ebe1d9]">
                Directorio de Clientes
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/20">
                <Database className="w-3 h-3" /> Firestore
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#debfc3] mt-0.5">
              Gestión comercial, RFCs, condiciones de crédito e historial de producción.
            </p>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto items-center flex-wrap">
            {/* Filter Toggle */}
            <div className="flex items-center gap-1 bg-[#1f1b16] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#debfc3]">
              <Filter className="w-3.5 h-3.5 text-[#ffb1bf]" />
              <select
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                className="bg-transparent border-none text-xs text-[#ebe1d9] outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#1f1b16]">Todos los tags ({clients.length})</option>
                {allAvailableTags.map(tag => (
                  <option key={tag} value={tag} className="bg-[#1f1b16]">{tag}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddClient}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8d153e] hover:bg-[#a61c4b] text-white font-headline text-xs font-semibold shadow-md transition-all cursor-pointer flex-1 sm:flex-none justify-center active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#ff9aaf]" />
              <span>Añadir Cliente</span>
            </button>
          </div>
        </div>

        {/* Search inside CRM */}
        <div className="mb-4 bg-[#1f1b16] border border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-[#a58a8e]" />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto, correo o RFC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-[#ebe1d9] placeholder-[#a58a8e] w-full outline-none"
          />
        </div>

        {/* Data Table Container */}
        <div className="flex-1 bg-[#120d09] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
          <div className="overflow-auto custom-scrollbar flex-1">
            {clients.length === 0 ? (
              <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#8d153e]/20 border border-[#8d153e]/40 flex items-center justify-center mb-4 text-[#ffb1bf]">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-headline font-bold text-[#ebe1d9] mb-1">
                  Directorio de Clientes Vacío
                </h3>
                <p className="text-xs text-[#debfc3] max-w-md mb-5 leading-relaxed">
                  No hay clientes registrados en la base de datos de Firebase. Registra a tu primer cliente para emitir cotizaciones y dar seguimiento a sus órdenes en el taller.
                </p>
                <button
                  onClick={handleOpenAddClient}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8d153e] hover:bg-[#a61c4b] text-white font-headline text-xs font-semibold shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#ff9aaf]" />
                  <span>Registrar Primer Cliente</span>
                </button>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-[#a58a8e]">
                <Search className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">No se encontraron clientes que coincidan con &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="sticky top-0 bg-[#1f1b16] border-b border-white/5 z-10 shadow-sm">
                  <tr>
                    <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                      Empresa / Razón Social
                    </th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                      Correo Electrónico
                    </th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="py-3.5 px-5 w-20 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredClients.map((client) => {
                    const isSelected = client.id === (selectedClient?.id || selectedClientId);
                    return (
                      <tr
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2e2924]/70 border-l-2 border-[#ffb1bf]'
                            : 'hover:bg-[#1f1b16] border-l-2 border-transparent'
                        }`}
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#241f1a] border border-white/10 flex items-center justify-center text-[#ffb1bf] font-bold text-xs shrink-0">
                              {client.initials || 'CL'}
                            </div>
                            <div>
                              <p className="font-headline font-semibold text-sm text-[#ebe1d9]">{client.name}</p>
                              {client.rfc && (
                                <p className="font-mono text-[10px] text-[#a58a8e]">{client.rfc}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-[#debfc3]">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#a58a8e]" />
                            <span>{client.contactPerson}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-xs text-[#debfc3]">
                          {client.email || '—'}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-xs text-[#debfc3]">
                          {client.phone || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditClient(client);
                              }}
                              className="text-[#a58a8e] hover:text-[#ffb1bf] p-1.5 rounded-lg hover:bg-[#241f1a] transition-colors"
                              title="Editar datos del cliente"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingClient(client);
                              }}
                              className="text-[#a58a8e] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors"
                              title="Eliminar cliente"
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
            )}
          </div>

          {/* Table Footer / Counter */}
          <div className="bg-[#1f1b16] border-t border-white/5 p-3.5 flex justify-between items-center text-xs text-[#debfc3]">
            <span>Mostrando {filteredClients.length} de {clients.length} clientes en Firestore</span>
            <div className="flex gap-1.5">
              <button className="p-1 text-[#a58a8e] hover:text-white rounded disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 text-[#a58a8e] hover:text-white rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* History & Details Sidebar (Selected Client) */}
      {selectedClient ? (
        <aside className="w-full lg:w-[380px] bg-[#1f1b16] border border-white/5 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden shrink-0">
          
          {/* Client Header */}
          <div className="p-5 border-b border-white/5 bg-[#241f1a]/50">
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#2e2924] border border-[#574145] flex items-center justify-center text-[#ffb1bf] font-headline font-bold text-lg shadow-inner">
                {selectedClient.initials || 'CL'}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditClient(selectedClient)}
                  className="text-[#debfc3] hover:text-[#ffb1bf] p-1.5 rounded-lg hover:bg-[#2e2924] transition-colors cursor-pointer"
                  title="Editar datos del cliente"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingClient(selectedClient)}
                  className="text-[#debfc3] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Eliminar cliente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-headline font-bold text-lg text-[#ebe1d9] mb-0.5">
              {selectedClient.name}
            </h3>

            <p className="text-xs text-[#debfc3] flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-[#ffb1bf]" /> {selectedClient.contactPerson}
            </p>

            <div className="space-y-1 text-xs text-[#debfc3] pt-1">
              {selectedClient.email && (
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Mail className="w-3 h-3 text-[#ffb1bf]" /> {selectedClient.email}
                </div>
              )}
              {selectedClient.phone && (
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-[#ffb1bf]" /> {selectedClient.phone}
                </div>
              )}
              {selectedClient.address && (
                <div className="flex items-start gap-1.5 text-[11px] text-[#a58a8e] mt-1">
                  <MapPin className="w-3 h-3 text-[#ffb1bf] shrink-0 mt-0.5" />
                  <span>{selectedClient.address}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedClient.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-[#17130e] border border-white/10 rounded-md text-[10px] font-semibold text-[#debfc3]"
                >
                  {tag}
                </span>
              ))}
              {selectedClient.rfc && (
                <span className="px-2 py-0.5 bg-[#8d153e]/20 border border-[#ffb1bf]/30 rounded-md text-[10px] font-mono text-[#ffb1bf]">
                  RFC: {selectedClient.rfc}
                </span>
              )}
            </div>

            {selectedClient.notes && (
              <div className="mt-3 p-2.5 rounded-lg bg-[#17130e] border border-white/5 text-[11px] text-[#debfc3] leading-relaxed">
                <span className="text-[9px] uppercase font-bold text-[#a58a8e] block mb-0.5">Notas Comerciales:</span>
                {selectedClient.notes}
              </div>
            )}
          </div>

          {/* History Tabs */}
          <div className="flex border-b border-white/5 px-5 pt-3 bg-[#120d09]">
            <button
              onClick={() => setActiveTab('historial')}
              className={`pb-2.5 px-2 font-headline font-semibold text-xs transition-colors cursor-pointer mr-4 ${
                activeTab === 'historial'
                  ? 'text-[#ffb1bf] border-b-2 border-[#ffb1bf]'
                  : 'text-[#debfc3] hover:text-[#ebe1d9]'
              }`}
            >
              Historial de Eventos
            </button>
          </div>

          {/* History Timeline */}
          <div className="p-5 flex-1 overflow-auto custom-scrollbar">
            <div className="relative border-l border-[#574145] ml-2 space-y-4 pb-4">
              {clientEvents.length > 0 ? (
                clientEvents.map((evt) => (
                  <div key={evt.id} className="relative pl-5">
                    {/* Timeline Dot */}
                    <span
                      className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#1f1b16] ${
                        evt.type === 'order_completed' ? 'bg-[#ffb1bf]' : 'bg-[#39342f] border border-[#a58a8e]'
                      }`}
                    />

                    {/* Timeline Card */}
                    <div className="bg-[#241f1a] border border-white/5 rounded-xl p-3 shadow-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-[#debfc3] uppercase tracking-wider">
                          {evt.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#a58a8e]">
                          {evt.date}
                        </span>
                      </div>

                      {evt.code && (
                        <p className="font-mono font-semibold text-xs text-[#ebe1d9] mb-1">
                          {evt.code}
                        </p>
                      )}

                      <p className="text-xs text-[#debfc3] leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#a58a8e] text-xs">
                  <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p>Sin eventos registrados recientemente.</p>
                  <p className="text-[10px] text-[#716567] mt-0.5">Al generar cotizaciones u órdenes aparecerán aquí.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="p-4 border-t border-white/5 bg-[#120d09]">
            <button
              onClick={() => onNewQuoteForClient(selectedClient)}
              className="w-full bg-[#8d153e] hover:bg-[#a61c4b] text-white py-2.5 rounded-xl font-headline font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4 text-[#ff9aaf]" />
              <span>Generar Cotización para {selectedClient.name}</span>
            </button>
          </div>
        </aside>
      ) : (
        <aside className="w-full lg:w-[380px] bg-[#1f1b16] border border-white/5 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 text-center h-full shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-[#241f1a] border border-white/10 flex items-center justify-center text-[#a58a8e] mb-3">
            <User className="w-7 h-7" />
          </div>
          <h4 className="font-headline font-bold text-sm text-[#ebe1d9] mb-1">
            Expediente de Cliente
          </h4>
          <p className="text-xs text-[#debfc3] max-w-xs leading-relaxed">
            Selecciona un cliente del directorio para ver su información fiscal, condiciones comerciales y timeline de producción.
          </p>
        </aside>
      )}

      {/* Slide-over: Add / Edit Client Form */}
      {isSlideoverOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSlideoverOpen(false)}
          />

          {/* Slideover Panel */}
          <div className="relative w-full max-w-md h-full bg-[#1f1b16] border-l border-white/10 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#17130e]">
              <div>
                <h2 className="font-headline font-bold text-lg text-[#ebe1d9]">
                  {editingClient ? 'Editar Cliente en Firebase' : 'Nuevo Cliente en Firestore'}
                </h2>
                <p className="text-xs text-[#debfc3]">Colección: /clients</p>
              </div>
              <button
                onClick={() => setIsSlideoverOpen(false)}
                className="p-1.5 text-[#debfc3] hover:text-white rounded-full hover:bg-[#2e2924] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-auto p-5 custom-scrollbar">
              <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
                
                {/* Empresa */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[#debfc3] uppercase tracking-wider">
                    Empresa / Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmpresa}
                    onChange={(e) => setFormEmpresa(e.target.value)}
                    placeholder="Ej. Distribuidora Gráfica Mexicana"
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                  />
                </div>

                {/* Contacto */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[#debfc3] uppercase tracking-wider">
                    Nombre de Contacto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formContacto}
                    onChange={(e) => setFormContacto(e.target.value)}
                    placeholder="Ej. Lic. Fernando Morales"
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Correo */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-[#debfc3] uppercase tracking-wider">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={formCorreo}
                      onChange={(e) => setFormCorreo(e.target.value)}
                      placeholder="compras@empresa.mx"
                      className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#ebe1d9] outline-none"
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-[#debfc3] uppercase tracking-wider">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formTelefono}
                      onChange={(e) => setFormTelefono(e.target.value)}
                      placeholder="55 1234 5678"
                      className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#ebe1d9] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* RFC */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-[#debfc3] uppercase tracking-wider">
                      RFC Fiscal
                    </label>
                    <input
                      type="text"
                      value={formRFC}
                      onChange={(e) => setFormRFC(e.target.value)}
                      placeholder="DGM190820ABC"
                      className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono uppercase text-[#ebe1d9] outline-none"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-[#debfc3] uppercase tracking-wider">
                      Etiquetas / Tags
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="VIP, CDMX, Editorial"
                      className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[#debfc3] uppercase tracking-wider">
                    Dirección de Entrega / Facturación
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Calle, Número, Colonia, C.P., Ciudad"
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>

                {/* Notas Internas */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[#debfc3] uppercase tracking-wider">
                    Condiciones Comerciales & Notas
                  </label>
                  <textarea
                    rows={3}
                    value={formNotas}
                    onChange={(e) => setFormNotas(e.target.value)}
                    placeholder="Días de crédito, personas autorizadas para recibir pedidos, requerimientos especiales de empacado..."
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] resize-none outline-none leading-relaxed"
                  />
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/5 bg-[#17130e] flex justify-between items-center">
              {editingClient ? (
                <button
                  type="button"
                  onClick={() => setDeletingClient(editingClient)}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlideoverOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#debfc3] hover:bg-[#241f1a] rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveClient}
                  className="px-4 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white rounded-lg font-headline text-xs font-semibold shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  {editingClient ? 'Guardar Cambios' : 'Guardar en Firebase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Client */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-xs"
            onClick={() => setDeletingClient(null)}
          />
          <div className="relative w-full max-w-md bg-[#1f1b16] border border-red-500/30 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-headline font-bold text-lg text-[#ebe1d9]">
                Eliminar Cliente
              </h3>
            </div>
            
            <p className="text-xs text-[#debfc3] mb-4 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente a <strong>{deletingClient.name}</strong> de la base de datos de Firebase?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="px-4 py-2 rounded-lg font-semibold text-[#debfc3] hover:bg-[#2e2924] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Eliminar de Firebase</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
