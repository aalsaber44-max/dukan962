import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { DukanLogo } from './DukanLogo';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔐 كلمة السر المعقدة (يمكنك تغييرها من هنا في أي وقت)
  const SECRET_PASSWORD = "Dukan962@Admin#2024!";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setLoading(true);
    setError('');

    // محاكاة التحميل لإعطاء طابع احترافي
    setTimeout(() => {
      if (password === SECRET_PASSWORD) {
        setPassword('');
        setError('');
        onSuccess();
      } else {
        setError('كلمة المرور غير صحيحة، يرجى المحاولة مجدداً');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141210] rounded-3xl shadow-[0_0_80px_-20px_rgba(212,176,106,0.3)] border border-white/10 overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-[#A39A8B] hover:text-[#F3EEE4] hover:bg-[#26211D] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Security Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <DukanLogo variant="light" className="h-10" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#1C1815] text-[#D4B06A] flex items-center justify-center mx-auto mb-3 border border-white/10 ring-1 ring-[#D4B06A]/20">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-[#F3EEE4] font-serif">
            لوحة إدارة وتحكم المتجر
          </h3>
          <p className="text-xs text-[#A39A8B] mt-1">
            منطقة مخصصة لصاحب المتجر لإدارة الأسعار، المنتجات، والطلبات
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#F3EEE4] mb-1.5 text-right">
              كلمة مرور الإدارة:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="أدخل الرمز السري..."
                className="w-full py-2.5 pr-10 pl-10 bg-[#1C1815] border border-white/10 rounded-xl text-sm font-mono text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A] transition-colors"
                autoFocus
              />
              <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8173]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8173] hover:text-[#F3EEE4] cursor-pointer transition-colors"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 font-semibold mt-1.5 text-right bg-rose-500/10 border border-rose-500/30 rounded-lg px-2.5 py-1.5">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-bold text-[#0B0A09] bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] hover:from-[#E8CC8A] hover:to-[#E8CC8A] rounded-xl shadow-gold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'جارٍ التحقق...' : 'فتح لوحة التحكم'}</span>
          </button>
        </form>

        <p className="text-[10px] text-[#8A8173] text-center mt-4 leading-relaxed">
          🔒 منطقة محمية — الدخول مخصص لصاحب المتجر فقط
        </p>
      </div>
    </div>
  );
};
