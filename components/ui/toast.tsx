"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
  dismissToast: (id: string) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================================================
// HOOK
// ============================================================================

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration: number = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const toast = {
    success: (message: string, duration?: number) => addToast("success", message, duration),
    error: (message: string, duration?: number) => addToast("error", message, duration),
    info: (message: string, duration?: number) => addToast("info", message, duration),
    warning: (message: string, duration?: number) => addToast("warning", message, duration),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

interface ToastContainerProps {
  toasts: Toast[];
  dismissToast: (id: string) => void;
}

function ToastContainer({ toasts, dismissToast }: ToastContainerProps) {
  return (
    <div
      className="pointer-events-none fixed left-1/2 top-5 z-[9999] flex -translate-x-1/2 flex-col items-center gap-3"
      style={{ width: "max-content" }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

// ============================================================================
// TOAST ITEM
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Add a small delay before showing the animation
    const timeout = setTimeout(() => {
      setIsExiting(false);
    }, 10);
    return () => clearTimeout(timeout);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // Match animation duration
  };

  const config = getToastConfig(toast.type);

  return (
    <div
      onClick={handleDismiss}
      className={`
        pointer-events-auto
        flex
        min-w-[320px]
        max-w-[500px]
        cursor-pointer
        items-center
        gap-3
        rounded-xl
        px-5
        py-3
        shadow-lg
        transition-all
        duration-300
        ${config.bgColor}
        ${config.textColor}
        ${
          isExiting
            ? "translate-y-[-100px] opacity-0"
            : "translate-y-0 opacity-100 animate-slide-down"
        }
        hover:scale-[1.02]
      `}
      style={{
        animation: isExiting ? "none" : "slideDown 0.3s ease-out",
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0">{config.icon}</div>

      {/* Message */}
      <div className="flex-1 text-sm font-medium">{toast.message}</div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className={`flex-shrink-0 rounded-md p-1 transition-colors ${config.closeHoverColor}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getToastConfig(type: ToastType) {
  switch (type) {
    case "success":
      return {
        icon: <CheckCircle className="h-5 w-5" />,
        bgColor: "bg-success",
        textColor: "text-white",
        closeHoverColor: "hover:bg-success/20",
      };
    case "error":
      return {
        icon: <XCircle className="h-5 w-5" />,
        bgColor: "bg-danger",
        textColor: "text-white",
        closeHoverColor: "hover:bg-danger/90",
      };
    case "info":
      return {
        icon: <Info className="h-5 w-5" />,
        bgColor: "bg-primary",
        textColor: "text-white",
        closeHoverColor: "hover:bg-primary-hover",
      };
    case "warning":
      return {
        icon: <AlertCircle className="h-5 w-5" />,
        bgColor: "bg-warning",
        textColor: "text-white",
        closeHoverColor: "hover:bg-warning/80",
      };
    default:
      return {
        icon: <Info className="h-5 w-5" />,
        bgColor: "bg-charcoal",
        textColor: "text-white",
        closeHoverColor: "hover:bg-charcoal/80",
      };
  }
}

// ============================================================================
// CSS ANIMATION (Add to globals.css)
// ============================================================================

/*
@keyframes slideDown {
  from {
    transform: translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}
*/

