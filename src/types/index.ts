export type TemperatureUnit = 'C' | 'F';

export interface AgitationConfig {
  enabled: boolean;
  initialDuration: number; // seconds (e.g., 30s)
  interval: number; // seconds (e.g., 60s)
  duration: number; // seconds (e.g., 10s)
  alertType: 'visual' | 'sound' | 'both' | 'voice';
  customSequence?: { time: number; duration: number }[]; // Optional custom sequence
}

export interface Step {
  id: string;
  name: string;
  duration: number; // seconds
  agitation: AgitationConfig;
  enabled: boolean;
  notes: string;
}

export interface Recipe {
  id: string;
  name: string;
  film: string;
  developer: string;
  dilution: string;
  iso: number;
  baseTemp: number;
  baseTime: number; // seconds
  unit: TemperatureUnit;
  steps: Step[];
  notes: string;
  isCustom?: boolean;
}

export interface Session {
  id: string;
  recipeId: string;
  recipeName: string;
  date: string;
  temp: number;
  pushPull: number;
  totalTime: number;
  rating: number;
  notes: string;
}

export interface Settings {
  unit: TemperatureUnit;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  keepScreenAwake: boolean;
  darkroomMode: boolean;
}
