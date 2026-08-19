import React, { useState } from 'react';
import { X, Settings, Building, Percent, FileText, Bell, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { activeRole } = useAuth();
  const [companyName, setCompanyName] = useState('La Chingonería Gráfica');
  const [rfc, setRfc] = useState('LCG190820XYZ');
  const [taxRate, setTaxRate] = useState('16');
  const [currency, setCurrency] = useState('MXN');
  const [defaultTerms, setDefaultTerms] = useState(
    '50% Anticipo para inicio de producción. 50% Contra entrega. Tiempo estimado: 5-7 días hábiles tras visto bueno de arte.'
  );
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || activeRole !== 'admin') return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1f1b16] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-[#17130e] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#ffb1bf]" />
            <h3 className="font-headline font-bold text-lg text-[#ebe1d9]">
              Configuración del Portal LCG
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#debfc3] hover:text-white p-1 rounded-lg hover:bg-[#2e2924]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Configuración guardada correctamente.</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-[#debfc3] uppercase tracking-wider">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-sm text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#debfc3] uppercase tracking-wider">
                RFC Emisor
              </label>
              <input
                type="text"
                value={rfc}
                onChange={(e) => setRfc(e.target.value)}
                className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-[#ebe1d9] uppercase outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#debfc3] uppercase tracking-wider">
                IVA Predeterminado (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-[#ebe1d9] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#debfc3] uppercase tracking-wider">
              Términos Comerciales Predeterminados
            </label>
            <textarea
              rows={3}
              value={defaultTerms}
              onChange={(e) => setDefaultTerms(e.target.value)}
              className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs text-[#ebe1d9] resize-none outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#241f1a] rounded-lg border border-white/5">
            <div>
              <p className="font-semibold text-[#ebe1d9]">Alertas de Entrega Urgentes</p>
              <p className="text-[#a58a8e] text-[11px]">Notificar cuando un trabajo esté a menos de 24h de entrega</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded bg-[#2a2723] border-white/20 text-[#8d153e]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold text-[#debfc3] hover:bg-[#2e2924]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#8d153e] hover:bg-[#a61c4b] text-white font-semibold shadow-md cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
