import { Recipe, Step } from '../types';

const defaultAgitation = {
  enabled: true,
  initialDuration: 30,
  interval: 60,
  duration: 10,
  alertType: 'both' as const,
};

const noAgitation = {
  ...defaultAgitation,
  enabled: false,
};

export const PRESETS: Recipe[] = [
  {
    id: 'tri-x-d76-1-1',
    name: 'Tri-X 400 in D-76 (1:1)',
    film: 'Kodak Tri-X 400',
    developer: 'Kodak D-76',
    dilution: '1:1',
    iso: 400,
    baseTemp: 68,
    baseTime: 670, // 11:10
    unit: 'F',
    steps: [
      { id: 'prewash', name: 'Pre-Wash', duration: 60, agitation: noAgitation, enabled: true, notes: 'Continuous Agitation' },
      { id: 'developer', name: 'Developer', duration: 670, agitation: defaultAgitation, enabled: true, notes: 'First Minute - 30s Agitation; Subsequent Minutes - 10s Agitation; Pour Out Developer at Final 10s' },
      { id: 'stop', name: 'Stop Bath', duration: 60, agitation: noAgitation, enabled: true, notes: '30s Agitation; 30s Rest' },
      { id: 'fixer', name: 'Fixer', duration: 195, agitation: defaultAgitation, enabled: true, notes: 'First Minute - 30s Agitation; Subsequent Minutes - 10s Agitation' },
      { id: 'wash1', name: 'Wash', duration: 60, agitation: noAgitation, enabled: true, notes: 'Fill and Dump Tank 3 Times' },
      { id: 'hypo', name: 'Hypo Clear', duration: 120, agitation: noAgitation, enabled: true, notes: 'Continuous Agitation' },
      { id: 'wash2', name: 'Final Wash', duration: 300, agitation: noAgitation, enabled: true, notes: 'Clean Paterson Tank with Hot Water Before Wetting Agent' },
      { id: 'wetting', name: 'Wetting Agent', duration: 120, agitation: noAgitation, enabled: true, notes: 'Continuous, Slow Agitation' },
      { id: 'dryer', name: 'Dryer', duration: 900, agitation: noAgitation, enabled: true, notes: '' },
    ],
    notes: 'Classic combination for rich tones and moderate grain.',
  }
];
