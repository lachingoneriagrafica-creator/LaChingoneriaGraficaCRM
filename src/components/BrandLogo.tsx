import React, { useState } from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'sidebar' | 'navbar' | 'pdf' | 'login';
  className?: string;
}

interface SmartImageProps {
  sources: string[];
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}

const SmartImage: React.FC<SmartImageProps> = ({ sources, alt, className = '', fallback }) => {
  const [sourceIndex, setSourceIndex] = useState(0);

  if (sourceIndex >= sources.length) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt={alt}
      onError={() => setSourceIndex(prev => prev + 1)}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  variant = 'full', 
  className = '' 
}) => {
  // Safely resolve asset paths with Vite base URL support (essential for GitHub Pages and local dev)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  // Prioritize webp (both lowercase and uppercase), then png fallback
  const logoSources = [
    `${cleanBase}logo.webp`,
    `${cleanBase}Logo.webp`,
    `${cleanBase}logo.png`,
  ];

  const faviconSources = [
    `${cleanBase}favicon.webp`,
    `${cleanBase}favicon.png`,
    `${cleanBase}logo.webp`,
    `${cleanBase}Logo.webp`,
    `${cleanBase}logo.png`
  ];

  // Stylized fallback emblem
  const FallbackEmblem: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = size === 'sm' 
      ? 'w-7 h-7 text-xs' 
      : size === 'lg' 
      ? 'w-20 h-20 text-xl' 
      : 'w-10 h-10 text-sm';

    return (
      <div className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#8d153e] to-[#4a0a1f] border border-[#ffb1bf]/30 shadow-lg shrink-0 ${sizeClasses}`}>
        <span className="font-headline font-extrabold tracking-tighter text-[#ffb1bf] select-none">
          LCG
        </span>
      </div>
    );
  };

  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className || 'w-10 h-10'}`}>
        <SmartImage
          sources={faviconSources}
          alt="LCG Logo"
          className="w-full h-full object-contain rounded-xl select-none"
          fallback={<FallbackEmblem size="md" />}
        />
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <SmartImage
            sources={faviconSources}
            alt="La Chingonería Gráfica"
            className="w-full h-full object-contain rounded-lg select-none"
            fallback={<FallbackEmblem size="md" />}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-headline font-bold text-base text-[#ffb1bf] tracking-tight leading-none truncate">
              LCG Admin
            </span>
          </div>
          <span className="text-[11px] text-[#debfc3] font-medium tracking-wide mt-0.5 truncate">
            La Chingonería Gráfica
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'navbar') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          <SmartImage
            sources={faviconSources}
            alt="LCG"
            className="w-full h-full object-contain rounded select-none"
            fallback={<FallbackEmblem size="sm" />}
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
        <div className="w-16 h-16 flex items-center justify-center shrink-0">
          <SmartImage
            sources={logoSources}
            alt="La Chingonería Gráfica"
            className="w-full h-full object-contain select-none"
            fallback={<FallbackEmblem size="md" />}
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
        {/* Clean transparent logo presentation without white card or fake transparency squares */}
        <div className="mb-4 flex items-center justify-center max-w-[280px] sm:max-w-xs">
          <SmartImage
            sources={logoSources}
            alt="La Chingonería Gráfica"
            className="max-h-28 sm:max-h-36 w-auto object-contain select-none drop-shadow-2xl transition-transform hover:scale-105 duration-300"
            fallback={<FallbackEmblem size="lg" />}
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
      <SmartImage
        sources={logoSources}
        alt="La Chingonería Gráfica"
        className="max-h-16 w-auto object-contain select-none"
        fallback={<FallbackEmblem size="md" />}
      />
    </div>
  );
};
