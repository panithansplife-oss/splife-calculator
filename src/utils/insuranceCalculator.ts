export type Gender = 'male' | 'female';
export type InsuranceType = 'mlta' | 'mrta';

export interface InsurancePlanOption {
  id: string;
  name: string;
  shortName: string;
  partnerCode: 'splife' | 'selife' | 'mtl' | 'thailife' | 'oceanlife';
  rateMultiplier: number;
  description: string;
}

export const INSURANCE_PLANS: InsurancePlanOption[] = [
  {
    id: 'sp-baac',
    name: 'แผนมาตรฐาน ธ.ก.ส. × SP Life',
    shortName: 'SP Life (ธ.ก.ส.)',
    partnerCode: 'splife',
    rateMultiplier: 1.0,
    description: 'แบบประกันคุ้มครองสินเชื่อมาตรฐาน อ้างอิงอัตราเบี้ยหลัก',
  },
];

export const MIN_AGE = 20;
export const MLTA_MAX_AGE = 65;
export const MRTA_MAX_AGE = 70;
export const UNDER_AGE_STRICT_THRESHOLD = 15;
export const MIN_SUM_ASSURED = 50_000;
export const MAX_SUM_ASSURED = 150_000_000;
export const MIN_TERM = 1;
export const MAX_TERM = 30;
export const MLTA_MAX_AGE_PLUS_TERM = 70;
export const MRTA_MAX_AGE_PLUS_TERM = 75;
export const MRTA_ALLOWED_TERMS = [5, 7, 10, 15, 20] as const;
export const MRTA_KEY_TERMS = [5, 7, 10, 15, 20, 25, 30] as const;
export const MLTA_TERMS_PART1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;
export const MLTA_TERMS_PART2 = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;
export const MLTA_ALL_TERMS = [...MLTA_TERMS_PART1, ...MLTA_TERMS_PART2] as const;
export const FBI_RATE = 0.2;

export function getCurrentYearBE(): number {
  return new Date().getFullYear() + 543;
}

export interface IntegerParseResult {
  valid: boolean;
  value: number | null;
  error?: string;
}

/**
 * Validates that user input represents a strict whole integer (commas allowed for thousands).
 * Rejects decimals, negative signs, letters, or empty values.
 */
export function parseStrictInteger(raw: string): IntegerParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      valid: false,
      value: null,
      error: 'กรุณากรอกข้อมูล (ค่าที่กรอกต้องเป็นตัวเลขจำนวนเต็มเท่านั้น)',
    };
  }

  if (!/^[0-9,]+$/.test(trimmed)) {
    return {
      valid: false,
      value: null,
      error: 'ค่าที่กรอกต้องเป็นตัวเลขจำนวนเต็มเท่านั้น',
    };
  }

  const normalized = trimmed.replace(/,/g, '');
  if (!/^\d+$/.test(normalized)) {
    return {
      valid: false,
      value: null,
      error: 'ค่าที่กรอกต้องเป็นตัวเลขจำนวนเต็มเท่านั้น',
    };
  }

  const num = Number(normalized);
  if (!Number.isSafeInteger(num)) {
    return {
      valid: false,
      value: null,
      error: 'ค่าที่กรอกต้องเป็นตัวเลขจำนวนเต็มเท่านั้น',
    };
  }

  return { valid: true, value: num };
}

export interface ValidationErrors {
  birthYear?: string;
  sumAssured?: string;
  term?: string;
}

export interface MrtaTermQuote {
  term: number;
  totalPremium: number;
  fbiReward: number;
  ratePerThousand: number;
}

export interface MrtaTableRow {
  age: number;
  premiums: Record<number, number | null>;
}

export interface CalculationResult {
  insuranceType: InsuranceType;
  isValid: boolean;
  errors: ValidationErrors;
  currentYearBE: number;
  birthYearBE: number | null;
  age: number | null;
  gender: Gender;
  sumAssured: number | null;
  term: number | null;
  plan: InsurancePlanOption;
  totalPremium: number | null;
  annualPremium: number | null;
  monthlyEquivalent: number | null;
  japanTripPoints: number | null;
  fbiReward: number | null;
  ratePerThousand: number | null;
  mrtaQuotes?: Record<number, MrtaTermQuote | null>;
}

type RateByTerm = Record<number, number>;

/**
 * MLTA: Exact rate table per 1,000 Baht sum assured (e.g., 92.47 for 100,000 -> 9,247 Baht)
 */
const MLTA_MALE_RATE_TABLE: Record<string, RateByTerm> = {
  '20': {
    1: 2.86, 2: 5.78, 3: 8.71, 4: 9.85, 5: 12.31, 6: 14.75, 7: 15.94, 8: 18.15, 9: 20.35, 10: 22.54,
    11: 24.74, 12: 26.96, 13: 29.22, 14: 31.52, 15: 33.88, 16: 36.31, 17: 38.81, 18: 41.38, 19: 44.03, 20: 46.76,
    21: 49.59, 22: 52.52, 23: 55.55, 24: 58.71, 25: 62.01, 26: 65.44, 27: 69.04, 28: 72.81, 29: 76.76, 30: 80.91,
  },
  '21-30': {
    1: 3.21, 2: 6.45, 3: 9.63, 4: 10.84, 5: 13.53, 6: 16.25, 7: 17.66, 8: 20.28, 9: 22.97, 10: 25.73,
    11: 28.57, 12: 31.49, 13: 34.51, 14: 37.62, 15: 40.84, 16: 44.17, 17: 47.63, 18: 51.22, 19: 54.97, 20: 58.88,
    21: 62.97, 22: 67.26, 23: 71.76, 24: 76.47, 25: 81.42, 26: 86.60, 27: 92.03, 28: 97.72, 29: 103.68, 30: 109.94,
  },
  '31-40': {
    1: 4.50, 2: 9.13, 3: 13.90, 4: 15.93, 5: 20.24, 6: 24.71, 7: 27.24, 8: 31.71, 9: 36.37, 10: 41.24,
    11: 46.33, 12: 51.67, 13: 57.26, 14: 63.13, 15: 69.28, 16: 75.73, 17: 82.48, 18: 89.56, 19: 96.98, 20: 104.76,
    21: 112.94, 22: 121.55, 23: 130.65, 24: 140.27, 25: 150.48, 26: 161.34, 27: 172.88, 28: 185.17, 29: 198.26, 30: 212.20,
  },
  '41-45': {
    1: 6.68, 2: 13.63, 3: 20.90, 4: 24.12, 5: 30.86, 6: 37.92, 7: 42.09, 8: 49.31, 9: 56.87, 10: 64.79,
    11: 73.10, 12: 81.80, 13: 90.93, 14: 100.52, 15: 110.62, 16: 121.29, 17: 132.58, 18: 144.56, 19: 157.29, 20: 170.83,
    21: 185.25, 22: 200.60, 23: 216.95, 24: 234.35, 25: 252.85, 26: 272.51, 27: 271.16, 28: 269.60, 29: 289.51,
  },
  '46-50': {
    1: 9.42, 2: 19.30, 3: 29.66, 4: 34.28, 5: 43.91, 6: 54.00, 7: 59.95, 8: 70.25, 9: 81.07, 10: 92.47,
    11: 104.51, 12: 117.25, 13: 130.76, 14: 145.12, 15: 160.40, 16: 176.66, 17: 193.99, 18: 212.43, 19: 232.06, 20: 252.93,
    21: 275.11, 22: 275.28, 23: 275.06, 24: 297.46,
  },
  '51-55': {
    1: 13.57, 2: 27.80, 3: 42.72, 4: 49.42, 5: 63.40, 6: 78.15, 7: 87.08, 8: 102.46, 9: 118.81, 10: 136.21,
    11: 154.73, 12: 174.46, 13: 195.46, 14: 217.80, 15: 241.57, 16: 266.82, 17: 269.65, 18: 271.83, 19: 297.23,
  },
  '56-60': {
    1: 20.14, 2: 41.46, 3: 64.07, 4: 74.54, 5: 96.18, 6: 119.21, 7: 133.47, 8: 157.72, 9: 183.52, 10: 210.97,
    11: 240.13, 12: 247.51, 13: 253.74, 14: 282.89,
  },
  '61-65': {
    1: 32.19, 2: 66.48, 3: 102.98, 4: 120.01, 5: 154.97, 6: 192.11, 7: 194.94, 8: 209.07, 9: 243.15,
  },
};

