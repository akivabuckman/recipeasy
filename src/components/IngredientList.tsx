import { useEffect, useRef, useState } from 'react';
import type { IngredientDetail } from '../types';

interface IngredientListProps {
  baseIngredients: Record<string, IngredientDetail>;
  scaleFactor: number;
  onIngredientChange: (name: string, newCount: number) => void;
  checkedIngredients: Set<string>;
  onToggleIngredient: (name: string) => void;
}

interface IngredientRowProps {
  name: string;
  baseDetail: IngredientDetail;
  scaleFactor: number;
  onChange: (name: string, newCount: number) => void;
  checked: boolean;
  onToggle: () => void;
}

function formatCount(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(2)).toString();
}

function IngredientRow({ name, baseDetail, scaleFactor, onChange, checked, onToggle }: IngredientRowProps) {
  const displayCount = baseDetail.count != null ? baseDetail.count * scaleFactor : null;
  const [inputValue, setInputValue] = useState<string>(
    displayCount != null ? formatCount(displayCount) : ''
  );
  const isFocusedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isFocusedRef.current && displayCount != null) {
      setInputValue(formatCount(displayCount));
    }
  }, [displayCount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) {
      onChange(name, num);
    }
  };

  return (
    <li className={`flex items-center gap-3 py-2.5 border-b border-zinc-800 last:border-0 ${checked ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-4 h-4 shrink-0 accent-white cursor-pointer"
      />
      <span className={`flex-1 text-sm capitalize ${checked ? 'line-through text-zinc-500' : 'text-white'}`}>
        {name}
      </span>
      <div className="flex items-center gap-1.5">
        {baseDetail.count != null && (
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            onFocus={() => { isFocusedRef.current = true; }}
            onBlur={() => { isFocusedRef.current = false; }}
            min={0}
            step="any"
            className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-right text-white focus:outline-none focus:border-zinc-500"
          />
        )}
        {baseDetail.unit && (
          <span className="text-sm text-zinc-400 w-10 shrink-0">{baseDetail.unit}</span>
        )}
      </div>
    </li>
  );
}

export default function IngredientList({
  baseIngredients,
  scaleFactor,
  onIngredientChange,
  checkedIngredients,
  onToggleIngredient,
}: IngredientListProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
      <ul className="bg-zinc-800/50 rounded-lg px-4">
        {Object.entries(baseIngredients).map(([name, detail]) => (
          <IngredientRow
            key={name}
            name={name}
            baseDetail={detail}
            scaleFactor={scaleFactor}
            onChange={onIngredientChange}
            checked={checkedIngredients.has(name)}
            onToggle={() => onToggleIngredient(name)}
          />
        ))}
      </ul>
    </section>
  );
}
