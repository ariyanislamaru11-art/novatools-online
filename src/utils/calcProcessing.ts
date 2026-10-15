/**
 * Accurate Calculators & Productivity Processing Formulas for NovaTools
 */

export function calculatePercentageOf(percent: number, total: number): number {
  return (percent / 100) * total;
}

export function calculateIsWhatPercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

export function calculatePercentageChange(fromVal: number, toVal: number): { change: number; type: 'increase' | 'decrease' | 'none' } {
  if (fromVal === 0) return { change: 0, type: 'none' };
  const diff = toVal - fromVal;
  const pct = (diff / Math.abs(fromVal)) * 100;
  return {
    change: Math.abs(pct),
    type: pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'none',
  };
}

export function calculateDiscount(originalPrice: number, discountPercent: number, extraCouponPercent: number = 0, taxPercent: number = 0) {
  const baseDiscount = originalPrice * (Math.max(0, discountPercent) / 100);
  const priceAfterDiscount = Math.max(0, originalPrice - baseDiscount);
  const couponDiscount = priceAfterDiscount * (Math.max(0, extraCouponPercent) / 100);
  const taxableAmount = Math.max(0, priceAfterDiscount - couponDiscount);
  const taxAmount = taxableAmount * (Math.max(0, taxPercent) / 100);
  const finalPrice = taxableAmount + taxAmount;
  const totalSaved = originalPrice - taxableAmount;

  return {
    originalPrice,
    baseDiscount,
    couponDiscount,
    totalSaved,
    taxableAmount,
    taxAmount,
    finalPrice,
  };
}

export function calculateTipAndSplit(billAmount: number, tipPercent: number, numberOfPeople: number = 1, roundUp: boolean = false) {
  const safePeople = Math.max(1, Math.floor(numberOfPeople));
  const tipAmount = billAmount * (Math.max(0, tipPercent) / 100);
  let totalWithTip = billAmount + tipAmount;

  if (roundUp) {
    totalWithTip = Math.ceil(totalWithTip);
  }

  const billPerPerson = billAmount / safePeople;
  const tipPerPerson = tipAmount / safePeople;
  const totalPerPerson = totalWithTip / safePeople;

  return {
    billAmount,
    tipAmount,
    totalWithTip,
    numberOfPeople: safePeople,
    billPerPerson,
    tipPerPerson,
    totalPerPerson,
  };
}

export function calculateAge(birthDateStr: string, targetDateStr?: string) {
  const birth = new Date(birthDateStr);
  const target = targetDateStr ? new Date(targetDateStr) : new Date();

  if (isNaN(birth.getTime()) || isNaN(target.getTime()) || birth > target) {
    throw new Error('Please enter a valid birth date in the past.');
  }

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in previous month
    const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = target.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  // Next birthday
  let nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday < target) {
    nextBday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const daysUntilNextBirthday = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const nextBirthdayDayName = daysOfWeek[nextBday.getDay()];

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    totalMinutes,
    daysUntilNextBirthday,
    nextBirthdayDayName,
  };
}

export function calculateDateDifference(startDateStr: string, endDateStr: string) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Please enter valid dates.');
  }

  const isReverse = end < start;
  const d1 = isReverse ? end : start;
  const d2 = isReverse ? start : end;

  const diffMs = d2.getTime() - d1.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Business days (Mon-Fri)
  let businessDays = 0;
  const cur = new Date(d1);
  while (cur < d2) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      businessDays++;
    }
  }

  return {
    totalDays,
    weeks,
    remainingDays,
    businessDays,
    isReverse,
  };
}

export const UNIT_FACTORS: Record<string, { baseUnit: string; units: Record<string, number | ((v: number) => number)> }> = {
  length: {
    baseUnit: 'm',
    units: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mile: 1609.344,
      yard: 0.9144,
      foot: 0.3048,
      inch: 0.0254,
    },
  },
  weight: {
    baseUnit: 'kg',
    units: {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      pound: 0.45359237,
      ounce: 0.028349523125,
      tonne: 1000,
    },
  },
  area: {
    baseUnit: 'sqm',
    units: {
      sqm: 1,
      sqkm: 1000000,
      sqft: 0.092903,
      sqyd: 0.836127,
      acre: 4046.86,
      hectare: 10000,
    },
  },
  volume: {
    baseUnit: 'liter',
    units: {
      liter: 1,
      ml: 0.001,
      cum: 1000,
      gallon_us: 3.78541,
      quart_us: 0.946353,
      cup_us: 0.236588,
    },
  },
  speed: {
    baseUnit: 'mps',
    units: {
      mps: 1,
      kmh: 0.277778,
      mph: 0.44704,
      knot: 0.514444,
    },
  },
};

