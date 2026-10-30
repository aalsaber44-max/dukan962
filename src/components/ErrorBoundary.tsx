import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#1C1815] p-4 text-center">
          <div className="bg-[#141210] p-8 rounded-3xl shadow-xl border border-white/10 max-w-md w-full">
            {/* 💡 تم إصلاح كلاس الخلفية هنا */}
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-[#F3EEE4] mb-2 font-serif">عذراً، حدث خطأ غير متوقع</h1>
            <p className="text-sm text-[#A39A8B] mb-6">نعتذر عن هذا العطل المؤقت في المتجر. يرجى الضغط على الزر أدناه لتحديث الصفحة والمحاولة مرة أخرى.</p>
            <button
              onClick={() => window.location.reload()}
              // 💡 تم إصلاح لون الـ hover هنا ليصبح ذهبي فاتح
              className="w-full py-3 px-4 bg-[#D4B06A] text-[#0B0A09] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E8CC8A] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
