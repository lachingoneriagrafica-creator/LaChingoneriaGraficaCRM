import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  User, 
  FileText, 
  CheckCircle2, 
  FileCode, 
  X, 
  Phone, 
  Mail, 
  Building2, 
  Search,
  PlusCircle,
  Tag as TagIcon,
  Trash2
} from 'lucide-react';
import { Client, ClientTimelineEvent, Quote } from '../types';

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
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'c1');
  const [isSlideoverOpen, setIsSlideoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'historial' | 'cotizaciones'>('historial');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');

  // Form state for new/edited client
  const [formEmpresa, setFormEmpresa] = useState('');
  const [formContacto, setFormContacto] = useState('');
  const [formCorreo, setFormCorreo] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formRFC, setFormRFC] = useState('');
  const [formNotas, setFormNotas] = useState('');
  const [formTags, setFormTags] = useState('VIP, CDMX');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const clientEvents = selectedClient ? (timelineEvents[selectedClient.id] || []) : [];

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    
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

    const initials = formEmpresa.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'CL';
    const tagList = formTags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingClient) {
      const updated: Client = {
        ...editingClient,
        name: formEmpresa,
        contactPerson: formContacto,
        email: formCorreo,
        phone: formTelefono,
        rfc: formRFC,
        notes: formNotas,
        tags: tagList,
        initials
      };
      onUpdateClient(updated);
    } else {
      const newClient: Client = {
        id: 'client_' + Date.now(),
        name: formEmpresa,
        contactPerson: formContacto,
        email: formCorreo,
        phone: formTelefono,
        rfc: formRFC,
        notes: formNotas,
        tags: tagList.length ? tagList : ['Cliente'],
        initials,
        createdAt: new Date().toISOString()
      };
      onAddNewClient(newClient);
      setSelectedClientId(newClient.id);
    }

    setIsSlideoverOpen(false);
  };

  return (
    <div className="flex-1 px-4 lg:px-8 py-6 max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row gap-6 h-[calc(100vh-64px)] overflow-hidden">
      
      {/* CRM Directory Column (Min 60%) */}
      <section className="flex-1 flex flex-col min-w-full lg:min-w-[60%] h-full overflow-hidden">
        
        {/* Directory Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3 shrink-0">
          <div>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[#ebe1d9]">
              Directorio de Clientes
            </h2>
            <p className="text-xs sm:text-sm text-[#debfc3]">
              Gestión de contactos y registros de producción.
            </p>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            {/* Filter Toggle */}
            <div className="flex items-center gap-1 bg-[#1f1b16] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#debfc3]">
              <Filter className="w-3.5 h-3.5 text-[#ffb1bf]" />
              <select
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                className="bg-transparent border-none text-xs text-[#ebe1d9] outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#1f1b16]">Todos los tags</option>
                <option value="VIP" className="bg-[#1f1b16]">VIP</option>
                <option value="CDMX" className="bg-[#1f1b16]">CDMX</option>
                <option value="Editorial" className="bg-[#1f1b16]">Editorial</option>
                <option value="Bebidas" className="bg-[#1f1b16]">Bebidas</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddClient}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8d153e] hover:bg-[#a61c4b] text-white font-headline text-xs font-semibold shadow-md transition-all cursor-pointer flex-1 sm:flex-none justify-center active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#ff9aaf]" />
              <span>Añadir Cliente</span>
            </button>
          </div>
        </div>

        {/* Search inside CRM */}
        <div className="mb-4 bg-[#1f1b16] border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-[#a58a8e]" />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-[#ebe1d9] placeholder-[#a58a8e] w-full outline-none"
          />
        </div>

        {/* Data Table Container */}
        <div className="flex-1 bg-[#120d09] rounded-xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
          <div className="overflow-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-[#1f1b16] border-b border-white/5 z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="py-3 px-5 w-12 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredClients.map((client) => {
                  const isSelected = client.id === selectedClientId;
                  return (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`row-hover transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#2e2924]/60 border-l-2 border-[#ffb1bf]'
                          : 'hover:bg-[#1f1b16] border-l-2 border-transparent'
                      }`}
                    >
                      <td className="py-3.5 px-5 font-headline font-semibold text-[#ebe1d9]">
                        {client.name}
                      </td>
                      <td className="py-3.5 px-5 text-[#debfc3]">
                        {client.contactPerson}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-[#debfc3]">
                        {client.email}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-[#debfc3]">
                        {client.phone}
                      </td>
                      <td className="py-3.5 px-5 text-right action-icons">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditClient(client);
                          }}
                          className="text-[#a58a8e] hover:text-[#ffb1bf] p-1 rounded hover:bg-[#241f1a]"
                          title="Editar cliente"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="bg-[#1f1b16] border-t border-white/5 p-3.5 flex justify-between items-center text-xs text-[#debfc3]">
            <span>Mostrando {filteredClients.length} de {clients.length} clientes</span>
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
      {selectedClient && (
        <aside className="w-full lg:w-[360px] bg-[#1f1b16] border border-white/5 rounded-xl shadow-xl flex flex-col h-full overflow-hidden shrink-0">
          
          {/* Client Header */}
          <div className="p-5 border-b border-white/5 bg-[#241f1a]/50">
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 rounded-lg bg-[#2e2924] border border-[#574145] flex items-center justify-center text-[#ffb1bf] font-headline font-bold text-lg shadow-inner">
                {selectedClient.initials || 'CL'}
              </div>
              <button
                onClick={() => handleOpenEditClient(selectedClient)}
                className="text-[#debfc3] hover:text-[#ffb1bf] p-1 rounded hover:bg-[#2e2924] transition-colors"
                title="Editar datos del cliente"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-headline font-bold text-lg text-[#ebe1d9] mb-0.5">
              {selectedClient.name}
            </h3>

            <p className="text-xs text-[#debfc3] flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-[#ffb1bf]" /> {selectedClient.contactPerson}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedClient.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-[#17130e] border border-white/10 rounded text-[10px] font-semibold text-[#debfc3]"
                >
                  {tag}
                </span>
              ))}
              {selectedClient.rfc && (
                <span className="px-2 py-0.5 bg-[#17130e] border border-white/10 rounded text-[10px] font-mono text-[#a58a8e]">
                  {selectedClient.rfc}
                </span>
              )}
            </div>
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
              Historial
            </button>
            <button
              onClick={() => setActiveTab('cotizaciones')}
              className={`pb-2.5 px-2 font-headline font-semibold text-xs transition-colors cursor-pointer ${
                activeTab === 'cotizaciones'
                  ? 'text-[#ffb1bf] border-b-2 border-[#ffb1bf]'
                  : 'text-[#debfc3] hover:text-[#ebe1d9]'
              }`}
            >
              Cotizaciones
            </button>
          </div>

          {/* History Timeline */}
          <div className="p-5 flex-1 overflow-auto custom-scrollbar">
            {activeTab === 'historial' ? (
              <div className="relative border-l border-[#574145] ml-2 space-y-5 pb-4">
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
                      <div className="bg-[#241f1a] border border-white/5 rounded-lg p-3 shadow-md">
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

                        {evt.fileAttachment && (
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#ffb1bf] font-mono">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{evt.fileAttachment.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pl-4 text-xs text-[#a58a8e]">
                    No hay eventos registrados para este cliente.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-[#241f1a] p-3 rounded-lg border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-bold text-[#ffb1bf]">COT-2023-142</span>
                    <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">Aprobada</span>
                  </div>
                  <p className="text-xs text-[#debfc3]">500 Brochures corporativos</p>
                  <p className="font-mono text-xs text-emerald-400 font-bold mt-1">$9,250.00 MXN</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Footer */}
          <div className="p-4 border-t border-white/5 bg-[#120d09]">
            <button
              onClick={() => onNewQuoteForClient(selectedClient)}
              className="w-full bg-transparent hover:bg-[#241f1a] border border-[#a58a8e]/50 hover:border-[#ffb1bf] text-[#ebe1d9] py-2.5 rounded-lg font-headline font-semibold text-xs transition-all cursor-pointer"
            >
              Nueva Cotización para este Cliente
            </button>
          </div>
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
              <h2 className="font-headline font-bold text-lg text-[#ebe1d9]">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                onClick={() => setIsSlideoverOpen(false)}
                className="p-1.5 text-[#debfc3] hover:text-white rounded-full hover:bg-[#2e2924] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-auto p-5 custom-scrollbar">
              <form onSubmit={handleSaveClient} className="space-y-4">
                
                {/* Empresa */}
                <div className="bg-[#17130e] p-3 rounded-t-lg input-focus-border">
                  <label className="block text-[11px] font-semibold text-[#debfc3] mb-1 uppercase tracking-wider">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmpresa}
                    onChange={(e) => setFormEmpresa(e.target.value)}
                    placeholder="Razón social o comercial"
                    className="w-full bg-transparent border-none text-sm text-[#ebe1d9] p-0 outline-none"
                  />
                </div>

                {/* Contacto */}
                <div className="bg-[#17130e] p-3 rounded-t-lg input-focus-border">
                  <label className="block text-[11px] font-semibold text-[#debfc3] mb-1 uppercase tracking-wider">
                    Nombre de Contacto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formContacto}
                    onChange={(e) => setFormContacto(e.target.value)}
                    placeholder="Nombre completo del contacto"
                    className="w-full bg-transparent border-none text-sm text-[#ebe1d9] p-0 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Correo */}
                  <div className="bg-[#17130e] p-3 rounded-t-lg input-focus-border">
                    <label className="block text-[11px] font-semibold text-[#debfc3] mb-1 uppercase tracking-wider">
                      Correo
                    </label>
                    <input
                      type="email"
                      value={formCorreo}
                      onChange={(e) => setFormCorreo(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-transparent border-none text-xs text-[#ebe1d9] font-mono p-0 outline-none"
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="bg-[#17130e] p-3 rounded-t-lg input-focus-border">
                    <label className="block text-[11px] font-semibold text-[#debfc3] mb-1 uppercase tracking-wider">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formTelefono}
                      onChange={(e) => setFormTelefono(e.target.value)}
                      placeholder="+52 55..."
                      className="w-full bg-transparent border-none text-xs text-[#ebe1d9] font-mono p-0 outline-none"
                    />
                  </div>
                </div>

                {/* RFC */}
                <div className="bg-[#17130e] p-3 rounded-t-lg input-focus-border">
                  <label className="block text-[11px] font-semibold text-[#debfc3] mb-1 uppercase tracking-wider">
                    RFC (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formRFC}
                    onChange={(e) => setFormRFC(e.target.value)}
                    placeholder="ABC123456T89"
                    className="w-full bg-transparent border-none text-xs text-[#ebe1d9] font-mono uppercase p-0 outline-none"
                  />
                </div>

                {/* Tags */}
                <div className="bg-[#17130e] p-3 rounded-t-lg input-focus-border">
                  <label className="block text-[11px] font-semibold text-[#debfc3] mb-1 uppercase tracking-wider">
                    Etiquetas / Tags (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="VIP, CDMX, Editorial"
                    className="w-full bg-transparent border-none text-xs text-[#ebe1d9] p-0 outline-none"
                  />
                </div>

                {/* Notas Internas */}
                <div className="bg-[#17130e] p-3 rounded-t-lg input-focus-border">
                  <label className="block text-[11px] font-semibold text-[#debfc3] mb-1 uppercase tracking-wider">
                    Notas Internas
                  </label>
                  <textarea
                    rows={3}
                    value={formNotas}
                    onChange={(e) => setFormNotas(e.target.value)}
                    placeholder="Condiciones de crédito, preferencias de entrega, requerimientos de color..."
                    className="w-full bg-transparent border-none text-xs text-[#ebe1d9] p-0 resize-none outline-none leading-relaxed"
                  />
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/5 bg-[#17130e] flex justify-between items-center">
              {editingClient ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar cliente ${editingClient.name}?`)) {
                      onDeleteClient(editingClient.id);
                      setIsSlideoverOpen(false);
                    }
                  }}
                  className="text-xs text-[#ffb4ab] hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlideoverOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#ffb1bf] hover:bg-[#241f1a] rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveClient}
                  className="px-4 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white rounded-lg font-headline text-xs font-semibold shadow-md transition-all active:scale-98"
                >
                  {editingClient ? 'Guardar Cambios' : 'Guardar Cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
