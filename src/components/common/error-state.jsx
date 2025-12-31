'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Reusable error state component
 * @param {object} props
 * @param {string} props.title - Error title (default: "Error")
 * @param {string} props.message - Error message
 * @param {boolean} props.fullScreen - Whether to render full screen (default: false)
 * @param {Function} props.onRetry - Optional retry callback function
 * @param {string} props.retryLabel - Label for retry button (default: "Try Again")
 * @param {string} props.className - Additional CSS classes
 */
export default function ErrorState({
  title = 'Error',
  message,
  fullScreen = false,
  onRetry = null,
  retryLabel = 'Try Again',
  className = '',
}) {
  const containerClasses = fullScreen
    ? 'min-h-screen bg-[#0A0A0A] flex items-center justify-center'
    : 'flex items-center justify-center py-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">{title}</h2>
        <p className="text-gray-400 mb-6">{message || 'Something went wrong'}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/10"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

