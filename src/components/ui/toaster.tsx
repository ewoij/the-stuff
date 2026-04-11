"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

type ToastVariant = "default" | "error";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

type Listener = (toast: Toast) => void;

let nextId = 0;
const listeners = new Set<Listener>();

function emit(message: string, variant: ToastVariant) {
  const t: Toast = { id: ++nextId, message, variant };
  listeners.forEach((fn) => fn(t));
}

export const toast = {
  error(message: string) {
    emit(message, "error");
  },
};

const AUTO_DISMISS_MS = 5000;

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener: Listener = (t) => {
      setToasts((prev) => [...prev, t]);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-2 rounded-lg border p-3 text-sm shadow-lg animate-in slide-in-from-bottom-2 fade-in-0 duration-200 ${
        t.variant === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-popover text-popover-foreground"
      }`}
    >
      <span className="flex-1">{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
