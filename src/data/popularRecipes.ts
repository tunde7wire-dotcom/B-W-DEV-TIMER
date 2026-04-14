export interface PopularRecipe {
  film: string;
  developer: string;
  iso: number;
  dilution: string;
  time: number; // in seconds
  temp: number; // in Celsius
}

export const POPULAR_RECIPES: PopularRecipe[] = [
  // Kodak Tri-X 400
  { film: 'Kodak Tri-X 400', developer: 'Kodak D-76', iso: 400, dilution: 'Stock', time: 405, temp: 20 },
  { film: 'Kodak Tri-X 400', developer: 'Kodak D-76', iso: 400, dilution: '1+1', time: 585, temp: 20 },
  { film: 'Kodak Tri-X 400', developer: 'Kodak HC-110', iso: 400, dilution: 'Dilution B (1+31)', time: 270, temp: 20 },
  { film: 'Kodak Tri-X 400', developer: 'Kodak XTOL', iso: 400, dilution: 'Stock', time: 420, temp: 20 },
  { film: 'Kodak Tri-X 400', developer: 'Kodak XTOL', iso: 400, dilution: '1+1', time: 540, temp: 20 },
  { film: 'Kodak Tri-X 400', developer: 'Rodinal', iso: 400, dilution: '1+25', time: 420, temp: 20 },
  { film: 'Kodak Tri-X 400', developer: 'Rodinal', iso: 400, dilution: '1+50', time: 780, temp: 20 },
  { film: 'Kodak Tri-X 400', developer: 'Ilford DD-X', iso: 400, dilution: '1+4', time: 480, temp: 20 },

  // Ilford HP5 Plus
  { film: 'Ilford HP5 Plus', developer: 'Ilford ID-11', iso: 400, dilution: 'Stock', time: 450, temp: 20 },
  { film: 'Ilford HP5 Plus', developer: 'Ilford ID-11', iso: 400, dilution: '1+1', time: 780, temp: 20 },
  { film: 'Ilford HP5 Plus', developer: 'Ilford DD-X', iso: 400, dilution: '1+4', time: 540, temp: 20 },
  { film: 'Ilford HP5 Plus', developer: 'Ilford Ilfosol 3', iso: 400, dilution: '1+9', time: 390, temp: 20 },
  { film: 'Ilford HP5 Plus', developer: 'Kodak D-76', iso: 400, dilution: 'Stock', time: 450, temp: 20 },
  // HP5 pushed
  { film: 'Ilford HP5 Plus', developer: 'Ilford DD-X', iso: 800, dilution: '1+4', time: 600, temp: 20 },
  { film: 'Ilford HP5 Plus', developer: 'Ilford DD-X', iso: 1600, dilution: '1+4', time: 780, temp: 20 },
  { film: 'Ilford HP5 Plus', developer: 'Kodak HC-110', iso: 400, dilution: 'Dilution B (1+31)', time: 300, temp: 20 },

  // Kodak T-Max 100
  { film: 'Kodak T-Max 100', developer: 'Kodak D-76', iso: 100, dilution: 'Stock', time: 450, temp: 20 },
  { film: 'Kodak T-Max 100', developer: 'Kodak D-76', iso: 100, dilution: '1+1', time: 570, temp: 20 },
  { film: 'Kodak T-Max 100', developer: 'Kodak XTOL', iso: 100, dilution: 'Stock', time: 420, temp: 20 },
  { film: 'Kodak T-Max 100', developer: 'Kodak HC-110', iso: 100, dilution: 'Dilution B (1+31)', time: 360, temp: 20 },
  { film: 'Kodak T-Max 100', developer: 'Rodinal', iso: 100, dilution: '1+50', time: 720, temp: 20 },

  // Kodak T-Max 400
  { film: 'Kodak T-Max 400', developer: 'Kodak D-76', iso: 400, dilution: 'Stock', time: 450, temp: 20 },
  { film: 'Kodak T-Max 400', developer: 'Kodak D-76', iso: 400, dilution: '1+1', time: 600, temp: 20 },
  { film: 'Kodak T-Max 400', developer: 'Kodak XTOL', iso: 400, dilution: 'Stock', time: 405, temp: 20 },
  { film: 'Kodak T-Max 400', developer: 'Kodak HC-110', iso: 400, dilution: 'Dilution B (1+31)', time: 330, temp: 20 },

  // Ilford FP4 Plus
  { film: 'Ilford FP4 Plus', developer: 'Ilford ID-11', iso: 125, dilution: 'Stock', time: 510, temp: 20 },
  { film: 'Ilford FP4 Plus', developer: 'Ilford ID-11', iso: 125, dilution: '1+1', time: 660, temp: 20 },
  { film: 'Ilford FP4 Plus', developer: 'Ilford Ilfosol 3', iso: 125, dilution: '1+9', time: 255, temp: 20 },
  { film: 'Ilford FP4 Plus', developer: 'Kodak D-76', iso: 125, dilution: 'Stock', time: 510, temp: 20 },
  { film: 'Ilford FP4 Plus', developer: 'Rodinal', iso: 125, dilution: '1+25', time: 540, temp: 20 },
  { film: 'Ilford FP4 Plus', developer: 'Rodinal', iso: 125, dilution: '1+50', time: 900, temp: 20 },

  // Ilford Delta 100
  { film: 'Ilford Delta 100', developer: 'Ilford DD-X', iso: 100, dilution: '1+4', time: 720, temp: 20 },
  { film: 'Ilford Delta 100', developer: 'Ilford ID-11', iso: 100, dilution: 'Stock', time: 510, temp: 20 },
  { film: 'Ilford Delta 100', developer: 'Ilford Ilfosol 3', iso: 100, dilution: '1+9', time: 300, temp: 20 },

  // Ilford Delta 400
  { film: 'Ilford Delta 400', developer: 'Ilford DD-X', iso: 400, dilution: '1+4', time: 480, temp: 20 },
  { film: 'Ilford Delta 400', developer: 'Ilford ID-11', iso: 400, dilution: 'Stock', time: 570, temp: 20 },
  { film: 'Ilford Delta 400', developer: 'Kodak XTOL', iso: 400, dilution: 'Stock', time: 450, temp: 20 },

  // Ilford Delta 3200
  { film: 'Ilford Delta 3200', developer: 'Ilford DD-X', iso: 3200, dilution: '1+4', time: 570, temp: 20 },
  { film: 'Ilford Delta 3200', developer: 'Ilford DD-X', iso: 1600, dilution: '1+4', time: 480, temp: 20 },
  { film: 'Ilford Delta 3200', developer: 'Kodak XTOL', iso: 3200, dilution: 'Stock', time: 630, temp: 20 },

  // Fomapan 100
  { film: 'Fomapan 100', developer: 'Rodinal', iso: 100, dilution: '1+50', time: 540, temp: 20 },
  { film: 'Fomapan 100', developer: 'Kodak D-76', iso: 100, dilution: 'Stock', time: 420, temp: 20 },
  { film: 'Fomapan 100', developer: 'Kodak HC-110', iso: 100, dilution: 'Dilution B (1+31)', time: 360, temp: 20 },

  // Fomapan 400
  { film: 'Fomapan 400', developer: 'Rodinal', iso: 400, dilution: '1+50', time: 660, temp: 20 },
  { film: 'Fomapan 400', developer: 'Kodak D-76', iso: 400, dilution: 'Stock', time: 420, temp: 20 },
  { film: 'Fomapan 400', developer: 'Kodak HC-110', iso: 400, dilution: 'Dilution B (1+31)', time: 330, temp: 20 },

  // Kentmere 400
  { film: 'Kentmere 400', developer: 'Ilford ID-11', iso: 400, dilution: 'Stock', time: 570, temp: 20 },
  { film: 'Kentmere 400', developer: 'Kodak D-76', iso: 400, dilution: 'Stock', time: 570, temp: 20 },
  { film: 'Kentmere 400', developer: 'Kodak HC-110', iso: 400, dilution: 'Dilution B (1+31)', time: 300, temp: 20 },

  // Fuji Neopan Acros 100 II
  { film: 'Fuji Neopan Acros 100 II', developer: 'Kodak D-76', iso: 100, dilution: 'Stock', time: 450, temp: 20 },
  { film: 'Fuji Neopan Acros 100 II', developer: 'Kodak XTOL', iso: 100, dilution: 'Stock', time: 420, temp: 20 },
  { film: 'Fuji Neopan Acros 100 II', developer: 'Rodinal', iso: 100, dilution: '1+50', time: 810, temp: 20 },
];
