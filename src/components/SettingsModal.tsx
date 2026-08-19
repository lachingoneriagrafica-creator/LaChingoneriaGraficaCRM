import React, { useState } from 'react';
import { X, Settings, Building, Percent, FileText, Bell, CheckCircle2, ShieldAlert, Trash2, AlertTriangle, RotateCcw, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurgeData?: () => Promise<void> | void;
  onPurgeClients?: () => Promise<void> | void;
  onPurgeAll?: () => Promise<void> | void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onPurgeData,
  onPurgeClients,
  onPurgeAll
}) => {
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
  
  const [confirmPurgeQuotes, setConfirmPurgeQuotes] = useState(false);
  const [confirmPurgeClients, setConfirmPurgeClients] = useState(false);
  const [confirmPurgeAll, setConfirmPurgeAll] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccessMsg, setPurgeSuccessMsg] = useState<string | null>(null);

  if (!isOpen || activeRole !== 'admin') return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleExecutePurgeQuotes = async () => {
    setIsPurging(true);
    try {
      if (onPurgeData) await onPurgeData();
      setPurgeSuccessMsg('Cotizaciones y órdenes de trabajo borradas correctamente de Firestore.');
      setConfirmPurgeQuotes(false);
      setTimeout(() => setPurgeSuccessMsg(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPurging(false);
    }
  };

  const handleExecutePurgeClients = async () => {
    setIsPurging(true);
    try {
      if (onPurgeClients) await onPurgeClients();
      setPurgeSuccessMsg('Directorio de clientes restablecido a cero en Firestore.');
      setConfirmPurgeClients(false);
      setTimeout(() => setPurgeSuccessMsg(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPurging(false);
    }
  };

  const handleExecutePurgeAll = async () => {
    setIsPurging(true);
    try {
      if (onPurgeAll) {
        await onPurgeAll();
      } else {
        if (onPurgeData) await onPurgeData();
        if (onPurgeClients) await onPurgeClients();
      }
      setPurgeSuccessMsg('Base de datos restablecida a cero (Clientes, Cotizaciones y Órdenes).');
      setConfirmPurgeAll(false);
      setTimeout(() => setPurgeSuccessMsg(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1f1b16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-[#17130e] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#ffb1bf]" />
            <h3 className="font-headline font-bold text-lg text-[#ebe1d9]">
              Configuración y Mantenimiento
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#debfc3] hover:text-white p-1 rounded-lg hover:bg-[#2e2924] cursor-pointer"
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

          {purgeSuccessMsg && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 rounded-lg flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{purgeSuccessMsg}</span>
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

          {/* Danger Zone: Reset Data */}
          <div className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-xl space-y-3">
            <h4 className="font-semibold text-red-300 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Zona de Depuración y Reinicio de Datos (Firestore)</span>
            </h4>

            {/* Purge Clients */}
            <div className="flex items-center justify-between pt-1 border-t border-red-500/10">
              <div>
                <p className="font-semibold text-[#ebe1d9] text-[11px]">Borrar Directorio de Clientes</p>
                <p className="text-[#a58a8e] text-[10px]">Elimina todos los clientes en Firestore para iniciar desde cero.</p>
              </div>
              {!confirmPurgeClients && (
                <button
                  type="button"
                  onClick={() => setConfirmPurgeClients(true)}
                  className="px-2.5 py-1 bg-red-900/30 hover:bg-red-800/50 border border-red-500/30 text-red-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Borrar Clientes
                </button>
              )}
            </div>
            {confirmPurgeClients && (
              <div className="p-2.5 bg-[#17130e] border border-red-500/40 rounded-lg flex flex-col gap-2 animate-in fade-in duration-150">
                <p className="text-[11px] text-red-200">
                  ¿Confirmas que deseas borrar permanentemente todos los clientes en Firestore?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmPurgeClients(false)}
                    className="px-2 py-0.5 text-[11px] text-[#debfc3]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isPurging}
                    onClick={handleExecutePurgeClients}
                    className="px-2.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-bold"
                  >
                    {isPurging ? 'Borrando...' : 'Sí, Borrar Clientes'}
                  </button>
                </div>
              </div>
            )}

            {/* Purge Quotes & Orders */}
            <div className="flex items-center justify-between pt-2 border-t border-red-500/10">
              <div>
                <p className="font-semibold text-[#ebe1d9] text-[11px]">Borrar Cotizaciones y Órdenes</p>
                <p className="text-[#a58a8e] text-[10px]">Elimina presupuestos y trabajos de taller registrados.</p>
              </div>
              {!confirmPurgeQuotes && (
                <button
                  type="button"
                  onClick={() => setConfirmPurgeQuotes(true)}
                  className="px-2.5 py-1 bg-red-900/30 hover:bg-red-800/50 border border-red-500/30 text-red-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Borrar Cotizaciones
                </button>
              )}
            </div>
            {confirmPurgeQuotes && (
              <div className="p-2.5 bg-[#17130e] border border-red-500/40 rounded-lg flex flex-col gap-2 animate-in fade-in duration-150">
                <p className="text-[11px] text-red-200">
                  ¿Confirmas que deseas borrar permanentemente todas las cotizaciones y órdenes?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmPurgeQuotes(false)}
                    className="px-2 py-0.5 text-[11px] text-[#debfc3]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isPurging}
                    onClick={handleExecutePurgeQuotes}
                    className="px-2.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-bold"
                  >
                    {isPurging ? 'Borrando...' : 'Sí, Borrar Cotizaciones'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold text-[#debfc3] hover:bg-[#2e2924] cursor-pointer"
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
