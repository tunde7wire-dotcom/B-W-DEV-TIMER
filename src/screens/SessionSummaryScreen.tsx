import React from 'react';
import { Layout, Card, Button } from '../components/Layout';
import { Session } from '../types';
import { CheckCircle2, Star, Calendar, Thermometer, Clock } from 'lucide-react';
import { formatTime } from '../utils/calculations';
import { useStore } from '../store/useStore';

interface SessionSummaryScreenProps {
  session: Session;
  onDone: () => void;
}

export const SessionSummaryScreen: React.FC<SessionSummaryScreenProps> = ({ session, onDone }) => {
  const { settings } = useStore();
  
  return (
    <Layout title="Session Complete">
      <div className="space-y-8 text-center py-8">
        <div className="flex justify-center">
          <CheckCircle2 size={80} className="text-green-500" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-2">Great Work!</h2>
          <p className="opacity-60">Your film development session is complete.</p>
        </div>

        <Card className="text-left space-y-4">
          <div className={`flex items-center justify-between border-b pb-4 ${settings.darkroomMode ? 'border-red-900/30' : 'border-white/5'}`}>
            <h3 className="font-bold text-xl">{session.recipeName}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold opacity-40">Date</p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="opacity-50" />
                {new Date(session.date).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold opacity-40">Total Time</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="opacity-50" />
                {formatTime(session.totalTime)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold opacity-40">Temperature</p>
              <div className="flex items-center gap-2 text-sm">
                <Thermometer size={14} className="opacity-50" />
                {session.temp}°
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold opacity-40">Push/Pull</p>
              <div className="flex items-center gap-2 text-sm">
                {session.pushPull > 0 ? `+${session.pushPull}` : session.pushPull} stops
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest opacity-50">Rate this session</p>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} className="p-2 opacity-30 hover:opacity-100 transition-opacity">
                <Star size={32} />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8">
          <Button variant="primary" size="lg" className="w-full" onClick={onDone}>
            SAVE & FINISH
          </Button>
        </div>
      </div>
    </Layout>
  );
};
