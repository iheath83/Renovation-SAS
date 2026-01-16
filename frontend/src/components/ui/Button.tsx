import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          variant === 'primary' && [
            'bg-primary-600 text-white hover:bg-primary-500',
            'shadow-lg shadow-primary-600/25 hover:shadow-primary-500/30',
          ],
          variant === 'secondary' && [
            'glass text-primary hover-bg',
          ],
          variant === 'ghost' && [
            'text-secondary hover:text-primary hover-bg',
          ],
          variant === 'danger' && [
            'bg-red-600 text-white hover:bg-red-500',
            'shadow-lg shadow-red-600/25',
          ],
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-sm rounded-lg',
          size === 'md' && 'px-4 py-2 text-sm rounded-xl',
          size === 'lg' && 'px-6 py-3 text-base rounded-xl',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

