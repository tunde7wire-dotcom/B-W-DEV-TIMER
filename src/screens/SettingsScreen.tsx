import React from 'react';
import { Layout, Card } from '../components/Layout';
import { useStore } from '../store/useStore';
import { ChevronLeft, Volume2, VolumeX, Moon, Sun, Smartphone, Bell } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { settings, updateSettings } = useStore();

  const Toggle = ({ label, icon: Icon, value, onChange }: any) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl border ${settings.darkroomMode ? 'bg-red-950/10 border-red-900/30' : 'bg-white/5 border-white/5'}`}>
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${settings.darkroomMode ? 'bg-red-900/50' : 'bg-white/5'}`}>
          <Icon size={20} className="opacity-70" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <button 
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative ${value ? (settings.darkroomMode ? 'bg-red-500' : 'bg-white') : (settings.darkroomMode ? 'bg-red-900/30' : 'bg-white/10')}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${value ? `right-1 ${settings.darkroomMode ? 'bg-black' : 'bg-black'}` : `left-1 ${settings.darkroomMode ? 'bg-red-500/40' : 'bg-white/40'}`}`} />
      </button>
    </div>
  );

  return (
    <Layout 
      title="Settings"
      leftAction={<button onClick={onBack}><ChevronLeft size={24} /></button>}
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 px-2">Preferences</h2>
          <div className="space-y-2">
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${settings.darkroomMode ? 'bg-red-950/10 border-red-900/30' : 'bg-white/5 border-white/5'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${settings.darkroomMode ? 'bg-red-900/50' : 'bg-white/5'}`}>
                  <span className="font-bold text-lg">°</span>
                </div>
                <span className="font-medium">Temperature Unit</span>
              </div>
              <div className={`flex p-1 rounded-xl ${settings.darkroomMode ? 'bg-red-900/30' : 'bg-white/10'}`}>
                <button 
                  onClick={() => updateSettings({ unit: 'C' })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.unit === 'C' ? (settings.darkroomMode ? 'bg-red-500 text-black' : 'bg-white text-black') : 'opacity-50'}`}
                >
                  CELSIUS
                </button>
                <button 
                  onClick={() => updateSettings({ unit: 'F' })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.unit === 'F' ? (settings.darkroomMode ? 'bg-red-500 text-black' : 'bg-white text-black') : 'opacity-50'}`}
                >
                  FAHRENHEIT
                </button>
              </div>
            </div>
            
            <Toggle 
              label="Darkroom Mode" 
              icon={Moon} 
              value={settings.darkroomMode} 
              onChange={(v: boolean) => updateSettings({ darkroomMode: v })} 
            />
            <Toggle 
              label="Keep Screen Awake" 
              icon={Smartphone} 
              value={settings.keepScreenAwake} 
              onChange={(v: boolean) => updateSettings({ keepScreenAwake: v })} 
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 px-2">Alerts & Audio</h2>
          <div className="space-y-2">
            <Toggle 
              label="Sound Alerts" 
              icon={Bell} 
              value={settings.soundEnabled} 
              onChange={(v: boolean) => updateSettings({ soundEnabled: v })} 
            />
            <Toggle 
              label="Voice Guidance" 
              icon={Volume2} 
              value={settings.voiceEnabled} 
              onChange={(v: boolean) => updateSettings({ voiceEnabled: v })} 
            />
          </div>
        </section>

        <section className="pt-8 text-center">
          <p className="text-[10px] opacity-30 uppercase tracking-widest font-bold">B&W Film Dev Timer v1.0.0</p>
          <p className="text-[10px] opacity-20 mt-1">Made for darkroom enthusiasts</p>
        </section>
      </div>
    </Layout>
  );
};
