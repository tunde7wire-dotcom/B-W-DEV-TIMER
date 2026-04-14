import React, { useState, useMemo, useEffect } from 'react';
import { Layout, Card, Button, cn } from '../components/Layout';
import { Recipe, Step } from '../types';
import { ChevronLeft, Plus, Trash2, GripVertical, Save, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { POPULAR_RECIPES } from '../data/popularRecipes';
import { WheelPicker } from '../components/WheelPicker';
import { SelectSheet } from '../components/SelectSheet';

interface RecipeEditScreenProps {
  recipe: Recipe;
  onBack: () => void;
  onSave: (recipe: Recipe) => void;
}

export const RecipeEditScreen: React.FC<RecipeEditScreenProps> = ({ recipe, onBack, onSave }) => {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>({ ...recipe });
  const [activeSheet, setActiveSheet] = useState<'film' | 'developer' | 'iso' | 'dilution' | null>(null);

  // Dropdown options based on popular recipes
  const availableFilms = useMemo(() => Array.from(new Set(POPULAR_RECIPES.map(r => r.film))).sort(), []);
  
  const availableDevelopers = useMemo(() => {
    if (!editedRecipe.film) return [];
    return Array.from(new Set(POPULAR_RECIPES.filter(r => r.film === editedRecipe.film).map(r => r.developer))).sort();
  }, [editedRecipe.film]);

  const availableIsos = useMemo(() => {
    if (!editedRecipe.film || !editedRecipe.developer) return [];
    return Array.from(new Set(POPULAR_RECIPES.filter(r => r.film === editedRecipe.film && r.developer === editedRecipe.developer).map(r => r.iso))).sort((a, b) => a - b);
  }, [editedRecipe.film, editedRecipe.developer]);

  const availableDilutions = useMemo(() => {
    if (!editedRecipe.film || !editedRecipe.developer || !editedRecipe.iso) return [];
    return Array.from(new Set(POPULAR_RECIPES.filter(r => r.film === editedRecipe.film && r.developer === editedRecipe.developer && r.iso === editedRecipe.iso).map(r => r.dilution))).sort();
  }, [editedRecipe.film, editedRecipe.developer, editedRecipe.iso]);

  // Auto-update base time and temp when a popular combination is fully selected
  useEffect(() => {
    if (editedRecipe.film && editedRecipe.developer && editedRecipe.iso && editedRecipe.dilution) {
      const match = POPULAR_RECIPES.find(r => 
        r.film === editedRecipe.film && 
        r.developer === editedRecipe.developer && 
        r.iso === editedRecipe.iso && 
        r.dilution === editedRecipe.dilution
      );
      
      if (match) {
        // Convert temp to F if unit is F
        let targetTemp = match.temp;
        if (editedRecipe.unit === 'F') {
          targetTemp = Math.round((match.temp * 9/5) + 32);
        }

        setEditedRecipe(prev => ({
          ...prev,
          name: `${match.film} in ${match.developer} (${match.dilution})`,
          baseTime: match.time,
          baseTemp: targetTemp,
          steps: prev.steps.map(s => 
            s.name.toLowerCase().includes('developer') ? { ...s, duration: match.time } : s
          )
        }));
      }
    }
  }, [editedRecipe.film, editedRecipe.developer, editedRecipe.iso, editedRecipe.dilution, editedRecipe.unit]);

  const updateStep = (id: string, updates: Partial<Step>) => {
    setEditedRecipe(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const updateBaseTime = (val: number) => {
    setEditedRecipe(prev => ({
      ...prev,
      baseTime: val,
      steps: prev.steps.map(s => 
        s.name.toLowerCase().includes('developer') ? { ...s, duration: val } : s
      )
    }));
  };

  const removeStep = (id: string) => {
    setEditedRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id)
    }));
  };

  const addStep = () => {
    const newStep: Step = {
      id: crypto.randomUUID(),
      name: 'New Step',
      duration: 60,
      agitation: {
        enabled: true,
        initialDuration: 30,
        interval: 60,
        duration: 10,
        alertType: 'both',
      },
      enabled: true,
      notes: '',
    };
    setEditedRecipe(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const DurationInput = ({ value, onChange, label, disabled }: { value: number, onChange: (val: number) => void, label: string, disabled?: boolean }) => {
    const mins = Math.floor(value / 60);
    const secs = value % 60;

    return (
      <div className={cn("space-y-2 transition-opacity", disabled && "opacity-50 pointer-events-none")}>
        <label className="text-[10px] uppercase font-bold opacity-40 ml-2">{label}</label>
        <div className="flex items-center justify-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
          <WheelPicker 
            label="MIN"
            value={mins} 
            min={0} 
            max={99} 
            onChange={(m) => onChange(m * 60 + secs)} 
          />
          <div className="text-2xl font-bold opacity-20 pt-4">:</div>
          <WheelPicker 
            label="SEC"
            value={secs} 
            min={0} 
            max={59} 
            isCircular
            onChange={(s) => onChange(mins * 60 + s)} 
          />
        </div>
      </div>
    );
  };

  return (
    <Layout 
      title="Edit Recipe"
      leftAction={<button onClick={onBack}><ChevronLeft size={24} /></button>}
      rightAction={<button onClick={() => onSave(editedRecipe)}><Save size={24} /></button>}
    >
      <div className="space-y-6">
        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold opacity-40 ml-2">Recipe Name</label>
            <input 
              type="text" 
              value={editedRecipe.name}
              onChange={e => setEditedRecipe({ ...editedRecipe, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-40 ml-2">Film</label>
              <button 
                onClick={() => setActiveSheet('film')}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-left focus:outline-none focus:border-white/30 flex justify-between items-center"
              >
                <span className={editedRecipe.film ? '' : 'opacity-50'}>{editedRecipe.film || 'Select Film'}</span>
                <ChevronDown size={16} className="opacity-50" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-40 ml-2">Developer</label>
              <button 
                onClick={() => setActiveSheet('developer')}
                disabled={!editedRecipe.film}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-left focus:outline-none focus:border-white/30 flex justify-between items-center disabled:opacity-50"
              >
                <span className={editedRecipe.developer ? '' : 'opacity-50'}>{editedRecipe.developer || 'Select Developer'}</span>
                <ChevronDown size={16} className="opacity-50" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-40 ml-2">ISO</label>
              <button 
                onClick={() => setActiveSheet('iso')}
                disabled={!editedRecipe.developer}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-left focus:outline-none focus:border-white/30 flex justify-between items-center disabled:opacity-50"
              >
                <span className={editedRecipe.iso ? '' : 'opacity-50'}>{editedRecipe.iso || 'Select ISO'}</span>
                <ChevronDown size={16} className="opacity-50" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-40 ml-2">Dilution</label>
              <button 
                onClick={() => setActiveSheet('dilution')}
                disabled={!editedRecipe.iso}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-left focus:outline-none focus:border-white/30 flex justify-between items-center disabled:opacity-50"
              >
                <span className={editedRecipe.dilution ? '' : 'opacity-50'}>{editedRecipe.dilution || 'Select Dilution'}</span>
                <ChevronDown size={16} className="opacity-50" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-40 ml-2">Base Temp (°{editedRecipe.unit})</label>
              <input 
                type="number" 
                value={editedRecipe.baseTemp}
                onChange={e => setEditedRecipe({ ...editedRecipe, baseTemp: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <DurationInput 
              label="Base Development Time" 
              value={editedRecipe.baseTime} 
              onChange={updateBaseTime} 
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-50">Steps</h2>
            <button onClick={addStep} className="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-1">
              <Plus size={14} /> Add Step
            </button>
          </div>
          
          <div className="space-y-4">
            {editedRecipe.steps.map((step, idx) => {
              const isDeveloper = step.name.toLowerCase().includes('developer');
              return (
                <Card key={step.id} className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="opacity-20" />
                    <input 
                      type="text" 
                      value={step.name}
                      onChange={e => updateStep(step.id, { name: e.target.value })}
                      className="flex-1 bg-transparent border-none p-0 font-bold focus:outline-none"
                    />
                    <button onClick={() => removeStep(step.id)} className="text-red-500/50 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <DurationInput 
                    label="Duration" 
                    value={step.duration} 
                    disabled={isDeveloper}
                    onChange={val => updateStep(step.id, { duration: val })} 
                  />

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold opacity-40 ml-2">Step Notes</label>
                    <textarea 
                      value={step.notes}
                      onChange={e => updateStep(step.id, { notes: e.target.value })}
                      placeholder="Enter notes for this step..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-white/30 min-h-[80px] resize-none"
                    />
                  </div>

                  {step.agitation.enabled && (
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold opacity-30">Initial (s)</label>
                        <input 
                          type="number" 
                          value={step.agitation.initialDuration}
                          onChange={e => updateStep(step.id, { agitation: { ...step.agitation, initialDuration: parseInt(e.target.value) || 0 } })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold opacity-30">Interval (s)</label>
                        <input 
                          type="number" 
                          value={step.agitation.interval}
                          onChange={e => updateStep(step.id, { agitation: { ...step.agitation, interval: parseInt(e.target.value) || 0 } })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold opacity-30">Repeat (s)</label>
                        <input 
                          type="number" 
                          value={step.agitation.duration}
                          onChange={e => updateStep(step.id, { agitation: { ...step.agitation, duration: parseInt(e.target.value) || 0 } })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold opacity-50">Agitation Enabled</span>
                    <button 
                      onClick={() => updateStep(step.id, { agitation: { ...step.agitation, enabled: !step.agitation.enabled } })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${step.agitation.enabled ? 'bg-white' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${step.agitation.enabled ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="pt-8">
          <Button variant="primary" size="lg" className="w-full" onClick={() => onSave(editedRecipe)}>
            SAVE RECIPE
          </Button>
        </div>
      </div>

      <SelectSheet
        isOpen={activeSheet === 'film'}
        onClose={() => setActiveSheet(null)}
        title="Select Film"
        value={editedRecipe.film}
        options={availableFilms.map(f => ({ label: f, value: f }))}
        onChange={(val) => setEditedRecipe({ ...editedRecipe, film: val, developer: '', iso: 0, dilution: '' })}
      />
      <SelectSheet
        isOpen={activeSheet === 'developer'}
        onClose={() => setActiveSheet(null)}
        title="Select Developer"
        value={editedRecipe.developer}
        options={availableDevelopers.map(d => ({ label: d, value: d }))}
        onChange={(val) => setEditedRecipe({ ...editedRecipe, developer: val, iso: 0, dilution: '' })}
      />
      <SelectSheet
        isOpen={activeSheet === 'iso'}
        onClose={() => setActiveSheet(null)}
        title="Select ISO"
        value={editedRecipe.iso}
        options={availableIsos.map(i => ({ label: i.toString(), value: i }))}
        onChange={(val) => setEditedRecipe({ ...editedRecipe, iso: val, dilution: '' })}
      />
      <SelectSheet
        isOpen={activeSheet === 'dilution'}
        onClose={() => setActiveSheet(null)}
        title="Select Dilution"
        value={editedRecipe.dilution}
        options={availableDilutions.map(d => ({ label: d, value: d }))}
        onChange={(val) => setEditedRecipe({ ...editedRecipe, dilution: val })}
      />
    </Layout>
  );
};
