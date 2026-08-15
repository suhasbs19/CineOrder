import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'auto';
  /** Shows "45 / 61 watched" alongside the percentage */
  detailed?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = true,
  size = 'md',
  color = 'auto',
  detailed = false,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorStyles = {
    primary: 'bg-gradient-to-r from-primary to-red-400',
    success: 'bg-gradient-to-r from-green-500 to-emerald-400',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-400',
  };

  const getColor = () => {
    if (color !== 'auto') return colorStyles[color] || colorStyles.primary;
    if (percentage === 100) return colorStyles.success;
    if (percentage >= 75) return 'bg-gradient-to-r from-green-500 to-emerald-400';
    if (percentage >= 25) return colorStyles.primary;
    return colorStyles.warning;
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || detailed) && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-muted-light">Progress</span>
          <div className="flex items-center gap-2">
            {detailed && max > 1 && (
              <span className="text-xs text-muted">
                {value} / {max} watched
              </span>
            )}
            {showLabel && (
              <span className={cn(
                'text-sm font-bold',
                percentage === 100 ? 'text-green-400' : 'text-white'
              )}>
                {percentage}%
              </span>
            )}
          </div>
        </div>
      )}
      <div className={cn('w-full bg-surface rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            getColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