const MLTA_FEMALE_RATE_TABLE: Record<string, RateByTerm> = {
  '20': {
    1: 1.01, 2: 2.06, 3: 3.10, 4: 3.19, 5: 4.01, 6: 4.82, 7: 5.23, 8: 5.99, 9: 6.75, 10: 7.51,
    11: 8.27, 12: 9.05, 13: 9.83, 14: 10.63, 15: 11.45, 16: 12.30, 17: 13.18, 18: 14.10, 19: 15.06, 20: 16.08,
    21: 17.15, 22: 18.29, 23: 19.49, 24: 20.77, 25: 22.13, 26: 23.56, 27: 25.08, 28: 26.68, 29: 28.39, 30: 30.19,
  },
  '21-30': {
    1: 1.17, 2: 2.39, 3: 3.59, 4: 3.69, 5: 4.62, 6: 5.56, 7: 6.05, 8: 6.95, 9: 7.88, 10: 8.84,
    11: 9.83, 12: 10.87, 13: 11.96, 14: 13.11, 15: 14.33, 16: 15.61, 17: 16.97, 18: 18.41, 19: 19.94, 20: 21.56,
    21: 23.28, 22: 25.10, 23: 27.02, 24: 29.05, 25: 31.22, 26: 33.52, 27: 35.98, 28: 38.62, 29: 41.45, 30: 44.51,
  },
  '31-40': {
    1: 1.71, 2: 3.50, 3: 5.37, 4: 5.65, 5: 7.25, 6: 8.95, 7: 9.99, 8: 11.76, 9: 13.63, 10: 15.62,
    11: 17.73, 12: 19.96, 13: 22.32, 14: 24.82, 15: 27.47, 16: 30.30, 17: 33.32, 18: 36.55, 19: 40.04, 20: 43.79,
    21: 47.85, 22: 52.24, 23: 56.99, 24: 62.15, 25: 67.74, 26: 73.80, 27: 80.40, 28: 87.60, 29: 95.46, 30: 104.09,
  },
  '41-45': {
    1: 2.89, 2: 5.91, 3: 9.14, 4: 9.65, 5: 12.43, 6: 15.37, 7: 17.17, 8: 20.24, 9: 23.51, 10: 27.01,
    11: 30.75, 12: 34.78, 13: 39.13, 14: 43.83, 15: 48.91, 16: 54.41, 17: 60.38, 18: 66.85, 19: 73.87, 20: 81.51,
    21: 89.83, 22: 98.94, 23: 108.93, 24: 119.93, 25: 132.07, 26: 145.51, 27: 144.35, 28: 143.10, 29: 157.35,
  },
  '46-50': {
    1: 4.28, 2: 8.77, 3: 13.56, 4: 14.35, 5: 18.55, 6: 23.04, 7: 25.88, 8: 30.72, 9: 35.95, 10: 41.61,
    11: 47.74, 12: 54.39, 13: 61.59, 14: 69.41, 15: 77.92, 16: 87.19, 17: 97.33, 18: 108.45, 19: 120.70, 20: 134.23,
    21: 149.19, 22: 148.78, 23: 148.19, 24: 164.04,
  },
  '51-55': {
    1: 6.62, 2: 13.56, 3: 21.14, 4: 22.56, 5: 29.38, 6: 36.76, 7: 41.57, 8: 49.62, 9: 58.37, 10: 67.88,
    11: 78.25, 12: 89.59, 13: 102.04, 14: 115.74, 15: 130.86, 16: 147.60, 17: 148.52, 18: 166.62, 19: 166.79,
  },
  '56-60': {
    1: 10.95, 2: 22.54, 3: 35.25, 4: 37.73, 5: 49.28, 6: 61.87, 7: 70.23, 8: 84.25, 9: 99.69, 10: 116.74,
    11: 135.60, 12: 139.24, 13: 142.17, 14: 162.04,
  },
  '61-65': {
    1: 18.96, 2: 39.16, 3: 61.60, 4: 66.39, 5: 87.38, 6: 110.59, 7: 111.73, 8: 119.37, 9: 141.93,
  },
};

/**
 * MRTA: Exact premium per 1,000,000 Baht sum assured by age (20..70) and term (1..30).
 * Array index i corresponds to term (i + 1). Maximum age + term <= 75.
 */
