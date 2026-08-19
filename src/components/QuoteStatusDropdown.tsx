import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Quote } from '../types';

interface QuoteStatusDropdownProps {
  status: Quote['status'];
  onChangeStatus: (newStatus: Quote['status']) => void;
  size?: 'sm' | 'md';
}

export const QuoteStatusDropdown: React.FC<QuoteStatusDropdownProps> = ({
  status,
  onChangeStatus,
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusConfig = (st: Quote['status']) => {
    switch (st) {
      case 'DRAFT':
        return {
          label: 'Borrador',
          badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
          dotClass: 'bg-amber-400',
          desc: 'En edición / pendiente de envío'
        };
      case 'SENT':
        return {
          label: 'Enviada',
          badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25',
          dotClass: 'bg-sky-400',
          desc: 'Enviada al cliente para revisión'
        };
      case 'APPROVED':
        return {
          label: 'Aprobada',
          badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
          dotClass: 'bg-emerald-400',
          desc: 'Aprobada por el cliente'
        };
      case 'CONVERTED':
        return {
          label: 'Convertida',
          badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25',
          dotClass: 'bg-purple-400',
          desc: 'Convertida en orden de producción'
        };
      case 'REJECTED':
        return {
          label: 'Rechazada',
          badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25',
          dotClass: 'bg-rose-400',
          desc: 'No aceptada o cancelada'
        };
      default:
        return {
          label: st,
          badgeClass: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
          dotClass: 'bg-gray-400',
          desc: ''
        };
    }
  };

  const current = getStatusConfig(status);

  const statusOptions: Quote['status'][] = ['DRAFT', 'SENT', 'APPROVED', 'CONVERTED'];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border transition-all cursor-pointer select-none ${
          size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        } ${current.badgeClass}`}
      >
        <span className={`w-2 h-2 rounded-full ${current.dotClass}`} />
        <span>{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl bg-[#201b16] border border-white/10 shadow-2xl z-30 py-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-[#debfc3] border-b border-white/5 mb-1">
            Cambiar Estado
          </div>
          {statusOptions.map((opt) => {
            const cfg = getStatusConfig(opt);
            const isSelected = status === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChangeStatus(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  isSelected ? 'bg-white/5 text-white font-bold' : 'text-[#debfc3] hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotClass}`} />
                  <div>
                    <div className="font-semibold">{cfg.label}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#ffb1bf]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
