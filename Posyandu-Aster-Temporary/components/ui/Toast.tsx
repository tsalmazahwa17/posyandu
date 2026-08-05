"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", title?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const newToast: ToastMessage = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => showToast(message, "success", title), [showToast]);
  const error = useCallback((message: string, title?: string) => showToast(message, "error", title), [showToast]);
  const info = useCallback((message: string, title?: string) => showToast(message, "info", title), [showToast]);
  const warning = useCallback((message: string, title?: string) => showToast(message, "warning", title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-lg border flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              t.type === "success"
                ? "bg-white border-emerald-200 text-slate-800"
                : t.type === "error"
                ? "bg-white border-rose-200 text-slate-800"
                : t.type === "warning"
                ? "bg-white border-amber-200 text-slate-800"
                : "bg-white border-blue-200 text-slate-800"
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {t.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {t.title && <h4 className="text-xs font-bold text-slate-900 mb-0.5">{t.title}</h4>}
              <p className="text-xs text-slate-600 leading-snug">{t.message}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