const MRTA_MALE_PREMIUM_PER_1M: Record<number, number[]> = {
  20: [1550, 3050, 4600, 5240, 6620, 8020, 8780, 10120, 11490, 12880, 14280, 15720, 17180, 18670, 20200, 21770, 23380, 25040, 26760, 28520, 30350, 32240, 34200, 36230, 38330, 40520, 42790, 45170, 47640, 50220],
  21: [1610, 3160, 4760, 5400, 6800, 8230, 8990, 10360, 11740, 13150, 14580, 16050, 17540, 19080, 20660, 22280, 23960, 25680, 27470, 29310, 31220, 33200, 35260, 37390, 39610, 41920, 44320, 46830, 49450, 52190],
  22: [1660, 3250, 4870, 5520, 6940, 8390, 9150, 10540, 11950, 13380, 14850, 16350, 17890, 19470, 21110, 22790, 24530, 26340, 28200, 30130, 32130, 34210, 36370, 38620, 40960, 43400, 45950, 48610, 51400, 54310],
  23: [1690, 3310, 4960, 5610, 7050, 8520, 9290, 10690, 12130, 13600, 15100, 16650, 18240, 19880, 21580, 23340, 25150, 27040, 28990, 31010, 33120, 35310, 37580, 39960, 42430, 45020, 47730, 50560, 53520, 56620],
  24: [1720, 3360, 5030, 5690, 7140, 8630, 9410, 10850, 12310, 13820, 15370, 16970, 18620, 20330, 22100, 23940, 25840, 27810, 29860, 31990, 34200, 36510, 38920, 41430, 44060, 46810, 49680, 52690, 55850, 59160],
  25: [1740, 3400, 5080, 5750, 7230, 8730, 9540, 11010, 12520, 14070, 15680, 17340, 19060, 20850, 22700, 24620, 26610, 28680, 30840, 33080, 35420, 37860, 40410, 43080, 45870, 48790, 51850, 55060, 58420, 61950],
  26: [1760, 3430, 5130, 5810, 7320, 8860, 9690, 11210, 12770, 14380, 16050, 17780, 19580, 21450, 23390, 25400, 27500, 29680, 31950, 34320, 36800, 39380, 42090, 44920, 47890, 51000, 54270, 57690, 61280, 65040],
  27: [1780, 3470, 5200, 5900, 7440, 9020, 9890, 11460, 13080, 14760, 16500, 18310, 20200, 22150, 24190, 26310, 28520, 30820, 33220, 35730, 38350, 41100, 43980, 46990, 50160, 53480, 56960, 60610, 64440, 68470],
  28: [1800, 3520, 5290, 6010, 7590, 9230, 10140, 11770, 13460, 15220, 17050, 18940, 20920, 22980, 25120, 27350, 29690, 32120, 34660, 37330, 40110, 43040, 46100, 49310, 52690, 56230, 59950, 63850, 67940, 72250],
  29: [1830, 3600, 5410, 6160, 7800, 9500, 10460, 12160, 13930, 15770, 17690, 19680, 21760, 23930, 26190, 28550, 31020, 33590, 36290, 39120, 42090, 45200, 48470, 51900, 55500, 59280, 63250, 67430, 71810, 76420],
  30: [1880, 3690, 5570, 6360, 8060, 9840, 10850, 12630, 14480, 16420, 18430, 20530, 22730, 25010, 27400, 29900, 32510, 35250, 38120, 41140, 44300, 47620, 51100, 54770, 58610, 62650, 66900, 71360, 76060, 81000],
  31: [1940, 3820, 5770, 6590, 8380, 10230, 11300, 13170, 15120, 17160, 19280, 21500, 23810, 26230, 28760, 31410, 34190, 37100, 40160, 43370, 46740, 50290, 54010, 57920, 62030, 66360, 70900, 75680, 80720, 86030],
  32: [2020, 3970, 6010, 6880, 8740, 10690, 11820, 13790, 15840, 17990, 20230, 22570, 25010, 27580, 30260, 33080, 36040, 39140, 42400, 45830, 49430, 53220, 57200, 61380, 65780, 70410, 75280, 80410, 85820, 91530],
  33: [2100, 4150, 6280, 7200, 9160, 11210, 12400, 14470, 16640, 18900, 21270, 23750, 26340, 29060, 31920, 34920, 38070, 41380, 44860, 48530, 52370, 56420, 60680, 65160, 69870, 74820, 80050, 85560, 91390, 97540],
  34: [2200, 4350, 6590, 7550, 9620, 11780, 13030, 15220, 17510, 19900, 22410, 25040, 27800, 30690, 33730, 36930, 40290, 43830, 47550, 51470, 55580, 59910, 64470, 69260, 74310, 79640, 85250, 91190, 97460, 104110],
  35: [2320, 4570, 6920, 7940, 10120, 12400, 13720, 16030, 18460, 20990, 23650, 26450, 29380, 32470, 35710, 39130, 42720, 46500, 50480, 54670, 59080, 63710, 68590, 73730, 79160, 84880, 90920, 97320, 104090, 111280],
  36: [2440, 4810, 7290, 8360, 10660, 13060, 14470, 16920, 19480, 22180, 25010, 27980, 31110, 34410, 37870, 41520, 45370, 49410, 53670, 58150, 62870, 67840, 73070, 78600, 84420, 90590, 97110, 104010, 111340, 119110],
  37: [2570, 5070, 7680, 8820, 11240, 13790, 15280, 17880, 20600, 23470, 26490, 29660, 33000, 36520, 40230, 44140, 48250, 52580, 57140, 61940, 67000, 72330, 77950, 83890, 90170, 96810, 103860, 111320, 119250, 127670],
  38: [2700, 5340, 8110, 9310, 11880, 14570, 16160, 18920, 21820, 24880, 28100, 31490, 35070, 38830, 42800, 46980, 51390, 56020, 60910, 66060, 71480, 77210, 83260, 89660, 96440, 103620, 111230, 119320, 127910, 137030],
  39: [2860, 5640, 8570, 9840, 12570, 15430, 17120, 20060, 23160, 26430, 29870, 33500, 37330, 41360, 45610, 50090, 54800, 59780, 65010, 70540, 76370, 82540, 89060, 95970, 103290, 111060, 119300, 128070, 137380, 147280],
  40: [3020, 5970, 9070, 10430, 13320, 16370, 18180, 21320, 24630, 28130, 31810, 35700, 39800, 44120, 48670, 53470, 58530, 63860, 69490, 75430, 81710, 88360, 95400, 102860, 110780, 119200, 128140, 137650, 147760, 158500],
  41: [3200, 6330, 9620, 11070, 14150, 17410, 19350, 22710, 26250, 29990, 33940, 38110, 42500, 47130, 52010, 57160, 62590, 68320, 74370, 80770, 87540, 94720, 102330, 110410, 119000, 128130, 137830, 148150, 159120, 170790],
  42: [3400, 6720, 10230, 11780, 15070, 18550, 20630, 24230, 28030, 32040, 36280, 40740, 45450, 50420, 55650, 61180, 67010, 73180, 79700, 86600, 93920, 101680, 109920, 118690, 128000, 137910, 148450, 159650, 171570, 184220],
  43: [3620, 7160, 10900, 12560, 16090, 19810, 22050, 25910, 29990, 34290, 38830, 43620, 48670, 54000, 59620, 65560, 71840, 78480, 85520, 92980, 100900, 109310, 118250, 127760, 137870, 148630, 160080, 172250, 185180, 198900],
  44: [3860, 7650, 11650, 13430, 17210, 21200, 23610, 27750, 32120, 36740, 41610, 46750, 52170, 57900, 63940, 70340, 77110, 84280, 91890, 99960, 108550, 117670, 127380, 137710, 148700, 160390, 172820, 186040, 200060, 214920],
  45: [4130, 8180, 12470, 14390, 18440, 22730, 25310, 29760, 34450, 39400, 44630, 50150, 55980, 62140, 68650, 75550, 82860, 90620, 98860, 107620, 116930, 126840, 137390, 148620, 160560, 173270, 186770, 201110, 216300, 232360],
  46: [4420, 8770, 13370, 15430, 19790, 24390, 27170, 31940, 36980, 42300, 47920, 53850, 60120, 66760, 73790, 81240, 89150, 97560, 106490, 116010, 126130, 136900, 148370, 160580, 173570, 187370, 202030, 217560, 233980],
  47: [4750, 9420, 14360, 16580, 21260, 26200, 29180, 34310, 39720, 45440, 51480, 57860, 64620, 71790, 79390, 87460, 96040, 105160, 114870, 125210, 136220, 147940, 160420, 173700, 187810, 202800, 218680, 235480],
  48: [5100, 10120, 15440, 17820, 22840, 28160, 31360, 36870, 42680, 48830, 55340, 62230, 69530, 77280, 85520, 94270, 103590, 113500, 124070, 135320, 147300, 160060, 173640, 188070, 203400, 219650, 236830],
  49: [5490, 10890, 16600, 19160, 24560, 30270, 33710, 39630, 45890, 52520, 59540, 66990, 74890, 83290, 92230, 101750, 111880, 122680, 134180, 146430, 159480, 173360, 188130, 203820, 220440, 238030],
  50: [5900, 11710, 17850, 20600, 26410, 32550, 36250, 42630, 49380, 56530, 64130, 72190, 80770, 89900, 99620, 109970, 121010, 132770, 145300, 158650, 172860, 187970, 204030, 221050, 239050],
  51: [6350, 12590, 19200, 22150, 28400, 35010, 39000, 45890, 53180, 60930, 69160, 77920, 87240, 97180, 107760, 119050, 131080, 143900, 157560, 172110, 187580, 204020, 221450, 239880],
  52: [6830, 13550, 20650, 23840, 30570, 37690, 42010, 49460, 57360, 65770, 74710, 84240, 94400, 105230, 116770, 129080, 142210, 156200, 171090, 186940, 203770, 221620, 240500],
  53: [7350, 14580, 22230, 25670, 32930, 40640, 45330, 53400, 61980, 71120, 80870, 91260, 102330, 114150, 126760, 140200, 154530, 169790, 186020, 203270, 221570, 240920],
  54: [7920, 15710, 23970, 27690, 35540, 43890, 49000, 57770, 67120, 77090, 87720, 99060, 111170, 124080, 137850, 152530, 168170, 184820, 202500, 221260, 241100],
  55: [8540, 16960, 25890, 29930, 38450, 47530, 53100, 62670, 72870, 83760, 95380, 107780, 121010, 135130, 150190, 166230, 183300, 201440, 220680, 241030],
  56: [9240, 18360, 28040, 32440, 41720, 51610, 57710, 68160, 79320, 91230, 103950, 117520, 132000, 147450, 163910, 181430, 200050, 219790, 240670],
  57: [10020, 19920, 30460, 35270, 45400, 56200, 62900, 74340, 86560, 99610, 113540, 128410, 144270, 161170, 179160, 198280, 218550, 240000],
  58: [10910, 21700, 33200, 38470, 49550, 61390, 68750, 81290, 94690, 109000, 124270, 140570, 157930, 176420, 196070, 216910, 238940],
  59: [11910, 23710, 36300, 42090, 54250, 67240, 75330, 89100, 103810, 119510, 136270, 154130, 173140, 193350, 214780, 237440],
  60: [13050, 25980, 39800, 46180, 59540, 73820, 82720, 97850, 114020, 131260, 149640, 169220, 190020, 212080, 235400],
  61: [14340, 28560, 43760, 50790, 65490, 81210, 91010, 107660, 125430, 144370, 164530, 185970, 208700, 232720],
  62: [15800, 31470, 48230, 55970, 72180, 89500, 100290, 118620, 138160, 158960, 181070, 204520, 229300],
  63: [17440, 34740, 53250, 61800, 79690, 98790, 110670, 130860, 152350, 175190, 199400, 224990],
  64: [19290, 38430, 58890, 68340, 88100, 109200, 122280, 144520, 168140, 193180, 219650],
  65: [21380, 42580, 65240, 75690, 97550, 120850, 135260, 159740, 185680, 213090],
  66: [23730, 47260, 72390, 83950, 108150, 133910, 149750, 176670, 205110],
  67: [26390, 52540, 80450, 93250, 120050, 148510, 165900, 195460],
  68: [29400, 58520, 89550, 103720, 133390, 164820, 183840],
  69: [32820, 65270, 99810, 115470, 148310, 182950],
  70: [36680, 72900, 111340, 128630, 164910],
};

