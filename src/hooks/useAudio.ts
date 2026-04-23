import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

let globalAudioCtx: AudioContext | null = null;

export const useAudio = () => {
  const { settings } = useStore();

  const playBeep = useCallback((frequency = 440, duration = 0.2) => {
    if (!settings.soundEnabled) return;
    
    if (!globalAudioCtx) {
      globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = globalAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [settings.soundEnabled]);

  const speak = useCallback((text: string, forceProfile?: string) => {
    if (!settings.voiceEnabled && !forceProfile) return;
    
    // On iOS, we sometimes need to cancel any pending utterances before speaking
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for "calm" effect
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const profile = forceProfile || settings.voiceProfile || 'female-1';
    
    let selectedVoice: SpeechSynthesisVoice | undefined;

    const findVoice = (keywords: string[], fallbackLang: string, fallbackIndex: number = 0) => {
      // 1. Try to find by keywords
      const matches: SpeechSynthesisVoice[] = [];
      for (const keyword of keywords) {
        matches.push(...voices.filter(v => v.name.toLowerCase().includes(keyword.toLowerCase())));
      }
      
      if (matches.length > 0) {
        // If we have multiple keyword matches, pick the best one
        const premium = matches.find(v => v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('enhanced'));
        return premium || matches[0];
      }
      
      // 2. Fallback to language
      const langMatches = voices.filter(v => 
        v.lang.toLowerCase().replace('_', '-').startsWith(fallbackLang.toLowerCase().split('-')[0])
      );
      
      if (langMatches.length > 0) {
        // Sort premium/enhanced to the top so we use them if possible
        const sorted = [...langMatches].sort((a, b) => {
          const aP = a.name.toLowerCase().includes('premium') || a.name.toLowerCase().includes('enhanced');
          const bP = b.name.toLowerCase().includes('premium') || b.name.toLowerCase().includes('enhanced');
          if (aP && !bP) return -1;
          if (!aP && bP) return 1;
          return 0;
        });
        
        // Use the index to pick a different voice from the sorted list
        return sorted[fallbackIndex % sorted.length] || sorted[0];
      }
      
      return undefined;
    };

    switch (profile) {
      case 'female-1':
        selectedVoice = findVoice(['samantha', 'victoria', 'zira', 'jenny', 'aria', 'susan', 'allison', 'female', 'google us english'], 'en-US', 0);
        break;
      case 'female-2':
        selectedVoice = findVoice(['serena', 'martha', 'fiona', 'hazel', 'libby', 'mia', 'google uk english female', 'uk english female'], 'en-GB', 0);
        break;
      case 'male-1':
        selectedVoice = findVoice(['alex', 'aaron', 'fred', 'david', 'guy', 'christopher', 'eric', 'male', 'google us english male'], 'en-US', 2); // skip 0/1 to be safe
        break;
      case 'male-2':
        selectedVoice = findVoice(['daniel', 'arthur', 'george', 'ryan', 'google uk english male', 'uk english male'], 'en-GB', 2); // skip 0/1 to be safe
        break;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [settings.voiceEnabled, settings.voiceProfile]);

  const unlockAudio = useCallback(() => {
    // 1. Unlock Speech Synthesis synchronously
    if (window.speechSynthesis) {
      const silent = new SpeechSynthesisUtterance(" ");
      silent.volume = 0;
      window.speechSynthesis.speak(silent);
    }

    // 2. Unlock Web Audio API
    if (!globalAudioCtx) {
      globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = globalAudioCtx;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Play a silent buffer to fully unlock iOS audio
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  }, []);

  const resolveVoiceName = useCallback((profile: string) => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const findVoice = (keywords: string[], fallbackLang: string, fallbackIndex: number = 0) => {
      const matches: SpeechSynthesisVoice[] = [];
      for (const keyword of keywords) {
        matches.push(...voices.filter(v => v.name.toLowerCase().includes(keyword.toLowerCase())));
      }
      if (matches.length > 0) {
        const premium = matches.find(v => v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('enhanced'));
        return premium || matches[0];
      }
      const langMatches = voices.filter(v => 
        v.lang.toLowerCase().replace('_', '-').startsWith(fallbackLang.toLowerCase().split('-')[0])
      );
      if (langMatches.length > 0) {
        const sorted = [...langMatches].sort((a, b) => {
          const aP = a.name.toLowerCase().includes('premium') || a.name.toLowerCase().includes('enhanced');
          const bP = b.name.toLowerCase().includes('premium') || b.name.toLowerCase().includes('enhanced');
          if (aP && !bP) return -1;
          if (!aP && bP) return 1;
          return 0;
        });
        return sorted[fallbackIndex % sorted.length] || sorted[0];
      }
      return undefined;
    };

    let selectedVoice: SpeechSynthesisVoice | undefined;
    switch (profile) {
      case 'female-1':
        selectedVoice = findVoice(['samantha', 'victoria', 'zira', 'jenny', 'aria', 'susan', 'allison', 'female', 'google us english'], 'en-US', 0);
        break;
      case 'female-2':
        selectedVoice = findVoice(['serena', 'martha', 'fiona', 'hazel', 'libby', 'mia', 'google uk english female', 'uk english female'], 'en-GB', 0);
        break;
      case 'male-1':
        selectedVoice = findVoice(['alex', 'aaron', 'fred', 'david', 'guy', 'christopher', 'eric', 'male', 'google us english male'], 'en-US', 2);
        break;
      case 'male-2':
        selectedVoice = findVoice(['daniel', 'arthur', 'george', 'ryan', 'google uk english male', 'uk english male'], 'en-GB', 2);
        break;
    }
    return selectedVoice ? selectedVoice.name : null;
  }, []);

  return { playBeep, speak, unlockAudio, resolveVoiceName };
};
