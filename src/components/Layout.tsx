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

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => {
  const { settings } = useStore();
  return (
    <div 
      onClick={onClick}
      className={cn(
        "border rounded-2xl p-4 active:scale-[0.98] transition-transform transform-gpu",
        settings.darkroomMode 
          ? "bg-black border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]" 
          : "bg-white/5 border-white/10",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const { settings } = useStore();
  
  const variants = {
    primary: settings.darkroomMode 
      ? "bg-red-900 text-red-100 hover:bg-red-800 border border-red-700" 
      : "bg-white text-black hover:bg-white/90",
    secondary: settings.darkroomMode
      ? "bg-black text-red-500 hover:bg-red-950/30 border border-red-900/50"
      : "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: settings.darkroomMode
      ? "bg-transparent text-red-500 hover:bg-red-950/30"
      : "bg-transparent text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg font-medium",
    xl: "px-8 py-6 text-2xl font-bold rounded-3xl",
  };

  return (
    <button
      {...props}
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