const MRTA_FEMALE_PREMIUM_PER_1M: Record<number, number[]> = {
  20: [550, 1090, 1640, 1700, 2150, 2610, 2860, 3310, 3770, 4230, 4710, 5200, 5700, 6210, 6740, 7280, 7840, 8410, 9010, 9630, 10280, 10960, 11680, 12420, 13210, 14040, 14920, 15840, 16820, 17850],
  21: [570, 1120, 1690, 1750, 2210, 2680, 2940, 3400, 3870, 4340, 4830, 5340, 5850, 6380, 6920, 7480, 8060, 8670, 9300, 9950, 10640, 11360, 12120, 12920, 13760, 14650, 15590, 16580, 17630, 18740],
  22: [590, 1160, 1740, 1800, 2270, 2750, 3010, 3480, 3960, 4450, 4960, 5470, 6000, 6550, 7110, 7700, 8310, 8940, 9610, 10300, 11030, 11800, 12610, 13460, 14360, 15320, 16330, 17390, 18520, 19710],
  23: [600, 1190, 1780, 1840, 2320, 2820, 3080, 3560, 4060, 4560, 5080, 5610, 6160, 6730, 7320, 7930, 8570, 9240, 9940, 10680, 11460, 12280, 13150, 14060, 15030, 16060, 17140, 18290, 19500, 20790],
  24: [620, 1210, 1820, 1880, 2380, 2880, 3160, 3650, 4150, 4670, 5210, 5760, 6330, 6920, 7540, 8190, 8860, 9580, 10320, 11110, 11940, 12820, 13750, 14730, 15770, 16880, 18040, 19280, 20590, 21990],
  25: [630, 1240, 1870, 1930, 2430, 2950, 3230, 3730, 4250, 4790, 5350, 5920, 6520, 7140, 7790, 8480, 9190, 9950, 10750, 11590, 12480, 13430, 14430, 15480, 16600, 17790, 19050, 20380, 21800, 23310],
  26: [650, 1270, 1910, 1970, 2490, 3020, 3310, 3830, 4360, 4920, 5500, 6100, 6730, 7390, 8080, 8800, 9570, 10380, 11230, 12140, 13090, 14110, 15180, 16320, 17530, 18810, 20160, 21610, 23150, 24790],
  27: [660, 1300, 1950, 2010, 2540, 3090, 3390, 3930, 4490, 5070, 5670, 6310, 6970, 7670, 8400, 9180, 10000, 10860, 11780, 12750, 13780, 14870, 16030, 17260, 18560, 19940, 21410, 22980, 24650, 26440],
  28: [680, 1330, 2000, 2060, 2610, 3170, 3490, 4050, 4630, 5240, 5880, 6550, 7250, 7990, 8780, 9610, 10490, 11420, 12400, 13450, 14560, 15740, 16980, 18310, 19710, 21210, 22800, 24510, 26330, 28280],
  29: [690, 1360, 2050, 2120, 2680, 3270, 3600, 4180, 4800, 5440, 6120, 6830, 7580, 8370, 9210, 10100, 11050, 12050, 13110, 14240, 15430, 16700, 18050, 19480, 21000, 22630, 24360, 26220, 28200, 30340],
  30: [710, 1400, 2110, 2180, 2770, 3380, 3730, 4340, 4990, 5680, 6390, 7160, 7960, 8810, 9720, 10670, 11690, 12770, 13910, 15130, 16420, 17790, 19250, 20800, 22450, 24210, 26100, 28130, 30300, 32640],
  31: [730, 1440, 2180, 2260, 2870, 3510, 3880, 4540, 5230, 5950, 6720, 7540, 8400, 9320, 10290, 11320, 12420, 13580, 14820, 16130, 17520, 19000, 20580, 22270, 24060, 25990, 28050, 30270, 32650, 35220],
  32: [760, 1490, 2260, 2350, 3000, 3670, 4070, 4770, 5500, 6280, 7100, 7980, 8910, 9900, 10950, 12060, 13240, 14500, 15830, 17250, 18760, 20360, 22080, 23910, 25870, 27970, 30230, 32660, 35270, 38090],
  33: [790, 1560, 2360, 2460, 3140, 3860, 4290, 5030, 5820, 6660, 7550, 8490, 9490, 10560, 11690, 12890, 14170, 15520, 16970, 18500, 20140, 21880, 23740, 25740, 27880, 30180, 32660, 35330, 38200, 41310],
  34: [830, 1640, 2480, 2600, 3320, 4090, 4550, 5350, 6190, 7090, 8050, 9070, 10150, 11300, 12520, 13820, 15200, 16670, 18230, 19890, 21670, 23570, 25600, 27790, 30130, 32650, 35370, 38310, 41470, 44900],
  35: [870, 1730, 2630, 2750, 3530, 4350, 4850, 5710, 6620, 7590, 8630, 9730, 10890, 12140, 13460, 14860, 16350, 17940, 19630, 21440, 23380, 25450, 27670, 30060, 32630, 35410, 38400, 41630, 45120, 48900],
  36: [930, 1830, 2800, 2930, 3770, 4650, 5190, 6120, 7100, 8150, 9270, 10460, 11720, 13060, 14490, 16010, 17620, 19350, 21190, 23160, 25270, 27530, 29970, 32590, 35420, 38470, 41760, 45330, 49190, 53380],
  37: [990, 1960, 2990, 3140, 4040, 4990, 5580, 6580, 7640, 8780, 9990, 11270, 12630, 14090, 15630, 17270, 19030, 20900, 22910, 25060, 27370, 29850, 32520, 35400, 38510, 41870, 45510, 49450, 53730, 58380],
  38: [1060, 2100, 3210, 3380, 4340, 5370, 6010, 7090, 8240, 9470, 10780, 12160, 13640, 15210, 16880, 18670, 20580, 22620, 24810, 27160, 29690, 32420, 35350, 38530, 41950, 45660, 49680, 54050, 58790, 63970],
  39: [1140, 2260, 3460, 3640, 4690, 5800, 6490, 7660, 8900, 10230, 11640, 13140, 14740, 16440, 18260, 20200, 22280, 24510, 26910, 29490, 32270, 35260, 38500, 41990, 45780, 49880, 54340, 59180, 64460, 70240],
  40: [1230, 2440, 3740, 3930, 5070, 6270, 7010, 8280, 9630, 11060, 12590, 14210, 15940, 17790, 19770, 21890, 24160, 26600, 29230, 32060, 35120, 38420, 41990, 45850, 50030, 54580, 59530, 64920, 70820, 77270],
  41: [1330, 2640, 4040, 4260, 5480, 6780, 7580, 8960, 10410, 11960, 13620, 15380, 17260, 19270, 21430, 23740, 26230, 28910, 31800, 34920, 38280, 41920, 45860, 50140, 54780, 59830, 65340, 71360, 77950, 85180],
  42: [1440, 2860, 4370, 4610, 5930, 7340, 8210, 9690, 11270, 12950, 14740, 16650, 18700, 20900, 23260, 25790, 28520, 31470, 34650, 38080, 41800, 45820, 50180, 54920, 60080, 65700, 71850, 78590, 85970, 94090],
  43: [1550, 3090, 4730, 4990, 6420, 7940, 8880, 10480, 12190, 14010, 15960, 18050, 20280, 22690, 25270, 28060, 31060, 34300, 37810, 41600, 45700, 50160, 55000, 60260, 66010, 72290, 79170, 86720, 95010, 104110],
  44: [1680, 3350, 5120, 5400, 6940, 8590, 9610, 11340, 13200, 15180, 17300, 19580, 22030, 24660, 27500, 30570, 33880, 37450, 41320, 45510, 50060, 55000, 60380, 66250, 72670, 79700, 87420, 95890, 105190, 115390],
  45: [1820, 3620, 5540, 5840, 7510, 9290, 10400, 12280, 14300, 16460, 18780, 21280, 23960, 26860, 29980, 33360, 37010, 40960, 45240, 49880, 54930, 60430, 66430, 72990, 80170, 88060, 96720, 106230, 116660, 128070],
  46: [1970, 3920, 6000, 6310, 8130, 10060, 11260, 13310, 15510, 17880, 20420, 23160, 26110, 29300, 32750, 36470, 40510, 44880, 49620, 54780, 60400, 66530, 73230, 80580, 88640, 97500, 107220, 117890, 129560],
  47: [2130, 4240, 6490, 6830, 8800, 10900, 12210, 14450, 16860, 19450, 22250, 25260, 28510, 32030, 35840, 39960, 44430, 49270, 54540, 60280, 66550, 73410, 80920, 89160, 98220, 108170, 119070, 131010],
  48: [2310, 4590, 7020, 7400, 9540, 11830, 13270, 15720, 18370, 21220, 24290, 27620, 31210, 35100, 39310, 43870, 48830, 54210, 60080, 66490, 73500, 81190, 89620, 98880, 109060, 120220, 132430],
  49: [2500, 4970, 7620, 8040, 10370, 12870, 14460, 17150, 20060, 23200, 26600, 30270, 34240, 38540, 43210, 48270, 53780, 59790, 66340, 73510, 81370, 90000, 99480, 109900, 121320, 133810],
  50: [2710, 5400, 8280, 8750, 11300, 14050, 15800, 18770, 21980, 25450, 29200, 33260, 37660, 42430, 47610, 53240, 59380, 66090, 73430, 81480, 90310, 100010, 110670, 122360, 135150],
  51: [2950, 5890, 9040, 9560, 12360, 15390, 17330, 20600, 24150, 27980, 32140, 36640, 41520, 46810, 52580, 58860, 65730, 73240, 81480, 90520, 100460, 111370, 123340, 136440],
  52: [3230, 6440, 9900, 10480, 13570, 16910, 19050, 22680, 26600, 30850, 35450, 40450, 45870, 51770, 58210, 65230, 72930, 81360, 90630, 100810, 111990, 124250, 137660],
  53: [3540, 7070, 10880, 11530, 14940, 18640, 21010, 25030, 29380, 34090, 39200, 44750, 50800, 57380, 64580, 72460, 81110, 90600, 101030, 112490, 125060, 138800],
  54: [3900, 7790, 11990, 12720, 16500, 20590, 23230, 27680, 32500, 37740, 43430, 49620, 56370, 63750, 71830, 80690, 90420, 101120, 112860, 125750, 139830],
  55: [4300, 8600, 13260, 14070, 18260, 22790, 25720, 30670, 36030, 41860, 48210, 55130, 62690, 70980, 80070, 90050, 101020, 113070, 126290, 140740],
  56: [4760, 9530, 14680, 15590, 20230, 25270, 28530, 34030, 40010, 46520, 53610, 61380, 69880, 79200, 89450, 100710, 113080, 126650, 141480],
  57: [5280, 10560, 16290, 17290, 22460, 28050, 31690, 37820, 44500, 51790, 59760, 68490, 78070, 88590, 100160, 112870, 126790, 142020],
  58: [5860, 11730, 18090, 19210, 24960, 31190, 35260, 42120, 49600, 57790, 66760, 76610, 87430, 99320, 112380, 126690, 142340],
  59: [6510, 13040, 20110, 21370, 27780, 34750, 39310, 47010, 55420, 64650, 74780, 85910, 98140, 111580, 126300, 142390],
  60: [7250, 14520, 22400, 23820, 30990, 38790, 43940, 52600, 62100, 72530, 83990, 96590, 110430, 125580, 142140],
  61: [8080, 16200, 25010, 26620, 34660, 43440, 49260, 59050, 69800, 81620, 94610, 108870, 124490, 141540],
  62: [9030, 18120, 28000, 29830, 38890, 48810, 55430, 66520, 78720, 92120, 106840, 122950, 140540],
  63: [10130, 20340, 31470, 33560, 43810, 55060, 62590, 75200, 89050, 104250, 120900, 139060],
  64: [11410, 22920, 35510, 37920, 49560, 62350, 70950, 85280, 101010, 118220, 137000],
  65: [12910, 25960, 40260, 43040, 56300, 70870, 80670, 96970, 114800, 134230],
  66: [14670, 29530, 45840, 49040, 64180, 80810, 91960, 110450, 130600],
  67: [16760, 33740, 52400, 56070, 73370, 92330, 104960, 125880],
  68: [19210, 38690, 60080, 64260, 84010, 105580, 119800],
  69: [22090, 44460, 68990, 73710, 96220, 120660],
  70: [25430, 51150, 79250, 84510, 110060],
};

