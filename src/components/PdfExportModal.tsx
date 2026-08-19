import React from 'react';
import { Printer, X, Download, FileCheck, Building2 } from 'lucide-react';
import { Quote } from '../types';
import { BrandLogo } from './BrandLogo';
import { formatMXN } from '../utils/currencyUtils';

interface PdfExportModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  quote,
  isOpen,
  onClose
}) => {
  if (!isOpen || !quote) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Non-printable) */}
        <div className="p-4 bg-[#17130e] text-[#ebe1d9] border-b border-white/10 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#ffb1bf]" />
            <h3 className="font-headline font-semibold text-sm">
              Vista Previa de Cotización PDF - {quote.code}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#8d153e] hover:bg-[#a61c4b] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#debfc3] hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PDF Document Area */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-gray-900 custom-scrollbar print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[#8d153e] pb-6 mb-8">
            <BrandLogo variant="pdf" />

            <div className="text-right">
              <div className="inline-block bg-gray-100 px-3 py-1 rounded text-xs font-mono font-bold text-[#8d153e] mb-1">
                {quote.code}
              </div>
              <p className="text-xs text-gray-500">Fecha: {quote.createdAt}</p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                Vigencia: {quote.validityDays} días naturales
              </p>
            </div>
          </div>

          {/* Client Details Section */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 text-xs">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Cliente / Empresa
              </p>
              <p className="font-bold text-gray-900 text-sm">{quote.clientName}</p>
              {quote.contactPhone && <p className="text-gray-600 mt-0.5">Tel: {quote.contactPhone}</p>}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Contacto & Correo
              </p>
              <p className="font-semibold text-gray-900">{quote.contactEmail}</p>
              <p className="text-gray-500 mt-0.5">Estado: <span className="text-[#8d153e] font-bold">{quote.status}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                  <th className="p-3 w-1/2">Descripción de la Partida</th>
                  <th className="p-3 text-right">Cant.</th>
                  <th className="p-3 text-right">P. Unitario</th>
                  <th className="p-3 text-right">Total (MXN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quote.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="p-3">
                      <p className="font-semibold text-gray-900">{item.categoryLabel || item.category}</p>
                      <p className="text-gray-600 text-[11px] mt-0.5">{item.description}</p>
                    </td>
                    <td className="p-3 text-right font-mono text-gray-800 align-top">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-gray-800 align-top">
                      {formatMXN(item.unitPrice)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900 align-top">
                      {formatMXN(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 text-xs border-t border-gray-200 pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">{formatMXN(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA (16%):</span>
                <span className="font-mono font-medium">{formatMXN(quote.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t-2 border-gray-300 pt-2">
                <span>Total (MXN):</span>
                <span className="font-mono text-[#8d153e]">{formatMXN(quote.total)}</span>
              </div>
            </div>
          </div>

          {/* Commercial Terms & Footer */}
          <div className="border-t border-gray-200 pt-4 text-xs text-gray-600 space-y-2">
            <p className="font-bold text-gray-700">Términos y Condiciones Comerciales:</p>
            <p className="leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
              {quote.commercialTerms}
            </p>
            <div className="pt-6 grid grid-cols-2 gap-8 text-center text-gray-400 text-[10px]">
              <div>
                <div className="border-t border-gray-300 w-40 mx-auto mb-1"></div>
                <span>Por La Chingonería Gráfica</span>
              </div>
              <div>
                <div className="border-t border-gray-300 w-40 mx-auto mb-1"></div>
                <span>Firma de Conformidad del Cliente</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
