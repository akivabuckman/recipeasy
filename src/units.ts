const UNIT_ALIASES: Record<string, string> = {
  gr: 'g',
  gram: 'g',
  grams: 'g',
  kilogram: 'kg',
  kilograms: 'kg',
  ounce: 'oz',
  ounces: 'oz',
  pound: 'lb',
  pounds: 'lb',
  liter: 'l',
  litre: 'l',
  liters: 'l',
  litres: 'l',
  milliliter: 'ml',
  millilitre: 'ml',
  milliliters: 'ml',
  millilitres: 'ml',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  cups: 'cup',
};

export const WEIGHT_UNITS: string[] = ['g', 'kg', 'oz', 'lb'];
export const VOLUME_UNITS: string[] = ['ml', 'l', 'tsp', 'tbsp', 'cup', 'fl oz'];

const WEIGHT_TO_G: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 236.588,
  'fl oz': 29.5735,
};

export function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase().trim();
  return UNIT_ALIASES[lower] ?? lower;
}

export function getConvertibleUnits(unit: string): string[] | null {
  const norm = normalizeUnit(unit);
  if (WEIGHT_TO_G[norm] !== undefined) return WEIGHT_UNITS;
  if (VOLUME_TO_ML[norm] !== undefined) return VOLUME_UNITS;
  return null;
}

export function convertCount(count: number, fromUnit: string, toUnit: string): number {
  const normFrom = normalizeUnit(fromUnit);
  const normTo = normalizeUnit(toUnit);
  if (normFrom === normTo) return count;

  const fromG = WEIGHT_TO_G[normFrom];
  const toG = WEIGHT_TO_G[normTo];
  if (fromG !== undefined && toG !== undefined) {
    return (count * fromG) / toG;
  }

  const fromMl = VOLUME_TO_ML[normFrom];
  const toMl = VOLUME_TO_ML[normTo];
  if (fromMl !== undefined && toMl !== undefined) {
    return (count * fromMl) / toMl;
  }

  return count;
}

export function formatCount(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const decimals = n < 1 ? 3 : 2;
  return parseFloat(n.toFixed(decimals)).toString();
}