function getMltaAgeGroupKey(age: number): string {
  if (age === 20) return '20';
  if (age >= 21 && age <= 30) return '21-30';
  if (age >= 31 && age <= 40) return '31-40';
  if (age >= 41 && age <= 45) return '41-45';
  if (age >= 46 && age <= 50) return '46-50';
  if (age >= 51 && age <= 55) return '51-55';
  if (age >= 56 && age <= 60) return '56-60';
  if (age >= 61 && age <= 65) return '61-65';
  return '21-30';
}

export function calculateInsurance(params: {
  insuranceType?: InsuranceType;
  gender: Gender;
  birthYearInput: string;
  sumAssuredInput: string;
  termInput: string;
  planId: string;
}): CalculationResult {
  const insuranceType: InsuranceType = params.insuranceType ?? 'mlta';
  const currentYearBE = getCurrentYearBE();
  const plan = INSURANCE_PLANS.find((p) => p.id === params.planId) ?? INSURANCE_PLANS[0];
  const errors: ValidationErrors = {};

  const maxAge = insuranceType === 'mrta' ? MRTA_MAX_AGE : MLTA_MAX_AGE;
  const maxAgePlusTerm =
    insuranceType === 'mrta' ? MRTA_MAX_AGE_PLUS_TERM : MLTA_MAX_AGE_PLUS_TERM;

  // 1. Validate Birth Year (พ.ศ.) & Age = Current Year (พ.ศ.) - Birth Year (พ.ศ.)
  const birthYearParsed = parseStrictInteger(params.birthYearInput);
  let birthYearBE: number | null = null;
  let age: number | null = null;

  if (!birthYearParsed.valid || birthYearParsed.value === null) {
    errors.birthYear = birthYearParsed.error;
  } else {
    birthYearBE = birthYearParsed.value;
    age = currentYearBE - birthYearBE;

    if (birthYearBE > currentYearBE) {
      errors.birthYear = 'ปีเกิด (พ.ศ.) ต้องไม่เกินปีปัจจุบัน และต้องอายุ 20 ปี (นับรวมทั้งปี)';
    } else if (age < UNDER_AGE_STRICT_THRESHOLD) {
      errors.birthYear = 'ต้องอายุ 20 ปี (นับรวมทั้งปี)';
    } else if (age < MIN_AGE) {
      errors.birthYear = `ต้องอายุ 20 ปี (นับรวมทั้งปี) — เกณฑ์รับประกันต้องอายุระหว่าง 20-${maxAge} ปี เท่านั้น`;
    } else if (age > maxAge) {
      errors.birthYear = `ต้องอายุระหว่าง 20-${maxAge} ปี เท่านั้น`;
    }
  }

  // 2. Validate Sum Assured (50,000 - 150,000,000)
  const sumParsed = parseStrictInteger(params.sumAssuredInput);
  let sumAssured: number | null = null;

  if (!sumParsed.valid || sumParsed.value === null) {
    errors.sumAssured = sumParsed.error;
  } else {
    sumAssured = sumParsed.value;
    if (sumAssured < MIN_SUM_ASSURED) {
      errors.sumAssured = 'ทุนประกันขั้นต่ำคือ 50,000 บาท';
    } else if (sumAssured > MAX_SUM_ASSURED) {
      errors.sumAssured = 'ทุนประกันสูงสุดคือ 150,000,000 บาท (150 ล้านบาท)';
    }
  }

  // 3. Validate Policy Term (optional in both MLTA and MRTA; when empty, user views the 1-30 year schedule)
  let term: number | null = null;
  if (params.termInput.trim() !== '') {
    const termParsed = parseStrictInteger(params.termInput);
    if (!termParsed.valid || termParsed.value === null) {
      errors.term = termParsed.error;
    } else {
      term = termParsed.value;
      if (term < MIN_TERM || term > MAX_TERM) {
        errors.term =
          'ระยะเวลาเอาประกันต้องอยู่ระหว่าง 1-30 ปี และต้องไม่เกินกว่าระยะเวลากู้ยืมเงินตามสัญญากู้';
      } else if (age !== null && age + term > maxAgePlusTerm) {
        const maxAllowedTerm = maxAgePlusTerm - age;
        errors.term =
          maxAllowedTerm <= 0
            ? `อายุ ${age} ปี เมื่อรวมกับระยะเวลาเอาประกันแล้วต้องไม่เกิน ${maxAgePlusTerm} ปี (ไม่สามารถทำประกันได้เนื่องจากอายุเกินเกณฑ์)`
            : `อายุ ${age} ปี เมื่อรวมกับระยะเวลาเอาประกันแล้วต้องไม่เกิน ${maxAgePlusTerm} ปี (สำหรับอายุนี้ ระยะเวลาเอาประกันสูงสุดคือ ${maxAllowedTerm} ปี)`;
      }
    }
  }

  const isValid = Object.keys(errors).length === 0 && age !== null && sumAssured !== null;

  if (!isValid || age === null || sumAssured === null) {
    return {
      insuranceType,
      isValid: false,
      errors,
      currentYearBE,
      birthYearBE,
      age,
      gender: params.gender,
      sumAssured,
      term,
      plan,
      totalPremium: null,
      annualPremium: null,
      monthlyEquivalent: null,
      japanTripPoints: null,
      fbiReward: null,
      ratePerThousand: null,
    };
  }

  if (insuranceType === 'mrta') {
    const table =
      params.gender === 'female' ? MRTA_FEMALE_PREMIUM_PER_1M : MRTA_MALE_PREMIUM_PER_1M;
    const ageRates = table[age] ?? [];
    const mrtaQuotes: Record<number, MrtaTermQuote | null> = {};

    for (const t of MLTA_ALL_TERMS) {
      const premiumPer1M = ageRates[t - 1];
      if (premiumPer1M === undefined || age + t > MRTA_MAX_AGE_PLUS_TERM) {
        mrtaQuotes[t] = null;
      } else {
        const computedTotal = Math.round((sumAssured / 1_000_000) * premiumPer1M);
        mrtaQuotes[t] = {
          term: t,
          totalPremium: computedTotal,
          fbiReward: Math.round(computedTotal * FBI_RATE),
          ratePerThousand: premiumPer1M / 1000,
        };
      }
    }

    if (term === null) {
      return {
        insuranceType,
        isValid: true,
        errors,
        currentYearBE,
        birthYearBE,
        age,
        gender: params.gender,
        sumAssured,
        term: null,
        plan,
        totalPremium: null,
        annualPremium: null,
        monthlyEquivalent: null,
        japanTripPoints: null,
        fbiReward: null,
        ratePerThousand: null,
        mrtaQuotes,
      };
    }

    const selectedQuote = mrtaQuotes[term] ?? null;
    if (!selectedQuote) {
      return {
        insuranceType,
        isValid: false,
        errors: {
          ...errors,
          term: `อายุ ${age} ปี ไม่รองรับระยะเวลาเอาประกัน ${term} ปี`,
        },
        currentYearBE,
        birthYearBE,
        age,
        gender: params.gender,
        sumAssured,
        term,
        plan,
        totalPremium: null,
        annualPremium: null,
        monthlyEquivalent: null,
        japanTripPoints: null,
        fbiReward: null,
        ratePerThousand: null,
        mrtaQuotes,
      };
    }

    return {
      insuranceType,
      isValid: true,
      errors,
      currentYearBE,
      birthYearBE,
      age,
      gender: params.gender,
      sumAssured,
      term,
      plan,
      totalPremium: selectedQuote.totalPremium,
      annualPremium: selectedQuote.totalPremium / term,
      monthlyEquivalent: selectedQuote.totalPremium / (term * 12),
      japanTripPoints: null,
      fbiReward: selectedQuote.fbiReward,
      ratePerThousand: selectedQuote.ratePerThousand,
      mrtaQuotes,
    };
  }

  if (term === null) {
    return {
      insuranceType,
      isValid: true,
      errors,
      currentYearBE,
      birthYearBE,
      age,
      gender: params.gender,
      sumAssured,
      term: null,
      plan,
      totalPremium: null,
      annualPremium: null,
      monthlyEquivalent: null,
      japanTripPoints: null,
      fbiReward: null,
      ratePerThousand: null,
    };
  }

  const groupKey = getMltaAgeGroupKey(age);
  const table = params.gender === 'female' ? MLTA_FEMALE_RATE_TABLE : MLTA_MALE_RATE_TABLE;
  const ratesForAge = table[groupKey] ?? table['21-30'];
  const ratePerThousand = ratesForAge[term];

  if (ratePerThousand === undefined) {
    return {
      insuranceType,
      isValid: false,
      errors: {
        ...errors,
        term: `อายุ ${age} ปี ไม่รองรับระยะเวลาเอาประกัน ${term} ปี`,
      },
      currentYearBE,
      birthYearBE,
      age,
      gender: params.gender,
      sumAssured,
      term,
      plan,
      totalPremium: null,
      annualPremium: null,
      monthlyEquivalent: null,
      japanTripPoints: null,
      fbiReward: null,
      ratePerThousand: null,
    };
  }

  // Exact MLTA formula: (Sum Assured / 1,000) * table rate (e.g. 100,000 / 1,000 * 92.47 = 9,247)
  const totalPremium = Math.round((sumAssured / 1000) * ratePerThousand);
  const annualPremium = totalPremium / term;
  const monthlyEquivalent = totalPremium / (term * 12);
  const fbiReward = Math.round(totalPremium * FBI_RATE);

  return {
    insuranceType,
    isValid: true,
    errors,
    currentYearBE,
    birthYearBE,
    age,
    gender: params.gender,
    sumAssured,
    term,
    plan,
    totalPremium,
    annualPremium,
    monthlyEquivalent,
    japanTripPoints: null,
    fbiReward,
    ratePerThousand,
  };
}

