import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe, Session, Settings, TemperatureUnit } from '../types';
import { PRESETS } from '../data/presets';

export interface ActiveTimerState {
  recipeId: string;
  currentStepIndex: number;
  timeLeft: number;
  isRunning: boolean;
  lastTick: number; // timestamp
  temp: number;
  pushPull: number;
}

interface AppState {
  recipes: Recipe[];
  history: Session[];
  settings: Settings;
  lastRecipeId: string | null;
  activeTimer: ActiveTimerState | null;
  
  // Actions
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  deleteRecipes: (ids: string[]) => void;
  addSession: (session: Session) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setLastRecipeId: (id: string) => void;
  setActiveTimer: (state: ActiveTimerState | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      recipes: PRESETS,
      history: [],
      settings: {
        unit: 'F',
        soundEnabled: true,
        voiceEnabled: true,
        keepScreenAwake: true,
        darkroomMode: true,
      },
      lastRecipeId: null,
      activeTimer: null,

      addRecipe: (recipe) => set((state) => ({ 
        recipes: [...state.recipes, { ...recipe, id: recipe.id || crypto.randomUUID(), isCustom: true }] 
      })),
      
      updateRecipe: (recipe) => set((state) => ({
        recipes: state.recipes.map((r) => (r.id === recipe.id ? recipe : r))
      })),
      
      deleteRecipe: (id) => set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id)
      })),
      
      deleteRecipes: (ids) => set((state) => ({
        recipes: state.recipes.filter((r) => !ids.includes(r.id))
      })),
      
      addSession: (session) => set((state) => ({
        history: [session, ...state.history]
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      setLastRecipeId: (id) => set({ lastRecipeId: id }),

      setActiveTimer: (activeTimer) => set({ activeTimer }),
    }),
    {
      name: 'bw-dev-timer-storage',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          // Reset recipes to just the new PRESETS
          return { ...persistedState, recipes: PRESETS };
        }
        return persistedState;
      }
    }
  )
);
