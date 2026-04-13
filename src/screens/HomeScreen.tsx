import React, { useState } from 'react';
import { Layout, Card, Button } from '../components/Layout';
import { useStore } from '../store/useStore';
import { Recipe } from '../types';
import { Play, History, Settings, Plus, ChevronRight, Clock, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { formatTime } from '../utils/calculations';

interface HomeScreenProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onNewRecipe: () => void;
  onGoToHistory: () => void;
  onGoToSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectRecipe, onNewRecipe, onGoToHistory, onGoToSettings }) => {
  const { recipes, lastRecipeId, history, deleteRecipe, deleteRecipes } = useStore();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const lastRecipe = recipes.find(r => r.id === lastRecipeId);
  const recentHistory = history.slice(0, 3);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedIds.length} recipes?`)) {
      deleteRecipes(selectedIds);
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  const handleDeleteSingle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this recipe?")) {
      deleteRecipe(id);
    }
  };

  return (
    <Layout 
      title="B&W DEV TIMER"
      rightAction={<button onClick={onGoToSettings}><Settings size={24} /></button>}
    >
      <div className="space-y-8 pb-20">
        {/* Quick Start */}
        {!isSelectionMode && lastRecipe && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">Quick Start</h2>
            <Card 
              onClick={() => onSelectRecipe(lastRecipe)}
              className="bg-gradient-to-br from-white/10 to-white/5 border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{lastRecipe.name}</h3>
                  <p className="text-sm opacity-60">{lastRecipe.film} • {lastRecipe.developer}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center">
                  <Play fill="currentColor" size={20} />
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Recipe List */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-50">
              {isSelectionMode ? `${selectedIds.length} Selected` : 'Recipes'}
            </h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedIds([]);
                }}
                className="text-xs font-bold uppercase tracking-widest text-white/60"
              >
                {isSelectionMode ? 'Cancel' : 'Select'}
              </button>
              {!isSelectionMode && (
                <button 
                  onClick={onNewRecipe}
                  className="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-1"
                >
                  <Plus size={14} /> New
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {recipes.map(recipe => (
              <Card 
                key={recipe.id} 
                onClick={() => isSelectionMode ? toggleSelection(recipe.id) : onSelectRecipe(recipe)}
                className={`py-3 transition-all ${isSelectionMode && selectedIds.includes(recipe.id) ? 'border-white/40 bg-white/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {isSelectionMode && (
                    <div className="text-white/40">
                      {selectedIds.includes(recipe.id) ? (
                        <CheckCircle2 size={20} className="text-white" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold">{recipe.name}</h4>
                    <p className="text-xs opacity-50">{recipe.film} • {recipe.developer}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono opacity-50">{formatTime(recipe.baseTime)}</span>
                    {!isSelectionMode ? (
                      <button 
                        onClick={(e) => handleDeleteSingle(e, recipe.id)}
                        className="p-2 -mr-2 opacity-20 hover:opacity-100 text-red-500 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                    {!isSelectionMode && <ChevronRight size={16} className="opacity-30" />}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Multi-delete Action Bar */}
        {isSelectionMode && selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-6 right-6 z-50">
            <Button 
              variant="primary" 
              className="w-full bg-red-600 hover:bg-red-700 border-none shadow-2xl"
              onClick={handleDeleteSelected}
            >
              DELETE {selectedIds.length} RECIPES
            </Button>
          </div>
        )}

        {/* Recent History */}
        {!isSelectionMode && recentHistory.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest opacity-50">Recent Sessions</h2>
              <button onClick={onGoToHistory} className="text-xs font-bold uppercase tracking-widest text-white/80">View All</button>
            </div>
            <div className="space-y-2">
              {recentHistory.map(session => (
                <div key={session.id} className="flex items-center gap-3 p-2">
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Clock size={16} className="opacity-50" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{session.recipeName}</h4>
                    <p className="text-[10px] opacity-40">{new Date(session.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs font-mono opacity-50">
                    {formatTime(session.totalTime)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};
