import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'sidebar' | 'navbar' | 'pdf' | 'login';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  variant = 'full', 
  className = '' 
}) => {
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[#8d153e] shadow-lg border border-[#ffb1bf]/30 shrink-0 ${className || 'w-10 h-10'}`}>
        <img 
          src="/favicon.png" 
          alt="LCG Logo" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-11 h-11 rounded-xl bg-[#2a241e] border border-[#ffb1bf]/20 p-1 flex items-center justify-center shrink-0 shadow-md">
          <img 
            src="/favicon.png" 
            alt="La Chingonería Gráfica" 
            className="w-full h-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-headline font-bold text-base text-[#ffb1bf] tracking-tight leading-none">
              LCG Admin
            </span>
          </div>
          <span className="text-[11px] text-[#debfc3] font-medium tracking-wide mt-0.5">
            La Chingonería Gráfica
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'navbar') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-[#2a241e] border border-[#ffb1bf]/20 p-0.5 flex items-center justify-center shrink-0">
          <img 
            src="/favicon.png" 
            alt="LCG" 
            className="w-full h-full object-contain rounded"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-headline font-bold text-base text-[#ffb1bf] tracking-tight">
            La Chingonería Gráfica
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'pdf') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        <div className="w-14 h-14 bg-[#1f1b16] rounded-xl p-1 flex items-center justify-center border border-gray-200 shrink-0">
          <img 
            src="/logo.png" 
            alt="La Chingonería Gráfica" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h1 className="font-headline font-bold text-2xl text-gray-900 tracking-tight leading-tight">
            La Chingonería Gráfica
          </h1>
          <p className="text-xs text-[#8d153e] font-semibold tracking-wide">
            Impresión Digital, Offset & Acabados de Alta Precisión
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'login') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Emblem / Logo container */}
        <div className="w-28 sm:w-36 h-28 sm:h-36 rounded-2xl bg-white p-2 sm:p-2.5 flex items-center justify-center shadow-2xl border border-white/20 mb-4 transition-transform hover:scale-105">
          <img 
            src="/logo.png" 
            alt="La Chingonería Gráfica" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#ebe1d9] tracking-tight">
          La Chingonería Gráfica
        </h1>
        <p className="text-xs sm:text-sm text-[#debfc3] mt-1 max-w-sm mx-auto">
          Portal administrativo de producción gráfica y taller
        </p>
      </div>
    );
  }

  // Default 'full' variant
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img 
        src="/logo.png" 
        alt="La Chingonería Gráfica" 
        className="max-h-16 w-auto object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
