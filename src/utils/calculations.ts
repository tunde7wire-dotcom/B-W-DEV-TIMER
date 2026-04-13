import { TemperatureUnit } from '../types';

export const toCelsius = (f: number) => (f - 32) * (5 / 9);
export const toFahrenheit = (c: number) => (c * 9) / 5 + 32;

/**
 * Calculates compensated development time based on temperature.
 * Formula: T_new = T_base * exp(-0.081 * (Temp_new - Temp_base))
 * (approximate for most B&W developers)
 */
export const calculateTempCompensation = (
  baseTime: number,
  baseTemp: number,
  currentTemp: number,
  unit: TemperatureUnit
): number => {
  const bT = unit === 'F' ? toCelsius(baseTemp) : baseTemp;
  const cT = unit === 'F' ? toCelsius(currentTemp) : currentTemp;
  
  const diff = cT - bT;
  // Factor of 0.081 is a common average for B&W developers
  const factor = Math.exp(-0.081 * diff);
  
  return Math.round(baseTime * factor);
};

/**
 * Calculates push/pull adjustment.
 * Rule of thumb: +30% per stop for push, -20% per stop for pull.
 */
export const calculatePushPullAdjustment = (time: number, stops: number): number => {
  if (stops === 0) return time;
  
  if (stops > 0) {
    // Push: ~30% increase per stop
    return Math.round(time * Math.pow(1.3, stops));
  } else {
    // Pull: ~20% decrease per stop
    return Math.round(time * Math.pow(0.8, Math.abs(stops)));
  }
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};
