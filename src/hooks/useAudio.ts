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

  const speak = useCallback((text: string) => {
    if (!settings.voiceEnabled) return;
    
    // On iOS, we sometimes need to cancel any pending utterances before speaking
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for "calm" effect
    utterance.pitch = 1.0;
    
    // Try to find a British female voice
    const voices = window.speechSynthesis.getVoices();
    const britishFemaleVoice = voices.find(v => 
      (v.lang.includes('en-GB') || v.lang.includes('en_GB')) && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('serena') || v.name.toLowerCase().includes('google uk english female'))
    ) || voices.find(v => v.lang.includes('en-GB'));

    if (britishFemaleVoice) {
      utterance.voice = britishFemaleVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [settings.voiceEnabled]);

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
