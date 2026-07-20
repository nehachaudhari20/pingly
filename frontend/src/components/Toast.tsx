import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, Loader2, X } from 'lucide-react';
import type { Toast } from '../types';

interface ToastContextValue {
  toast: (message: string, type?: Toast['type']) => string;
  dismiss: (id: string) => void;
  success: (message: string) => string;
  error: (message: string) => string;
  info: (message: string) => string;
  loading: (message: string) => string;
  update: (id: string, message: string, type: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  loading: Loader2,
};

const styles = {
  success: 'text-emerald-600',
  error: 'text-rose-600',
  info: 'text-blue-600',
  loading: 'text-gray-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const update = useCallback((id: string, message: string, type: Toast['type']) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, message, type } : t)));
  }, []);

  const toast = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = uid();
      setToasts((prev) => [...prev, { id, message, type }]);
      if (type !== 'loading') {
        setTimeout(() => dismiss(id), 4000);
      }
      return id;
    },
    [dismiss],
  );

  const success = useCallback((m: string) => toast(m, 'success'), [toast]);
  const error = useCallback((m: string) => toast(m, 'error'), [toast]);
  const info = useCallback((m: string) => toast(m, 'info'), [toast]);
  const loading = useCallback((m: string) => toast(m, 'loading'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, dismiss, success, error, info, loading, update }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg shadow-gray-900/5 animate-toast-in"
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${styles[t.type]} ${t.type === 'loading' ? 'animate-spin' : ''}`}
              />
              <p className="flex-1 text-sm font-medium text-gray-700">{t.message}</p>
              {t.type !== 'loading' && (
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-gray-400 transition hover:text-gray-600"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
