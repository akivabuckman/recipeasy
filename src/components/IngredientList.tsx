import { useEffect, useRef, useState } from 'react';
import type { IngredientDetail } from '../types';
import { convertCount, formatCount, getConvertibleUnits, normalizeUnit } from '../units';

interface IngredientListProps {
  baseIngredients: Record<string, IngredientDetail>;
  scaleFactor: number;
  onScaleChange: (newScale: number) => void;
  unitOverrides: Record<string, string>;
  onUnitChange: (name: string, newUnit: string) => void;
  onReset: () => void;
  checkedIngredients: Set<string>;
  onToggleIngredient: (name: string) => void;
}

interface IngredientRowProps {
  name: string;
  baseDetail: IngredientDetail;
  scaleFactor: number;
  onScaleChange: (newScale: number) => void;
  unitOverride: string | null;
  onUnitChange: (name: string, newUnit: string) => void;
  checked: boolean;
  onToggle: () => void;
}

function IngredientRow({
  name,
  baseDetail,
  scaleFactor,
  onScaleChange,
  unitOverride,
  onUnitChange,
  checked,
  onToggle,
}: IngredientRowProps) {
  const normalizedBase = baseDetail.unit ? normalizeUnit(baseDetail.unit) : null;
  const currentUnit = unitOverride ?? normalizedBase;
  const availableUnits = baseDetail.unit ? getConvertibleUnits(baseDetail.unit) : null;

  const displayCount = (() => {
    if (baseDetail.count == null) return null;
    const scaled = baseDetail.count * scaleFactor;
    if (!normalizedBase || !currentUnit || normalizedBase === currentUnit) return scaled;
    return convertCount(scaled, normalizedBase, currentUnit);
  })();

  const [inputValue, setInputValue] = useState<string>(
    displayCount != null ? formatCount(displayCount) : ''
  );
  const isFocusedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isFocusedRef.current && displayCount != null) {
      setInputValue(formatCount(displayCount));
    }
  }, [displayCount]);

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0 && baseDetail.count != null && baseDetail.count > 0) {
      const baseInCurrentUnit =
        normalizedBase && currentUnit && normalizedBase !== currentUnit
          ? convertCount(baseDetail.count, normalizedBase, currentUnit)
          : baseDetail.count;
      onScaleChange(num / baseInCurrentUnit);
    }
  };

  return (
    <li className={`flex items-center gap-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 last:border-0 ${checked ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-4 h-4 shrink-0 accent-green-500 cursor-pointer"
      />
      <span className={`flex-1 text-sm capitalize ${checked ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
        {name}
      </span>
      <div className="flex items-center shrink-0">
        <div className="w-20">
          {baseDetail.count != null && (
            <input
              type="number"
              value={inputValue}
              onChange={handleCountChange}
              onFocus={() => { isFocusedRef.current = true; }}
              onBlur={() => { isFocusedRef.current = false; }}
              min={0}
              step="any"
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm text-right text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          )}
        </div>
        <div className="w-20 ml-1.5">
          {availableUnits ? (
            <select
              value={currentUnit ?? ''}
              onChange={(e) => onUnitChange(name, e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-1.5 py-1 text-sm text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            >
              {availableUnits.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          ) : baseDetail.unit ? (
            <span className="block text-sm text-zinc-500 dark:text-zinc-400 pl-1">{baseDetail.unit}</span>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function IngredientList({
  baseIngredients,
  scaleFactor,
  onScaleChange,
  unitOverrides,
  onUnitChange,
  onReset,
  checkedIngredients,
  onToggleIngredient,
}: IngredientListProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">🥕 Ingredients</h2>
        <button
          onClick={onReset}
          className="border border-zinc-300 dark:border-zinc-700 px-2 py-1 rounded text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          Reset quantites
        </button>
      </div>
      <ul className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-4">
        {Object.entries(baseIngredients).map(([name, detail]) => (
          <IngredientRow
            key={name}
            name={name}
            baseDetail={detail}
            scaleFactor={scaleFactor}
            onScaleChange={onScaleChange}
            unitOverride={unitOverrides[name] ?? null}
            onUnitChange={onUnitChange}
            checked={checkedIngredients.has(name)}
            onToggle={() => onToggleIngredient(name)}
          />
        ))}
      </ul>
    </section>
  );
}
