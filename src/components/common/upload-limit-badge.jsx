'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/**
 * Reusable upload limit badge component
 * @param {object} props
 * @param {number} props.dailyUploadCount - Current daily upload count
 * @param {number} props.dailyLimit - Daily upload limit
 * @param {number} props.timeLeft - Hours left until reset (optional)
 * @param {string} props.className - Additional CSS classes
 */
export default function UploadLimitBadge({
  dailyUploadCount,
  dailyLimit,
  timeLeft = null,
  className = '',
}) {
  const isLimitReached = dailyUploadCount >= dailyLimit;
  const percentage = Math.min((dailyUploadCount / dailyLimit) * 100, 100);

  return (
    <div
      className={`bg-gray-900/50 border rounded-lg p-4 ${
        isLimitReached
          ? 'border-red-500/20'
          : 'border-yellow-400/20'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isLimitReached ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-yellow-400" />
          )}
          <span className="text-sm font-medium text-white">
            Daily Upload Limit
          </span>
        </div>
        <span
          className={`text-sm font-semibold ${
            isLimitReached ? 'text-red-400' : 'text-yellow-400'
          }`}
        >
          {dailyUploadCount} / {dailyLimit}
        </span>
      </div>

      <Progress
        value={percentage}
        className="h-2 mb-2"
      />

      {isLimitReached && timeLeft !== null && (
        <p className="text-xs text-gray-400 mt-2">
          Limit resets in {timeLeft} hour{timeLeft !== 1 ? 's' : ''}
        </p>
      )}

      {!isLimitReached && (
        <p className="text-xs text-gray-400 mt-2">
          {dailyLimit - dailyUploadCount} upload{dailyLimit - dailyUploadCount !== 1 ? 's' : ''} remaining today
        </p>
      )}
    </div>
  );
}

