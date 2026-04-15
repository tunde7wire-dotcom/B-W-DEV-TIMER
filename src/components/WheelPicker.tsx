import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from './Layout';
import { useStore } from '../store/useStore';

interface WheelPickerProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  isCircular?: boolean;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({ value, min, max, onChange, label, isCircular }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { settings } = useStore();
  
  const baseOptions = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  // For circular scrolling, we repeat the options to simulate infinity
  const options = isCircular ? [...baseOptions, ...baseOptions, ...baseOptions] : baseOptions;
  const itemHeight = 40; // px

  const scrollToValue = useCallback((val: number, smooth = true) => {
    if (!scrollRef.current) return;
    const baseIndex = val - min;
    const targetIndex = isCircular ? baseIndex + baseOptions.length : baseIndex;
    scrollRef.current.scrollTo({
      top: targetIndex * itemHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [min, isCircular, baseOptions.length]);

  // Initial scroll position
  useEffect(() => {
    if (scrollRef.current && !isInitialized) {
      scrollToValue(value, false);
      setIsInitialized(true);
    }
  }, [value, isInitialized, scrollToValue]);

  const handleScroll = () => {
    if (!scrollRef.current || isTyping) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    
    if (isCircular) {
      // If we're near the ends of our tripled list, jump back to the middle section
      if (index < baseOptions.length) {
        scrollRef.current.scrollTop = (index + baseOptions.length) * itemHeight;
        return;
      }
      if (index >= baseOptions.length * 2) {
        scrollRef.current.scrollTop = (index - baseOptions.length) * itemHeight;
        return;
      }
    }

    const newValue = options[index];
    if (newValue !== undefined && newValue !== value) {
      onChange(newValue % (max + 1));
    }
  };

  const handleInputSubmit = () => {
    let num = parseInt(inputValue);
    if (!isNaN(num)) {
      num = Math.max(min, Math.min(max, num));
      onChange(num);
      scrollToValue(num);
    }
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-[8px] font-bold opacity-30 uppercase mb-1">{label}</span>}
      <div className="relative h-[120px] w-16 overflow-hidden">
        {/* Selection Highlight */}
        <div 
          className={`absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 border-y z-20 cursor-text ${settings.darkroomMode ? 'border-red-900/50 bg-red-950/20' : 'border-white/20 bg-white/5'}`}
          onClick={() => {
            setIsTyping(true);
            setInputValue(value.toString().padStart(2, '0'));
          }}
        />
        
        {isTyping ? (
          <div className={`absolute inset-0 z-30 flex items-center justify-center ${settings.darkroomMode ? 'bg-black/90' : 'bg-black/80'}`}>
            <input
              autoFocus
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
              className={`w-full h-10 bg-transparent text-center text-lg font-bold focus:outline-none ${settings.darkroomMode ? 'text-red-500' : 'text-white'}`}
            />
          </div>
        ) : (
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory py-[40px] overscroll-contain"
          >
            {options.map((opt, idx) => (
              <div 
                key={`${opt}-${idx}`}
                className={cn(
                  "h-10 flex items-center justify-center snap-center transition-opacity duration-200",
                  value === (opt % (max + 1)) ? "opacity-100 font-bold text-lg" : "opacity-20 text-sm"
                )}
              >
                {opt.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
