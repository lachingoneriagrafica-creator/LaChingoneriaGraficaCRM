import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [coords, setCoords] = useState<{ top: number; left: number; openUpwards: boolean }>({
    top: 0,
    left: 0,
    openUpwards: false
  });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 220; // Estimated height with margins
    const dropdownWidth = 192;  // w-48 is 192px

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    // Align right side of menu with right side of button, but ensure it stays on screen
    let left = rect.right - dropdownWidth;
    if (left < 10) left = 10;
    if (left + dropdownWidth > window.innerWidth - 10) {
      left = window.innerWidth - dropdownWidth - 10;
    }

    const top = openUpwards 
      ? rect.top - 6 
      : rect.bottom + 6;

    setCoords({
      top,
      left,
      openUpwards
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
  const statusOptions: Quote['status'][] = ['DRAFT', 'SENT', 'APPROVED', 'CONVERTED', 'REJECTED'];

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border transition-all cursor-pointer select-none shadow-sm ${
          size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        } ${current.badgeClass}`}
      >
        <span className={`w-2 h-2 rounded-full ${current.dotClass}`} />
        <span>{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: coords.openUpwards ? undefined : `${coords.top}px`,
            bottom: coords.openUpwards ? `${window.innerHeight - coords.top}px` : undefined,
            left: `${coords.left}px`,
            width: '192px',
            zIndex: 99999,
          }}
          className="rounded-xl bg-[#201b16] border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.85)] py-1.5 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-[#debfc3] border-b border-white/10 mb-1 flex items-center justify-between">
            <span>Cambiar Estado</span>
          </div>

          <div className="space-y-0.5 px-1">
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
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-[#8d153e]/30 text-white font-bold border border-[#ffb1bf]/30' 
                      : 'text-[#debfc3] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                    <span className="font-medium">{cfg.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#ffb1bf]" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
