import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  X, 
  LogIn,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

export const LoginView: React.FC = () => {
  const { 
    loginWithEmailPassword, 
    loading, 
    authErrorMessage, 
    clearAuthError 
  } = useAuth();
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      setIsSubmitting(true);
      await loginWithEmailPassword(email, password);
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#100c08] text-[#ebe1d9] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-[#8d153e] selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[#8d153e]/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#ffb1bf]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        
        {/* Brand Logo & Header */}
        <div className="mb-5 sm:mb-6">
          <BrandLogo variant="login" />
        </div>

        {/* Auth Card */}
        <div className="w-full bg-[#1f1b16] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8d153e]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header Title */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#ffb1bf]" />
              <h2 className="font-headline font-bold text-lg text-[#ebe1d9]">
                Acceso al Sistema
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#debfc3] bg-[#2a2723] px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-[#ffb1bf]" />
              Portal Privado
            </span>
          </div>

          {/* User notice / error message banner */}
          {authErrorMessage && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start justify-between gap-2 text-xs text-red-200 animate-in fade-in-50 duration-150">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authErrorMessage}</span>
              </div>
              <button 
                onClick={clearAuthError}
                className="text-red-400 hover:text-white p-0.5 cursor-pointer"
                title="Cerrar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#a58a8e] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authErrorMessage) clearAuthError();
                  }}
                  placeholder="usuario@lachingoneria.mx"
                  className="w-full bg-[#2a2723] border border-white/10 focus:border-[#ffb1bf]/50 rounded-xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-[#ebe1d9] placeholder-[#a58a8e] outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#debfc3] uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#a58a8e] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authErrorMessage) clearAuthError();
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-[#2a2723] border border-white/10 focus:border-[#ffb1bf]/50 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#ebe1d9] placeholder-[#a58a8e] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#a58a8e] hover:text-white p-1.5 cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full mt-2 bg-[#8d153e] hover:bg-[#a61c4b] active:bg-[#721031] text-white font-headline text-xs sm:text-sm font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-98 disabled:opacity-50 border border-[#ffb1bf]/20"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 text-[#ff9aaf]" />
              )}
              <span>{isSubmitting ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
            </button>
          </form>

          {/* Security badge footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-[#a58a8e]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Acceso seguro protegido por Firebase Authentication</span>
          </div>
        </div>

      </div>
    </div>
  );
};