export function convertUnits(category: string, value: number, fromUnit: string, toUnit: string): number {
  if (category === 'temperature') {
    // Celsius, Fahrenheit, Kelvin
    let inCelsius: number;
    if (fromUnit === 'celsius') inCelsius = value;
    else if (fromUnit === 'fahrenheit') inCelsius = (value - 32) * (5 / 9);
    else if (fromUnit === 'kelvin') inCelsius = value - 273.15;
    else inCelsius = value;

    if (toUnit === 'celsius') return inCelsius;
    if (toUnit === 'fahrenheit') return (inCelsius * (9 / 5)) + 32;
    if (toUnit === 'kelvin') return inCelsius + 273.15;
    return inCelsius;
  }

  const cat = UNIT_FACTORS[category];
  if (!cat) throw new Error(`Unknown category: ${category}`);

  const fromFactor = cat.units[fromUnit] as number;
  const toFactor = cat.units[toUnit] as number;

  if (fromFactor === undefined || toFactor === undefined) {
    throw new Error('Unsupported unit');
  }

  const inBase = value * fromFactor;
  return inBase / toFactor;
}

export function convertFileSize(value: number, fromUnit: 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB', standard: 'binary' | 'decimal') {
  const base = standard === 'binary' ? 1024 : 1000;
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const fromIndex = units.indexOf(fromUnit);
  if (fromIndex === -1) throw new Error('Invalid unit');

  const bytes = value * Math.pow(base, fromIndex);

  return units.map((u, i) => {
    const converted = bytes / Math.pow(base, i);
    return {
      unit: u,
      value: converted,
      formatted: converted.toLocaleString('en-US', { maximumFractionDigits: 4 }),
    };
  });
}

export function calculateLoanEMI(principal: number, annualRatePercent: number, tenureMonths: number) {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEMI: 0, totalPayment: 0, totalInterest: 0 };
  }

  if (annualRatePercent === 0) {
    const monthlyEMI = principal / tenureMonths;
    return {
      monthlyEMI,
      totalPayment: principal,
      totalInterest: 0,
    };
  }

  const r = annualRatePercent / 12 / 100;
  const n = tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  return {
    monthlyEMI: Math.round(emi * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}

export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  frequency: 1 | 2 | 4 | 12 | 365,
  durationYears: number,
  monthlyDeposit: number = 0
) {
  const r = annualRatePercent / 100;
  const n = frequency;
  const t = durationYears;

  // Future value of principal: P * (1 + r/n)^(n*t)
  const principalFuture = principal * Math.pow(1 + r / n, n * t);

  // Future value of monthly contributions:
  // Assuming deposits at end of each month
  let depositFuture = 0;
  if (monthlyDeposit > 0) {
    const monthlyRate = r / 12;
    const totalMonths = t * 12;
    if (monthlyRate === 0) {
      depositFuture = monthlyDeposit * totalMonths;
    } else {
      depositFuture = monthlyDeposit * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    }
  }

  const totalMaturity = principalFuture + depositFuture;
  const totalDeposited = principal + (monthlyDeposit * t * 12);
  const totalInterest = Math.max(0, totalMaturity - totalDeposited);

  return {
    totalDeposited: Math.round(totalDeposited * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalMaturity: Math.round(totalMaturity * 100) / 100,
  };
}

export function calculateVAT(amount: number, vatPercent: number, mode: 'add' | 'extract') {
  const rate = Math.max(0, vatPercent) / 100;
  if (mode === 'add') {
    const vatAmount = amount * rate;
    const grossAmount = amount + vatAmount;
    return {
      netAmount: amount,
      vatAmount,
      grossAmount,
    };
  } else {
    // Extract VAT: Gross = Net * (1 + rate) => Net = Gross / (1 + rate)
    const netAmount = amount / (1 + rate);
    const vatAmount = amount - netAmount;
    return {
      netAmount,
      vatAmount,
      grossAmount: amount,
    };
  }
}

export function convertNumeralBases(value: string, fromBase: 2 | 8 | 10 | 16): { bin: string; oct: string; dec: string; hex: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { bin: '', oct: '', dec: '', hex: '' };
  }

  const parsed = parseInt(trimmed, fromBase);
  if (isNaN(parsed)) {
    throw new Error(`Invalid base-${fromBase} number.`);
  }

  return {
    bin: parsed.toString(2),
    oct: parsed.toString(8),
    dec: parsed.toString(10),
    hex: parsed.toString(16).toUpperCase(),
  };
}

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

export function calculateAspectRatio(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return { ratioStr: '1:1', ratioDecimal: 1, wRatio: 1, hRatio: 1 };
  }
  const divisor = gcd(Math.round(width), Math.round(height));
  const wRatio = Math.round(width) / divisor;
  const hRatio = Math.round(height) / divisor;
  return {
    ratioStr: `${wRatio}:${hRatio}`,
    ratioDecimal: width / height,
    wRatio,
    hRatio,
  };
}

export function calculatePPI(widthPx: number, heightPx: number, diagonalInches: number): number {
  if (diagonalInches <= 0) return 0;
  const diagonalPx = Math.sqrt(Math.pow(widthPx, 2) + Math.pow(heightPx, 2));
  return Math.round((diagonalPx / diagonalInches) * 100) / 100;
}

export interface GPACourse {
  name: string;
  gradePoint: number;
  credits: number;
}

export function calculateGPA(courses: GPACourse[]): { totalCredits: number; gpa: number; gradePoints: number } {
  let totalCredits = 0;
  let totalPoints = 0;

  for (const c of courses) {
    if (c.credits > 0) {
      totalCredits += c.credits;
      totalPoints += c.gradePoint * c.credits;
    }
  }

  const gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  return { totalCredits, gpa, gradePoints: totalPoints };
}
