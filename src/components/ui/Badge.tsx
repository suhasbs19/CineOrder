import { cn, contentTypeLabels, contentTypeColors } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'content-type';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  contentType?: string;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white/10 text-white/80',
  primary: 'bg-primary/20 text-primary',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
};

export function Badge({ children, variant = 'default', contentType, className }: BadgeProps) {
  if (contentType) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider',
          contentTypeColors[contentType] || 'bg-gray-600',
          'text-white',
          className
        )}
      >
        {contentTypeLabels[contentType] || contentType}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
