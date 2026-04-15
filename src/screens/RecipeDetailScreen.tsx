import React, { useState, useMemo } from 'react';
import { Layout, Card, Button } from '../components/Layout';
import { Recipe, Step } from '../types';
import { ChevronLeft, Thermometer, FastForward, Info, Play, Plus, Trash2, GripVertical } from 'lucide-react';
import { calculateTempCompensation, calculatePushPullAdjustment, formatTime, formatDuration } from '../utils/calculations';
import { useStore } from '../store/useStore';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onStart: (data: { recipe: Recipe; temp: number; pushPull: number }) => void;
}

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ recipe, onBack, onEdit, onStart }) => {
  const { settings } = useStore();
  const [temp, setTemp] = useState(recipe.baseTemp);
  const [pushPull, setPushPull] = useState(0);

  const compensatedTime = useMemo(() => {
    const tempComp = calculateTempCompensation(recipe.baseTime, recipe.baseTemp, temp, recipe.unit);
    return calculatePushPullAdjustment(tempComp, pushPull);
  }, [recipe, temp, pushPull]);

  const isAdjusted = temp !== recipe.baseTemp || pushPull !== 0;

  return (
    <Layout 
      title="Recipe"
      leftAction={<button onClick={onBack}><ChevronLeft size={24} /></button>}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <header>
          <h2 className="text-3xl font-bold leading-tight">{recipe.name}</h2>
          <p className="text-lg opacity-60">{recipe.film} • {recipe.developer} ({recipe.dilution})</p>
        </header>

        {/* Adjustments */}
        <section className="grid grid-cols-2 gap-4">
          <Card className="space-y-2">
            <div className="flex items-center gap-2 opacity-50 text-xs font-bold uppercase tracking-wider">
              <Thermometer size={14} /> Temperature
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setTemp(t => t - 1)} className={`h-8 w-8 rounded-full flex items-center justify-center ${settings.darkroomMode ? 'bg-red-900/50' : 'bg-white/10'}`}>-</button>
              <span className="text-xl font-bold">{temp}°{recipe.unit}</span>
              <button onClick={() => setTemp(t => t + 1)} className={`h-8 w-8 rounded-full flex items-center justify-center ${settings.darkroomMode ? 'bg-red-900/50' : 'bg-white/10'}`}>+</button>
            </div>
          </Card>
          <Card className="space-y-2">
            <div className="flex items-center gap-2 opacity-50 text-xs font-bold uppercase tracking-wider">
              <FastForward size={14} /> Push / Pull
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setPushPull(p => Math.max(-2, p - 1))} className={`h-8 w-8 rounded-full flex items-center justify-center ${settings.darkroomMode ? 'bg-red-900/50' : 'bg-white/10'}`}>-</button>
              <span className="text-xl font-bold">{pushPull > 0 ? `+${pushPull}` : pushPull}</span>
              <button onClick={() => setPushPull(p => Math.min(3, p + 1))} className={`h-8 w-8 rounded-full flex items-center justify-center ${settings.darkroomMode ? 'bg-red-900/50' : 'bg-white/10'}`}>+</button>
            </div>
          </Card>
        </section>

        {/* Time Summary */}
        <Card className={isAdjusted ? (settings.darkroomMode ? "bg-red-950/30 border-red-500/30" : "bg-white/10 border-white/30") : ""}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Total Dev Time</p>
              <h3 className="text-4xl font-mono font-bold">{formatTime(compensatedTime)}</h3>
            </div>
            {isAdjusted && (
              <div className="text-right">
                <p className="text-[10px] opacity-40 line-through">{formatTime(recipe.baseTime)} base</p>
                <p className={`text-[10px] ${settings.darkroomMode ? 'text-red-400' : 'text-green-400'}`}>Adjusted</p>
              </div>
            )}
          </div>
        </Card>

        {/* Steps */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-50">Workflow Steps</h2>
            <button onClick={onEdit} className={`text-xs font-bold uppercase tracking-widest ${settings.darkroomMode ? 'text-red-500/80' : 'text-white/80'}`}>Edit Steps</button>
          </div>
          <div className="space-y-2">
            {recipe.steps.map((step, idx) => (
              <div key={step.id} className={`flex items-center gap-4 p-3 rounded-xl border ${settings.darkroomMode ? 'bg-red-950/10 border-red-900/30' : 'bg-white/5 border-white/5'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${settings.darkroomMode ? 'bg-red-900/50' : 'bg-white/10'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{step.name}</h4>
                  <p className="text-[10px] opacity-40">
                    {step.agitation.enabled ? `Agitation: ${step.agitation.initialDuration}s then ${step.agitation.duration}s/${step.agitation.interval}s` : 'No agitation'}
                  </p>
                </div>
                <div className="text-sm font-mono opacity-60">
                  {formatTime(step.id === 'developer' ? compensatedTime : step.duration)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Start Button */}
        <div className="pt-4 sticky bottom-4">
          <Button 
            variant="primary" 
            size="xl" 
            className="w-full shadow-2xl"
            onClick={() => onStart({ recipe, temp, pushPull })}
          >
            <Play fill="currentColor" size={24} /> START TIMER
          </Button>
        </div>
      </div>
    </Layout>
  );
};
