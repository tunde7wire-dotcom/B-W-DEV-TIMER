/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from './store/useStore';
import { LaunchScreen } from './screens/LaunchScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RecipeDetailScreen } from './screens/RecipeDetailScreen';
import { TimerScreen } from './screens/TimerScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SessionSummaryScreen } from './screens/SessionSummaryScreen';
import { RecipeEditScreen } from './screens/RecipeEditScreen';
import { Recipe, Session } from './types';
import { useAudio } from './hooks/useAudio';

type Screen = 'launch' | 'home' | 'recipe-detail' | 'recipe-edit' | 'timer' | 'summary' | 'history' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('launch');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeSession, setActiveSession] = useState<{ recipe: Recipe; temp: number; pushPull: number } | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [transitionStage, setTransitionStage] = useState(0);

  const { settings, updateRecipe, addRecipe, activeTimer, recipes } = useStore();
  const { unlockAudio } = useAudio();

  // Session recovery
  useEffect(() => {
    if (activeTimer && currentScreen === 'launch') {
      const recipe = recipes.find(r => r.id === activeTimer.recipeId);
      if (recipe) {
        setActiveSession({
          recipe,
          temp: activeTimer.temp,
          pushPull: activeTimer.pushPull
        });
        setCurrentScreen('timer');
      }
    }
  }, []);

  // Apply darkroom mode to body
  useEffect(() => {
    if (settings.darkroomMode) {
      document.body.style.backgroundColor = 'black';
      document.documentElement.style.backgroundColor = 'black';
    } else {
      document.body.style.backgroundColor = '#151619';
      document.documentElement.style.backgroundColor = '#151619';
    }
  }, [settings.darkroomMode]);

  const navigateTo = (screen: Screen, data?: any) => {
    if (screen === 'recipe-detail' || screen === 'recipe-edit') setSelectedRecipe(data);
    if (screen === 'timer') setActiveSession(data);
    if (screen === 'summary') setLastSession(data);
    setCurrentScreen(screen);
  };

  const handleStartTransition = () => {
    setTransitionStage(1);
    
    setTimeout(() => setTransitionStage(2), 800);
    setTimeout(() => setTransitionStage(3), 1600);
    setTimeout(() => {
      setCurrentScreen('home');
      setTransitionStage(4);
    }, 2400);
    setTimeout(() => setTransitionStage(5), 3600);
    setTimeout(() => setTransitionStage(6), 4800);
    setTimeout(() => setTransitionStage(7), 6000);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'launch':
        return <LaunchScreen onStart={handleStartTransition} transitionStage={transitionStage} />;
      case 'home':
        return <HomeScreen 
          onSelectRecipe={(r) => navigateTo('recipe-detail', r)} 
          onNewRecipe={() => {
            const newId = crypto.randomUUID();
            const newRecipe: Recipe = {
              id: newId,
              name: 'New Recipe',
              film: '',
              developer: '',
              dilution: '',
              iso: 400,
              baseTemp: 68,
              baseTime: 600,
              unit: 'F',
              steps: [
                { id: 'prewash', name: 'Pre-Wash', duration: 120, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'developer', name: 'Developer', duration: 600, agitation: { enabled: true, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'stop', name: 'Stop Bath', duration: 60, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'fixer', name: 'Fixer', duration: 300, agitation: { enabled: true, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'wash1', name: 'Wash', duration: 60, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'hypo', name: 'Hypo Clear', duration: 120, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'wash2', name: 'Final Wash', duration: 300, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: 'Wash Patterson tank with hot water prior to Wetting Agent step' },
                { id: 'wetting', name: 'Wetting Agent', duration: 120, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'dryer', name: 'Dryer', duration: 900, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
              ],
              notes: '',
              isCustom: true
            };
            navigateTo('recipe-edit', newRecipe);
          }}
          onGoToHistory={() => navigateTo('history')} 
          onGoToSettings={() => navigateTo('settings')} 
        />;
      case 'recipe-detail':
        return selectedRecipe ? (
          <RecipeDetailScreen 
            recipe={selectedRecipe} 
            onBack={() => navigateTo('home')} 
            onEdit={() => navigateTo('recipe-edit', selectedRecipe)}
            onStart={(data) => {
              unlockAudio();
              navigateTo('timer', data);
            }} 
          />
        ) : null;
      case 'recipe-edit':
        return selectedRecipe ? (
          <RecipeEditScreen 
            recipe={selectedRecipe} 
            onBack={() => navigateTo('recipe-detail', selectedRecipe)}
            onSave={(updated) => {
              const exists = recipes.some(r => r.id === updated.id);
              if (exists) {
                updateRecipe(updated);
              } else {
                addRecipe(updated);
              }
              navigateTo('recipe-detail', updated);
            }}
          />
        ) : null;
      case 'timer':
        return activeSession ? (
          <TimerScreen 
            recipe={activeSession.recipe} 
            temp={activeSession.temp} 
            pushPull={activeSession.pushPull}
            onCancel={() => {
              useStore.getState().setActiveTimer(null);
              navigateTo('recipe-detail', activeSession.recipe);
            }}
            onComplete={(session) => {
              useStore.getState().setActiveTimer(null);
              navigateTo('summary', session);
            }}
          />
        ) : null;
      case 'summary':
        return lastSession ? (
          <SessionSummaryScreen 
            session={lastSession} 
            onDone={() => navigateTo('home')} 
          />
        ) : null;
      case 'history':
        return <HistoryScreen onBack={() => navigateTo('home')} onSelectSession={(s) => {
          const recipe = useStore.getState().recipes.find(r => r.id === s.recipeId);
          if (recipe) navigateTo('recipe-detail', recipe);
        }} />;
      case 'settings':
        return <SettingsScreen onBack={() => navigateTo('home')} />;
      default:
        return <HomeScreen 
          onSelectRecipe={(r) => navigateTo('recipe-detail', r)} 
          onNewRecipe={() => {
            const newId = crypto.randomUUID();
            const newRecipe: Recipe = {
              id: newId,
              name: 'New Recipe',
              film: '',
              developer: '',
              dilution: '',
              iso: 400,
              baseTemp: 68,
              baseTime: 600,
              unit: 'F',
              steps: [
                { id: 'prewash', name: 'Pre-Wash', duration: 120, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'developer', name: 'Developer', duration: 600, agitation: { enabled: true, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'stop', name: 'Stop Bath', duration: 60, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'fixer', name: 'Fixer', duration: 300, agitation: { enabled: true, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'wash1', name: 'Wash', duration: 60, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'hypo', name: 'Hypo Clear', duration: 120, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'wash2', name: 'Final Wash', duration: 300, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: 'Wash Patterson tank with hot water prior to Wetting Agent step' },
                { id: 'wetting', name: 'Wetting Agent', duration: 120, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'dryer', name: 'Dryer', duration: 900, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
              ],
              notes: '',
              isCustom: true
            };
            navigateTo('recipe-edit', newRecipe);
          }}
          onGoToHistory={() => navigateTo('history')} 
          onGoToSettings={() => navigateTo('settings')} 
        />;
    }
  };

  return (
    <div className={`max-w-md mx-auto h-full shadow-2xl overflow-hidden relative transition-colors duration-500 ${settings.darkroomMode ? 'bg-black' : 'bg-[#151619]'}`}>
      {renderScreen()}

      {/* Interaction Blocker */}
      {transitionStage > 0 && transitionStage < 7 && (
        <div className="absolute inset-0 z-[100] cursor-default" />
      )}

      {/* Left Intro Light Off */}
      <motion.div
        className="absolute inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: transitionStage >= 1 && transitionStage < 4 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 80%)' }}
      />
      
      {/* Right Intro Light Off */}
      <motion.div
        className="absolute inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: transitionStage >= 2 && transitionStage < 4 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ background: 'linear-gradient(225deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 80%)' }}
      />

      {/* Center Intro Light Off (Full Blackout) */}
      <motion.div
        className="absolute inset-0 z-50 pointer-events-none bg-black"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: transitionStage === 0 ? 0 :
                   transitionStage === 1 ? 0 :
                   transitionStage === 2 ? 0 :
                   transitionStage === 3 ? 1 :
                   transitionStage === 4 ? 0.8 :
                   transitionStage === 5 ? 0.5 :
                   transitionStage === 6 ? 0.2 :
                   0
        }}
        transition={{ duration: 0.6 }}
      />

      {/* Left Safelight */}
      {!settings.darkroomMode && (
        <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={
            transitionStage >= 4 ? {
              opacity: [0, 0.14, 0.05, 0.22, 0.10, 0.25, 0.18],
            } : { opacity: 0 }
          }
          transition={
            transitionStage >= 4 ? {
              duration: 3.0,
              times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
              ease: "easeInOut"
            } : { duration: 0 }
          }
          style={{
            background: 'linear-gradient(135deg, #FF5A36 0%, #E63B2E 40%, rgba(255,179,71,0.1) 70%, transparent 100%)',
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Right Safelight */}
      {!settings.darkroomMode && (
        <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={
            transitionStage >= 5 ? {
              opacity: [0, 0.14, 0.05, 0.22, 0.10, 0.25, 0.18],
            } : { opacity: 0 }
          }
          transition={
            transitionStage >= 5 ? {
              duration: 3.0,
              times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
              ease: "easeInOut"
            } : { duration: 0 }
          }
          style={{
            background: 'linear-gradient(225deg, #FF5A36 0%, #E63B2E 40%, rgba(255,179,71,0.1) 70%, transparent 100%)',
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Center Safelight */}
      {!settings.darkroomMode && (
        <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={
            transitionStage >= 6 ? {
              opacity: [0, 0.14, 0.05, 0.22, 0.10, 0.25, 0.18],
            } : { opacity: 0 }
          }
          transition={
            transitionStage >= 6 ? {
              duration: 3.0,
              times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
              ease: "easeInOut"
            } : { duration: 0 }
          }
          style={{
            background: 'radial-gradient(100% 100% at 50% 0%, #FF5A36 0%, #E63B2E 50%, rgba(255,179,71,0.15) 80%, transparent 100%)',
            mixBlendMode: 'screen'
          }}
        />
      )}
    </div>
  );
}