export function getMrtaScheduleTable(gender: Gender, sumAssured: number): MrtaTableRow[] {
  const table = gender === 'female' ? MRTA_FEMALE_PREMIUM_PER_1M : MRTA_MALE_PREMIUM_PER_1M;
  const rows: MrtaTableRow[] = [];

  for (let age = MIN_AGE; age <= MRTA_MAX_AGE; age++) {
    const ageRates = table[age] ?? [];
    const premiums: Record<number, number | null> = {};
    for (const t of MLTA_ALL_TERMS) {
      const premiumPer1M = ageRates[t - 1];
      premiums[t] =
        premiumPer1M !== undefined && age + t <= MRTA_MAX_AGE_PLUS_TERM
          ? Math.round((sumAssured / 1_000_000) * premiumPer1M)
          : null;
    }
    rows.push({
      age,
      premiums,
    });
  }

  return rows;
}

export function getMrtaScheduleTables(
  gender: Gender,
  sumAssured: number
): { part1: MrtaTableRow[]; part2: MrtaTableRow[] } {
  const allRows = getMrtaScheduleTable(gender, sumAssured);
  // Part 1: terms 1-15 cover ages 20-70 (since 70 + 1 <= 75)
  // Part 2: terms 16-30 cover ages 20-59 (since 60 + 16 = 76 > 75)
  const part1 = allRows.map((row) => {
    const premiums: Record<number, number | null> = {};
    for (const t of MLTA_TERMS_PART1) {
      premiums[t] = row.premiums[t] ?? null;
    }
    return { age: row.age, premiums };
  });

  const part2 = allRows
    .filter((row) => row.age + 16 <= MRTA_MAX_AGE_PLUS_TERM)
    .map((row) => {
      const premiums: Record<number, number | null> = {};
      for (const t of MLTA_TERMS_PART2) {
        premiums[t] = row.premiums[t] ?? null;
      }
      return { age: row.age, premiums };
    });

  return { part1, part2 };
}

