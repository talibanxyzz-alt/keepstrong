/**
 * Toast Hook using Sonner
 * 
 * Simple wrapper around the sonner toast library for consistent usage
 */

import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration = 3000 }: ToastOptions) => {
    const message = description ? `${title}\n${description}` : title;

    switch (variant) {
      case 'destructive':
        sonnerToast.error(message, { duration });
        break;
      case 'success':
        sonnerToast.success(message, { duration });
        break;
      default:
        sonnerToast(message, { duration });
        break;
    }
  };

  return { toast };
}

