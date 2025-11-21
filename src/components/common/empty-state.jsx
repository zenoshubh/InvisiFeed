'use client';

import { Inbox } from 'lucide-react';

/**
 * Reusable empty state component
 * @param {object} props
 * @param {string} props.title - Empty state title
 * @param {string} props.message - Empty state message
 * @param {React.ReactNode} props.icon - Optional custom icon component
 * @param {React.ReactNode} props.action - Optional action button/component
 * @param {string} props.className - Additional CSS classes
 */
export default function EmptyState({
  title,
  message,
  icon = null,
  action = null,
  className = '',
}) {
  const IconComponent = icon || Inbox;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="p-4 bg-gray-800/50 rounded-full mb-4">
        <IconComponent className="w-8 h-8 text-gray-400" />
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      )}
      {message && (
        <p className="text-gray-400 text-center max-w-md mb-6">{message}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