export interface MltaBandRow {
  key: string;
  label: string;
  minAge: number;
  maxAge: number;
  premiums: Record<number, number | null>;
}

export interface MltaCustomerTermQuote {
  term: number;
  totalPremium: number | null;
  fbiReward: number | null;
  ratePerThousand: number | null;
}

export function getMltaScheduleTables(
  gender: Gender,
  sumAssured: number
): { part1: MltaBandRow[]; part2: MltaBandRow[] } {
  const table = gender === 'female' ? MLTA_FEMALE_RATE_TABLE : MLTA_MALE_RATE_TABLE;

  const part1Specs: Array<{
    key: string;
    label: string;
    rateKey: string;
    minAge: number;
    maxAge: number;
    exactAge?: number;
  }> = [
    { key: '20', label: '20', rateKey: '20', minAge: 20, maxAge: 20 },
    { key: '21-30', label: '21-30', rateKey: '21-30', minAge: 21, maxAge: 30 },
    { key: '31-40', label: '31-40', rateKey: '31-40', minAge: 31, maxAge: 40 },
    { key: '41-45', label: '41-45', rateKey: '41-45', minAge: 41, maxAge: 45 },
    { key: '46-50', label: '46-50', rateKey: '46-50', minAge: 46, maxAge: 50 },
    { key: '51-55', label: '51-55', rateKey: '51-55', minAge: 51, maxAge: 55 },
    { key: '56', label: '56', rateKey: '56-60', minAge: 56, maxAge: 56, exactAge: 56 },
    { key: '57', label: '57', rateKey: '56-60', minAge: 57, maxAge: 57, exactAge: 57 },
    { key: '58', label: '58', rateKey: '56-60', minAge: 58, maxAge: 58, exactAge: 58 },
    { key: '59', label: '59', rateKey: '56-60', minAge: 59, maxAge: 59, exactAge: 59 },
    { key: '60', label: '60', rateKey: '56-60', minAge: 60, maxAge: 60, exactAge: 60 },
    { key: '61', label: '61', rateKey: '61-65', minAge: 61, maxAge: 61, exactAge: 61 },
    { key: '62', label: '62', rateKey: '61-65', minAge: 62, maxAge: 62, exactAge: 62 },
    { key: '63', label: '63', rateKey: '61-65', minAge: 63, maxAge: 63, exactAge: 63 },
    { key: '64', label: '64', rateKey: '61-65', minAge: 64, maxAge: 64, exactAge: 64 },
    { key: '65', label: '65', rateKey: '61-65', minAge: 65, maxAge: 65, exactAge: 65 },
  ];

  const part1: MltaBandRow[] = part1Specs.map((spec) => {
    const rates = table[spec.rateKey] ?? {};
    const premiums: Record<number, number | null> = {};
    for (const t of MLTA_TERMS_PART1) {
      const rate = rates[t];
      const allowedByExactAge =
        spec.exactAge === undefined || spec.exactAge + t <= MLTA_MAX_AGE_PLUS_TERM;
      premiums[t] =
        rate !== undefined && allowedByExactAge
          ? Math.round((sumAssured / 1000) * rate)
          : null;
    }
    return {
      key: spec.key,
      label: spec.label,
      minAge: spec.minAge,
      maxAge: spec.maxAge,
      premiums,
    };
  });

  const part2Specs: Array<{
    key: string;
    label: string;
    rateKey: string;
    minAge: number;
    maxAge: number;
  }> = [
    { key: '20', label: '20', rateKey: '20', minAge: 20, maxAge: 20 },
    { key: '21-30', label: '21-30', rateKey: '21-30', minAge: 21, maxAge: 30 },
    { key: '31-40', label: '31-40', rateKey: '31-40', minAge: 31, maxAge: 40 },
    { key: '41-45', label: '41-45', rateKey: '41-45', minAge: 41, maxAge: 45 },
    { key: '46-50', label: '46-50', rateKey: '46-50', minAge: 46, maxAge: 50 },
    { key: '51-55', label: '51-55*', rateKey: '51-55', minAge: 51, maxAge: 55 },
  ];

  const part2: MltaBandRow[] = part2Specs.map((spec) => {
    const rates = table[spec.rateKey] ?? {};
    const premiums: Record<number, number | null> = {};
    for (const t of MLTA_TERMS_PART2) {
      const rate = rates[t];
      premiums[t] = rate !== undefined ? Math.round((sumAssured / 1000) * rate) : null;
    }
    return {
      key: spec.key,
      label: spec.label,
      minAge: spec.minAge,
      maxAge: spec.maxAge,
      premiums,
    };
  });

  return { part1, part2 };
}

