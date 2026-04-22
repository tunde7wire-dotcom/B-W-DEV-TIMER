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
      // Collect all matches
      const matches: SpeechSynthesisVoice[] = [];
      for (const keyword of keywords) {
        matches.push(...voices.filter(v => v.name.toLowerCase().includes(keyword.toLowerCase())));
      }
      
      if (matches.length > 0) {
        // Prefer enhanced or premium voice if multiple matches exist
        const premium = matches.find(v => v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('enhanced'));
        return premium || matches[0];
      }
      
      // Fallback to exactly matching language, preferring premium if possible
      const langMatches = voices.filter(v => v.lang.includes(fallbackLang));
      if (langMatches.length > 0) {
        const premiumLang = langMatches.find(v => v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('enhanced'));
        if (premiumLang) return premiumLang;
        // If we fall back to generic lang matches, try to use the requested index to pick a different voice
        // (e.g. so Male 1 and Female 1 don't both pick index 0 when no keywords match)
        return langMatches[fallbackIndex % langMatches.length] || langMatches[0];
      }
      
      return undefined;
    };

    switch (profile) {
      case 'female-1':
        selectedVoice = findVoice(['samantha', 'victoria', 'zira', 'jenny', 'aria', 'susan', 'allison', 'female', 'google us english'], 'en-US', 0);
        break;
      case 'female-2':
        selectedVoice = findVoice(['serena', 'kate', 'hazel', 'libby', 'mia', 'google uk english female', 'uk english female'], 'en-GB', 0);
        break;
      case 'male-1':
        selectedVoice = findVoice(['alex', 'aaron', 'fred', 'david', 'guy', 'christopher', 'eric', 'male', 'google us english male'], 'en-US', 1);
        break;
      case 'male-2':
        selectedVoice = findVoice(['daniel', 'oliver', 'arthur', 'george', 'ryan', 'google uk english male', 'uk english male'], 'en-GB', 1);
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

  return { playBeep, speak, unlockAudio };
};
