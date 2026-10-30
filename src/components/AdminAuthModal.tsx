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

  // 🔐 كلمة السر الجديدة المعقدة (يمكنك تغييرها من هنا في أي وقت)
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
        onSuccess(); // الدخول ناجح
      } else {
        setError('كلمة المرور غير صحيحة، يرجى المحاولة مجدداً');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141210] rounded-3xl shadow-2xl border border-white/10 overflow-hidden p-6 sm:p-8"
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
            <DukanLogo variant="dark" className="h-10" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#1C1815] text-[#D4B06A] flex items-center justify-center mx-auto mb-3 border border-white/10">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-[#F3EEE4]">
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
                className="w-full py-2.5 pr-10 pl-10 bg-[#1C1815] border border-white/10 rounded-xl text-sm font-mono text-[#F3EEE4] placeholder-[#8A8173] focus:outline-hidden focus:border-[#D4B06A]"
                autoFocus
              />
              <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8173]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8173] hover:text-[#F3EEE4] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 font-semibold mt-1.5 text-right">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-bold text-[#0B0A09] bg-[#D4B06A] hover:bg-[#E8CC8A] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>{loading ? 'جارٍ التحقق...' : 'فتح لوحة التحكم'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
