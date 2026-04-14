import React, { useEffect, useMemo, useRef } from 'react';
import { Layout, Button } from '../components/Layout';
import { Recipe } from '../types';
import { useTimer } from '../hooks/useTimer';
import { useAudio } from '../hooks/useAudio';
import { calculateTempCompensation, calculatePushPullAdjustment, formatTime } from '../utils/calculations';
import { X, Pause, Play, SkipForward, SkipBack, Plus, Volume2, VolumeX, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';

interface TimerScreenProps {
  recipe: Recipe;
  temp: number;
  pushPull: number;
  onCancel: () => void;
  onComplete: (session: any) => void;
}

export const TimerScreen: React.FC<TimerScreenProps> = ({ recipe, temp, pushPull, onCancel, onComplete }) => {
  const { settings, setLastRecipeId, addSession } = useStore();
  const { playBeep, speak } = useAudio();
  
  const compensatedDevTime = useMemo(() => {
    const tempComp = calculateTempCompensation(recipe.baseTime, recipe.baseTemp, temp, recipe.unit);
    return calculatePushPullAdjustment(tempComp, pushPull);
  }, [recipe, temp, pushPull]);

  const { state, currentStep, nextStep, prevStep, toggleTimer, extendTime, allSteps } = useTimer(recipe, compensatedDevTime, temp, pushPull);
  const { unlockAudio } = useAudio();
  const [isLocked, setIsLocked] = React.useState(false);
  const [lockHoldProgress, setLockHoldProgress] = React.useState(0);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLockHold = () => {
    if (!isLocked) {
      setIsLocked(true);
      return;
    }
    
    let progress = 0;
    lockTimerRef.current = setInterval(() => {
      progress += 5;
      setLockHoldProgress(progress);
      if (progress >= 100) {
        setIsLocked(false);
        setLockHoldProgress(0);
        if (lockTimerRef.current) clearInterval(lockTimerRef.current);
      }
    }, 50);
  };

  const stopLockHold = () => {
    if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    setLockHoldProgress(0);
  };

  // Handle alerts
  useEffect(() => {
    if (state.timeLeft === 10) {
      playBeep(880, 0.5);
      speak(`10 seconds left of ${currentStep.name}`);
    }
    if (state.timeLeft === 0 && state.isRunning) {
      playBeep(1320, 1);
      if (state.currentStepIndex < allSteps.length - 1) {
        speak(`Next step: ${allSteps[state.currentStepIndex + 1].name}`);
      } else {
        speak("Development complete");
        // Auto-complete
        const session = {
          id: crypto.randomUUID(),
          recipeId: recipe.id,
          recipeName: recipe.name,
          date: new Date().toISOString(),
          temp,
          pushPull,
          totalTime: state.totalTimeElapsed,
          rating: 0,
          notes: '',
        };
        addSession(session);
        setLastRecipeId(recipe.id);
        onComplete(session);
      }
    }
  }, [state.timeLeft]);

  // Handle agitation alerts
  useEffect(() => {
    // Start of agitation
    if (state.isAgitating && state.agitationTimeLeft === (state.agitationTotal - 1)) {
      playBeep(660, 0.1);
      speak("Begin Agitation");
    }
    // End of agitation
    if (state.wasAgitating && !state.isAgitating && state.isRunning) {
      playBeep(440, 0.1);
      speak("Stop Agitation");
    }
  }, [state.isAgitating, state.wasAgitating, state.agitationTimeLeft, state.agitationTotal, state.isRunning]);

  const progress = (state.currentStepIndex / allSteps.length) * 100;
  
  // Calculate agitation ring progress
  const agitationProgress = state.isAgitating 
    ? ((state.agitationTotal - state.agitationTimeLeft) / state.agitationTotal) * 100 
    : 0;

  return (
    <div 
      className={settings.darkroomMode ? "bg-black text-red-600 h-full flex flex-col" : "bg-[#151619] text-white h-full flex flex-col"}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="p-2 opacity-50"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest opacity-50">Step {state.currentStepIndex + 1} of {allSteps.length}</p>
          <h2 className="text-sm font-bold uppercase tracking-tight">{recipe.name}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              unlockAudio();
              useStore.getState().updateSettings({ voiceEnabled: !settings.voiceEnabled });
            }} 
            className="p-2 opacity-50"
          >
            {settings.voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          <button 
            onMouseDown={startLockHold}
            onMouseUp={stopLockHold}
            onMouseLeave={stopLockHold}
            onTouchStart={startLockHold}
            onTouchEnd={stopLockHold}
            className="p-2 opacity-50 relative"
          >
            {isLocked ? (
              <>
                <Lock size={24} className={lockHoldProgress > 0 ? "text-white" : ""} />
                {lockHoldProgress > 0 && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="100 100"
                      strokeDashoffset={100 - lockHoldProgress}
                      pathLength="100"
                    />
                  </svg>
                )}
              </>
            ) : <Unlock size={24} />}
          </button>
        </div>
      </header>

      {/* Main Timer Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Progress Ring Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-[85%] aspect-square rounded-full relative">
              {/* Static Background Ring */}
              <div className="absolute inset-0 border-[16px] border-white/5 rounded-full" />
              
              {/* Agitation Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  fill="none"
                  stroke={settings.darkroomMode ? "#ef4444" : "#3b82f6"}
                  strokeWidth="16"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - agitationProgress}
                  pathLength="100"
                  className="transition-all duration-1000 ease-linear"
                  style={{ opacity: state.isAgitating ? 1 : 0 }}
                />
              </svg>
           </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center z-10"
          >
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">{currentStep.name}</h1>
            <div className="text-[90px] font-mono font-bold leading-none tracking-tighter tabular-nums">
              {formatTime(state.timeLeft)}
            </div>
            {currentStep.notes && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="mt-4 text-sm max-w-[200px] mx-auto leading-relaxed italic"
              >
                {currentStep.notes}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <footer className="p-8 space-y-8 bg-black/20 backdrop-blur-xl border-t border-white/5">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-current"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Button 
            variant="secondary" 
            size="md" 
            className="flex-1 rounded-full"
            onClick={prevStep}
            disabled={isLocked || state.currentStepIndex === 0}
          >
            <SkipBack size={20} />
          </Button>

          <Button 
            variant="primary" 
            size="xl" 
            className="h-24 w-24 rounded-full shadow-2xl"
            onClick={() => {
              unlockAudio();
              toggleTimer();
            }}
            disabled={isLocked}
          >
            {state.isRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
          </Button>

          <Button 
            variant="secondary" 
            size="md" 
            className="flex-1 rounded-full"
            onClick={nextStep}
            disabled={isLocked || state.currentStepIndex === allSteps.length - 1}
          >
            <SkipForward size={20} />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-50"
            onClick={() => extendTime(30)}
            disabled={isLocked}
          >
            <Plus size={16} /> 30s
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-50"
            onClick={() => extendTime(60)}
            disabled={isLocked}
          >
            <Plus size={16} /> 1m
          </Button>
        </div>
      </footer>
    </div>
  );
};
