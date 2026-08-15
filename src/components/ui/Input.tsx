import { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, label, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-muted-light mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
            'hover:border-white/20',
            icon ? 'pl-10' : '',
            error ? 'border-red-500 focus:ring-red-500/50' : '',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
);

Input.displayName = 'Input';

// ─── Search Input ───────────────────────────────────────────

interface SearchInputProps extends Omit<InputProps, 'icon' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

export function SearchInput({ size = 'md', className, ...props }: SearchInputProps) {
  const sizeStyles = {
    sm: 'py-2 text-sm',
    md: 'py-3',
    lg: 'py-4 text-lg',
  };

  return (
    <Input
      icon={<Search className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />}
      className={cn(sizeStyles[size], size === 'lg' && 'pl-12', className)}
      {...props}
    />
  );
}
