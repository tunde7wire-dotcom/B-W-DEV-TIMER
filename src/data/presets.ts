import { Recipe, Step } from '../types';

const defaultAgitation = {
  enabled: true,
  initialDuration: 30,
  interval: 60,
  duration: 10,
  alertType: 'both' as const,
};

const createDefaultSteps = (devTime: number): Step[] => [
  { id: 'prewash', name: 'Pre-Wash', duration: 60, agitation: { ...defaultAgitation, enabled: false }, enabled: true, notes: '' },
  { id: 'developer', name: 'Developer', duration: devTime, agitation: defaultAgitation, enabled: true, notes: '' },
  { id: 'stop', name: 'Stop Bath', duration: 30, agitation: defaultAgitation, enabled: true, notes: '' },
  { id: 'fixer', name: 'Fixer', duration: 300, agitation: defaultAgitation, enabled: true, notes: '' },
  { id: 'wash1', name: 'Wash', duration: 60, agitation: { ...defaultAgitation, enabled: false }, enabled: true, notes: '' },
  { id: 'hypo', name: 'Hypo Clear', duration: 120, agitation: defaultAgitation, enabled: true, notes: '' },
  { id: 'wash2', name: 'Final Wash', duration: 300, agitation: { ...defaultAgitation, enabled: false }, enabled: true, notes: 'Wash Patterson tank with hot water prior to Wetting Agent step' },
  { id: 'wetting', name: 'Wetting Agent', duration: 30, agitation: { ...defaultAgitation, enabled: false }, enabled: true, notes: '' },
  { id: 'dryer', name: 'Dryer', duration: 900, agitation: { ...defaultAgitation, enabled: false }, enabled: true, notes: '' },
];

export const PRESETS: Recipe[] = [
  {
    id: 'tri-x-d76',
    name: 'Tri-X 400 in D-76 (1:1)',
    film: 'Kodak Tri-X 400',
    developer: 'Kodak D-76',
    dilution: '1:1',
    iso: 400,
    baseTemp: 68,
    baseTime: 585, // 9:45
    unit: 'F',
    steps: createDefaultSteps(585),
    notes: 'Classic combination for rich tones and moderate grain.',
  },
  {
    id: 'hp5-id11',
    name: 'HP5 Plus in ID-11 (Stock)',
    film: 'Ilford HP5 Plus',
    developer: 'Ilford ID-11',
    dilution: 'Stock',
    iso: 400,
    baseTemp: 20,
    baseTime: 450, // 7:30
    unit: 'C',
    steps: createDefaultSteps(450),
    notes: 'Reliable, high-quality results.',
  },
  {
    id: 'tmax100-xtol',
    name: 'T-Max 100 in XTOL (Stock)',
    film: 'Kodak T-Max 100',
    developer: 'Kodak XTOL',
    dilution: 'Stock',
    iso: 100,
    baseTemp: 68,
    baseTime: 420, // 7:00
    unit: 'F',
    steps: createDefaultSteps(420),
    notes: 'Fine grain and high sharpness.',
  },
  {
    id: 'rodinal-stand',
    name: 'Rodinal Stand Development (1:100)',
    film: 'Various B&W',
    developer: 'Rodinal / Adonal',
    dilution: '1:100',
    iso: 400,
    baseTemp: 20,
    baseTime: 3600, // 60:00
    unit: 'C',
    steps: [
      { id: 'prewash', name: 'Pre-Wash', duration: 60, agitation: { ...defaultAgitation, enabled: false }, enabled: true, notes: '' },
      { id: 'developer', name: 'Developer', duration: 3600, agitation: { ...defaultAgitation, initialDuration: 60, interval: 1800, duration: 10 }, enabled: true, notes: '' },
      { id: 'stop', name: 'Stop Bath', duration: 30, agitation: defaultAgitation, enabled: true, notes: '' },
      { id: 'fixer', name: 'Fixer', duration: 300, agitation: defaultAgitation, enabled: true, notes: '' },
      { id: 'wash', name: 'Final Wash', duration: 600, agitation: { ...defaultAgitation, enabled: false }, enabled: true, notes: 'Wash Patterson tank with hot water prior to Wetting Agent step' },
      { id: 'dryer', name: 'Dryer', duration: 900, agitation: { ...defaultAgitation, enabled: false }, enabled: true, notes: '' },
    ],
    notes: 'Stand development for extreme compensations.',
  },
  {
    id: 'delta400-ddx',
    name: 'Delta 400 in Ilford DD-X (1:4)',
    film: 'Ilford Delta 400',
    developer: 'Ilford DD-X',
    dilution: '1:4',
    iso: 400,
    baseTemp: 20,
    baseTime: 480, // 8:00
    unit: 'C',
    steps: createDefaultSteps(480),
    notes: 'Excellent speed and fine grain.',
  },
  {
    id: 'fomapan100-rodinal',
    name: 'Fomapan 100 in Rodinal (1:50)',
    film: 'Fomapan 100',
    developer: 'Rodinal',
    dilution: '1:50',
    iso: 100,
    baseTemp: 20,
    baseTime: 540, // 9:00
    unit: 'C',
    steps: createDefaultSteps(540),
    notes: 'Classic European look.',
  }
];
