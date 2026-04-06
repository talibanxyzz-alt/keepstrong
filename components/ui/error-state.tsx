import { AlertCircle, RefreshCw, WifiOff, Database, Lock } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'generic' | 'network' | 'database' | 'permission';
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorState({
  title,
  message,
  type = 'generic',
  onRetry,
  showRetry = true,
}: ErrorStateProps) {
  const config = {
    generic: {
      icon: AlertCircle,
      title: title || 'Something went wrong',
      message: message || 'An unexpected error occurred. Please try again.',
      color: 'text-danger',
      bgColor: 'bg-danger-muted',
    },
    network: {
      icon: WifiOff,
      title: title || 'Connection Lost',
      message: message || 'Please check your internet connection and try again.',
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    database: {
      icon: Database,
      title: title || 'Data Error',
      message: message || 'We had trouble loading your data. Please try again.',
      color: 'text-danger',
      bgColor: 'bg-danger-muted',
    },
    permission: {
      icon: Lock,
      title: title || 'Access Denied',
      message: message || 'You don\'t have permission to access this.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  };

  const { icon: Icon, title: errorTitle, message: errorMessage, color, bgColor } = config[type];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className={`mb-4 p-4 rounded-full ${bgColor}`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <h3 className="text-lg font-semibold text-charcoal mb-2">{errorTitle}</h3>
      <p className="text-slate mb-6 max-w-md">{errorMessage}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * Inline error message for forms and small components
 */
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-danger-muted border border-danger/20 rounded-lg">
      <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
      <p className="text-sm text-danger">{message}</p>
    </div>
  );
}

/**
 * Compact error badge for small spaces
 */
export function ErrorBadge({ message }: { message: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-danger-muted text-danger text-sm font-medium rounded-full">
      <AlertCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

