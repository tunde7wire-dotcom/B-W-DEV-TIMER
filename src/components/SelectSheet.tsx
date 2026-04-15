import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (val: any) => void;
  title: string;
}

export const SelectSheet: React.FC<SelectSheetProps> = ({ isOpen, onClose, options, value, onChange, title }) => {
  const { settings } = useStore();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 left-0 right-0 rounded-t-3xl z-[101] pb-safe overflow-hidden flex flex-col max-h-[80vh] shadow-2xl border-t ${settings.darkroomMode ? 'bg-black border-red-900/50' : 'bg-[#1c1c1e] border-white/10'}`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className={`p-4 border-b flex justify-between items-center sticky top-0 z-10 ${settings.darkroomMode ? 'bg-black border-red-900/30' : 'bg-[#1c1c1e] border-white/10'}`}>
              <div className="w-16" /> {/* Spacer for centering */}
              <h3 className={`font-semibold text-lg ${settings.darkroomMode ? 'text-red-500' : 'text-white'}`}>{title}</h3>
              <button onClick={onClose} className={`font-semibold w-16 text-right ${settings.darkroomMode ? 'text-red-400' : 'text-blue-500'}`}>Done</button>
            </div>
            <div className="overflow-y-auto p-2 pb-8">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-4 flex items-center justify-between rounded-xl transition-colors ${settings.darkroomMode ? 'text-red-500 active:bg-red-900/30' : 'text-white active:bg-white/10'}`}
                >
                  <span className={value === opt.value ? 'font-semibold' : ''}>{opt.label}</span>
                  {value === opt.value && <Check size={20} className={settings.darkroomMode ? 'text-red-400' : 'text-blue-500'} />}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
