/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { HomeScreen } from './screens/HomeScreen';
import { RecipeDetailScreen } from './screens/RecipeDetailScreen';
import { TimerScreen } from './screens/TimerScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SessionSummaryScreen } from './screens/SessionSummaryScreen';
import { RecipeEditScreen } from './screens/RecipeEditScreen';
import { Recipe, Session } from './types';
import { useAudio } from './hooks/useAudio';

type Screen = 'home' | 'recipe-detail' | 'recipe-edit' | 'timer' | 'summary' | 'history' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeSession, setActiveSession] = useState<{ recipe: Recipe; temp: number; pushPull: number } | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);

  const { settings, updateRecipe, addRecipe, activeTimer, recipes } = useStore();
  const { unlockAudio } = useAudio();

  // Session recovery
  useEffect(() => {
    if (activeTimer && currentScreen === 'home') {
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
    } else {
      document.body.style.backgroundColor = '#151619';
    }
  }, [settings.darkroomMode]);

  const navigateTo = (screen: Screen, data?: any) => {
    if (screen === 'recipe-detail' || screen === 'recipe-edit') setSelectedRecipe(data);
    if (screen === 'timer') setActiveSession(data);
    if (screen === 'summary') setLastSession(data);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen 
          onSelectRecipe={(r) => navigateTo('recipe-detail', r)} 
          onNewRecipe={() => {
            const newRecipe: Recipe = {
              id: '',
              name: 'New Recipe',
              film: '',
              developer: '',
              dilution: '',
              iso: 400,
              baseTemp: 68,
              baseTime: 600,
              unit: 'F',
              steps: [
                { id: 'prewash', name: 'Pre-Wash', duration: 60, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'developer', name: 'Developer', duration: 600, agitation: { enabled: true, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'stop', name: 'Stop Bath', duration: 30, agitation: { enabled: true, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'fixer', name: 'Fixer', duration: 300, agitation: { enabled: true, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'wash1', name: 'Wash', duration: 60, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'hypo', name: 'Hypo Clear', duration: 120, agitation: { enabled: true, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
                { id: 'wash2', name: 'Final Wash', duration: 300, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: 'Wash Patterson tank with hot water prior to Wetting Agent step' },
                { id: 'wetting', name: 'Wetting Agent', duration: 30, agitation: { enabled: false, initialDuration: 30, interval: 60, duration: 10, alertType: 'both' }, enabled: true, notes: '' },
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
              if (updated.isCustom) {
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
        return <HomeScreen onSelectRecipe={(r) => navigateTo('recipe-detail', r)} onGoToHistory={() => navigateTo('history')} onGoToSettings={() => navigateTo('settings')} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-full shadow-2xl overflow-hidden relative">
      {renderScreen()}
    </div>
  );
}
