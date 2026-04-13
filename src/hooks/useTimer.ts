import { useState, useEffect, useRef, useCallback } from 'react';
import { Step, Recipe } from '../types';
import { useStore } from '../store/useStore';

export interface TimerState {
  currentStepIndex: number;
  timeLeft: number;
  isRunning: boolean;
  isAgitating: boolean;
  wasAgitating: boolean;
  agitationTimeLeft: number;
  agitationTotal: number;
  totalTimeElapsed: number;
}

export const useTimer = (recipe: Recipe, compensatedDevTime: number, initialTemp: number, initialPushPull: number) => {
  const { activeTimer, setActiveTimer } = useStore();
  const activeSteps = recipe.steps.filter(s => s.enabled);

  const [state, setState] = useState<TimerState>(() => {
    // Try to recover from store if it's the same recipe
    if (activeTimer && activeTimer.recipeId === recipe.id) {
      const now = Date.now();
      const elapsedSinceLastTick = Math.floor((now - activeTimer.lastTick) / 1000);
      
      let timeLeft = activeTimer.timeLeft;
      let isRunning = activeTimer.isRunning;

      if (isRunning && elapsedSinceLastTick > 0) {
        timeLeft = Math.max(0, timeLeft - elapsedSinceLastTick);
      }

      return {
        currentStepIndex: activeTimer.currentStepIndex,
        timeLeft: timeLeft,
        isRunning: isRunning,
        isAgitating: false,
        wasAgitating: false,
        agitationTimeLeft: 0,
        agitationTotal: 0,
        totalTimeElapsed: 0, // We don't strictly need this for recovery yet
      };
    }

    // Default initialization
    const firstStep = activeSteps[0];
    const duration = firstStep.id === 'developer' ? compensatedDevTime : firstStep.duration;
    return {
      currentStepIndex: 0,
      timeLeft: duration,
      isRunning: false,
      isAgitating: false,
      wasAgitating: false,
      agitationTimeLeft: 0,
      agitationTotal: 0,
      totalTimeElapsed: 0,
    };
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to store for recovery
  useEffect(() => {
    setActiveTimer({
      recipeId: recipe.id,
      currentStepIndex: state.currentStepIndex,
      timeLeft: state.timeLeft,
      isRunning: state.isRunning,
      lastTick: Date.now(),
      temp: initialTemp,
      pushPull: initialPushPull
    });
  }, [state, recipe.id, initialTemp, initialPushPull, setActiveTimer]);

  const nextStep = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentStepIndex + 1;
      if (nextIndex < activeSteps.length) {
        const nextStep = activeSteps[nextIndex];
        const duration = nextStep.id === 'developer' ? compensatedDevTime : nextStep.duration;
        return {
          ...prev,
          currentStepIndex: nextIndex,
          timeLeft: duration,
          isAgitating: false,
          wasAgitating: false,
          agitationTimeLeft: 0,
          agitationTotal: 0,
        };
      }
      return { ...prev, isRunning: false };
    });
  }, [activeSteps, compensatedDevTime]);

  const prevStep = useCallback(() => {
    setState(prev => {
      const prevIndex = Math.max(0, prev.currentStepIndex - 1);
      const prevStep = activeSteps[prevIndex];
      const duration = prevStep.id === 'developer' ? compensatedDevTime : prevStep.duration;
      return {
        ...prev,
        currentStepIndex: prevIndex,
        timeLeft: duration,
        isAgitating: false,
        wasAgitating: false,
        agitationTimeLeft: 0,
        agitationTotal: 0,
      };
    });
  }, [activeSteps, compensatedDevTime]);

  const toggleTimer = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const extendTime = useCallback((seconds: number) => {
    setState(prev => ({ ...prev, timeLeft: prev.timeLeft + seconds }));
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      const expectedEnd = Date.now() + state.timeLeft * 1000;
      
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expectedEnd - now) / 1000));
        
        setState(prev => {
          if (remaining <= 0 && prev.timeLeft > 0) {
             // Step complete logic
             if (prev.currentStepIndex >= activeSteps.length - 1) {
               return { ...prev, timeLeft: 0, isRunning: false };
             }
             const nextIndex = prev.currentStepIndex + 1;
             const nextStep = activeSteps[nextIndex];
             const duration = nextStep.id === 'developer' ? compensatedDevTime : nextStep.duration;
             return {
               ...prev,
               currentStepIndex: nextIndex,
               timeLeft: duration,
               isAgitating: false,
               wasAgitating: false,
               agitationTimeLeft: 0,
               agitationTotal: 0,
             };
          }

          const newTimeLeft = remaining;
          const currentStep = activeSteps[prev.currentStepIndex];
          const stepDuration = (currentStep.id === 'developer' ? compensatedDevTime : currentStep.duration);
          const elapsedInStep = stepDuration - newTimeLeft;
          
          let isAgitating = false;
          let agitationTimeLeft = 0;
          let currentAgitationTotal = 0;

          if (currentStep.agitation.enabled) {
            if (currentStep.agitation.customSequence && currentStep.agitation.customSequence.length > 0) {
              const activeAgitation = currentStep.agitation.customSequence.find(a => 
                elapsedInStep >= a.time && elapsedInStep < a.time + a.duration
              );
              if (activeAgitation) {
                isAgitating = true;
                agitationTimeLeft = (activeAgitation.time + activeAgitation.duration) - elapsedInStep;
                currentAgitationTotal = activeAgitation.duration;
              }
            } else {
              if (elapsedInStep < currentStep.agitation.initialDuration) {
                isAgitating = true;
                agitationTimeLeft = currentStep.agitation.initialDuration - elapsedInStep;
                currentAgitationTotal = currentStep.agitation.initialDuration;
              } else {
                const interval = currentStep.agitation.interval;
                const duration = currentStep.agitation.duration;
                const currentIntervalIndex = Math.floor(elapsedInStep / interval);
                if (currentIntervalIndex >= 1) {
                  const timeIntoInterval = elapsedInStep % interval;
                  if (timeIntoInterval < duration) {
                    isAgitating = true;
                    agitationTimeLeft = duration - timeIntoInterval;
                    currentAgitationTotal = duration;
                  }
                }
              }
            }
          }

          return {
            ...prev,
            timeLeft: newTimeLeft,
            totalTimeElapsed: prev.totalTimeElapsed + 1,
            wasAgitating: prev.isAgitating,
            isAgitating,
            agitationTimeLeft,
            agitationTotal: currentAgitationTotal,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning, activeSteps, compensatedDevTime]);

  return {
    state,
    currentStep: activeSteps[state.currentStepIndex],
    nextStep,
    prevStep,
    toggleTimer,
    extendTime,
    allSteps: activeSteps,
  };
};
