import React from 'react';
import { Layout, Card } from '../components/Layout';
import { useStore } from '../store/useStore';
import { Session } from '../types';
import { ChevronLeft, Calendar, Clock, Thermometer, ChevronRight } from 'lucide-react';
import { formatTime } from '../utils/calculations';

interface HistoryScreenProps {
  onBack: () => void;
  onSelectSession: (session: Session) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, onSelectSession }) => {
  const { history } = useStore();

  return (
    <Layout 
      title="History"
      leftAction={<button onClick={onBack}><ChevronLeft size={24} /></button>}
    >
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="py-20 text-center opacity-40">
            <Clock size={48} className="mx-auto mb-4" />
            <p>No sessions yet.</p>
          </div>
        ) : (
          history.map(session => (
            <Card key={session.id} onClick={() => onSelectSession(session)} className="group">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold">{session.recipeName}</h3>
                  <div className="flex items-center gap-3 text-[10px] opacity-50 uppercase font-bold tracking-wider">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(session.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Thermometer size={10} /> {session.temp}°</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(session.totalTime)}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="opacity-20 group-active:opacity-100 transition-opacity" />
              </div>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};