export function getMltaCustomerTerms(
  gender: Gender,
  age: number,
  sumAssured: number
): MltaCustomerTermQuote[] {
  const table = gender === 'female' ? MLTA_FEMALE_RATE_TABLE : MLTA_MALE_RATE_TABLE;
  const groupKey = getMltaAgeGroupKey(age);
  const rates = table[groupKey] ?? {};

  return MLTA_ALL_TERMS.map((t) => {
    const rate = rates[t];
    if (
      age < MIN_AGE ||
      age > MLTA_MAX_AGE ||
      age + t > MLTA_MAX_AGE_PLUS_TERM ||
      rate === undefined
    ) {
      return {
        term: t,
        totalPremium: null,
        fbiReward: null,
        ratePerThousand: null,
      };
    }
    const totalPremium = Math.round((sumAssured / 1000) * rate);
    return {
      term: t,
      totalPremium,
      fbiReward: Math.round(totalPremium * FBI_RATE),
      ratePerThousand: rate,
    };
  });
}

export function getMrtaCustomerTerms(
  gender: Gender,
  age: number,
  sumAssured: number
): MltaCustomerTermQuote[] {
  const table = gender === 'female' ? MRTA_FEMALE_PREMIUM_PER_1M : MRTA_MALE_PREMIUM_PER_1M;
  const ageRates = table[age] ?? [];

  return MLTA_ALL_TERMS.map((t) => {
    const premiumPer1M = ageRates[t - 1];
    if (
      age < MIN_AGE ||
      age > MRTA_MAX_AGE ||
      age + t > MRTA_MAX_AGE_PLUS_TERM ||
      premiumPer1M === undefined
    ) {
      return {
        term: t,
        totalPremium: null,
        fbiReward: null,
        ratePerThousand: null,
      };
    }
    const totalPremium = Math.round((sumAssured / 1_000_000) * premiumPer1M);
    return {
      term: t,
      totalPremium,
      fbiReward: Math.round(totalPremium * FBI_RATE),
      ratePerThousand: premiumPer1M / 1000,
    };
  });
}

export interface SavedPlan {
  id: string;
  insuranceType?: InsuranceType;
  label: string;
  createdAt: string;
  planId: string;
  planName: string;
  gender: Gender;
  birthYearBE: number;
  age: number;
  sumAssured: number;
  term: number;
  totalPremium: number;
  annualPremium: number;
  japanTripPoints: number | null;
  fbiReward: number;
  ratePerThousand: number;
}

export function formatBaht(amount: number, decimals = 0): string {
  return amount.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatIntegerInput(value: number): string {
  return value.toLocaleString('en-US');
}
