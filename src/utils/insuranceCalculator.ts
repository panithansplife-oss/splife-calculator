export type Gender = 'male' | 'female';

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
    description: 'แบบประกันคุ้มครองสินเชื่อระยะยาวมาตรฐาน อ้างอิงอัตราเบี้ยหลัก',
  },
];

export const MIN_AGE = 20;
export const MAX_AGE = 65;
export const UNDER_AGE_STRICT_THRESHOLD = 15;
export const MIN_SUM_ASSURED = 50_000;
export const MAX_SUM_ASSURED = 150_000_000;
export const MIN_TERM = 1;
export const MAX_TERM = 30;
export const MAX_AGE_PLUS_TERM = 70;
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

export interface CalculationResult {
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
}

type RateByTerm = Record<number, number>;

/**
 * Exact rate table per 1,000 Baht sum assured (e.g., 92.47 for 100,000 -> 9,247 Baht)
 * Keyed explicitly by term year (2..30, plus 1) to guarantee zero off-by-one indexing errors.
 */
const MALE_RATE_TABLE: Record<string, RateByTerm> = {
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

const FEMALE_RATE_TABLE: Record<string, RateByTerm> = {
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

function getAgeGroupKey(age: number): string {
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
  gender: Gender;
  birthYearInput: string;
  sumAssuredInput: string;
  termInput: string;
  planId: string;
}): CalculationResult {
  const currentYearBE = getCurrentYearBE();
  const plan = INSURANCE_PLANS.find((p) => p.id === params.planId) ?? INSURANCE_PLANS[0];
  const errors: ValidationErrors = {};

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
      errors.birthYear = 'ต้องอายุ 20 ปี (นับรวมทั้งปี) — เกณฑ์รับประกันต้องอายุระหว่าง 20-65ปี เท่านั้น';
    } else if (age > MAX_AGE) {
      errors.birthYear = 'ต้องอายุระหว่าง 20-65ปี เท่านั้น';
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

  // 3. Validate Policy Term (1 - 30 years and age + term <= 70)
  const termParsed = parseStrictInteger(params.termInput);
  let term: number | null = null;

  if (!termParsed.valid || termParsed.value === null) {
    errors.term = termParsed.error;
  } else {
    term = termParsed.value;
    if (term < MIN_TERM || term > MAX_TERM) {
      errors.term = 'ระยะเวลาเอาประกันต้องอยู่ระหว่าง 1-30 ปี และต้องไม่เกินกว่าระยะเวลากู้ยืมเงินตามสัญญากู้';
    } else if (age !== null && age + term > MAX_AGE_PLUS_TERM) {
      const maxAllowedTerm = MAX_AGE_PLUS_TERM - age;
      errors.term =
        maxAllowedTerm <= 0
          ? `อายุ ${age} ปี เมื่อรวมกับระยะเวลาเอาประกันแล้วต้องไม่เกิน 70 ปี (ไม่สามารถทำประกันได้เนื่องจากอายุเกินเกณฑ์)`
          : `อายุ ${age} ปี เมื่อรวมกับระยะเวลาเอาประกันแล้วต้องไม่เกิน 70 ปี (สำหรับอายุนี้ ระยะเวลาเอาประกันสูงสุดคือ ${maxAllowedTerm} ปี)`;
    }
  }

  const isValid =
    Object.keys(errors).length === 0 &&
    age !== null &&
    sumAssured !== null &&
    term !== null;

  if (!isValid || age === null || sumAssured === null || term === null) {
    return {
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

  const groupKey = getAgeGroupKey(age);
  const table = params.gender === 'female' ? FEMALE_RATE_TABLE : MALE_RATE_TABLE;
  const ratesForAge = table[groupKey] ?? table['21-30'];
  const ratePerThousand = ratesForAge[term];

  if (ratePerThousand === undefined) {
    return {
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

  // Exact formula: (Sum Assured / 1,000) * table rate (e.g. 100,000 / 1,000 * 92.47 = 9,247)
  const totalPremium = Math.round((sumAssured / 1000) * ratePerThousand);
  const annualPremium = totalPremium / term;
  const monthlyEquivalent = totalPremium / (term * 12);
  const fbiReward = Math.round(totalPremium * FBI_RATE);

  return {
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

export interface SavedPlan {
  id: string;
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
