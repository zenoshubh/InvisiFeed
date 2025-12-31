'use client';

import { Loader2 } from 'lucide-react';

/**
 * Reusable loading state component
 * @param {object} props
 * @param {string} props.message - Loading message (default: "Loading...")
 * @param {string} props.size - Size of loader icon: "sm", "md", "lg" (default: "md")
 * @param {boolean} props.fullScreen - Whether to render full screen (default: false)
 * @param {string} props.className - Additional CSS classes
 */
export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const containerClasses = fullScreen
    ? 'min-h-screen bg-[#0A0A0A] flex items-center justify-center'
    : 'flex items-center justify-center py-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex items-center gap-2 text-yellow-400">
        <Loader2 className={`${sizeClasses[size]} animate-spin`} />
        <span className="text-sm md:text-base">{message}</span>
      </div>
    </div>
  );
}

