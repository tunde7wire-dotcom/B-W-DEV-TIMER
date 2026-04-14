import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, leftAction, rightAction }) => {
  const { settings } = useStore();

  return (
    <div className={cn(
      "h-full flex flex-col font-sans transition-colors duration-500",
      settings.darkroomMode ? "bg-black text-red-600" : "bg-[#151619] text-white"
    )} style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 border-b border-white/10 sticky top-0 bg-inherit z-40">
        <div className="w-10">{leftAction}</div>
        <h1 className="text-lg font-medium tracking-tight uppercase tracking-widest">{title || 'B&W DEV'}</h1>
        <div className="w-10 flex justify-end">{rightAction}</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 touch-auto will-change-scroll overscroll-contain">
        <AnimatePresence mode="wait">
          <motion.div
            key={title} // Use title as key for screen transitions
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-4 transform-gpu"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white/5 border border-white/10 rounded-2xl p-4 active:scale-[0.98] transition-transform transform-gpu",
      onClick && "cursor-pointer",
      className
    )}
  >
    {children}
  </div>
);

export const Button: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, variant = 'primary', size = 'md', className, onClick, disabled }) => {
  const variants = {
    primary: "bg-white text-black hover:bg-white/90",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg font-medium",
    xl: "px-8 py-6 text-2xl font-bold rounded-3xl",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
};
