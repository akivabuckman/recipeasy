import type { RecipeResponse } from '../types';
import IngredientList from './IngredientList';
import InstructionList from './InstructionList';

interface RecipeViewProps {
  baseRecipe: RecipeResponse;
  scaleFactor: number;
  onScaleChange: (newScale: number) => void;
  unitOverrides: Record<string, string>;
  onUnitChange: (name: string, newUnit: string) => void;
  onReset: () => void;
  checkedIngredients: Set<string>;
  checkedInstructions: Set<number>;
  onToggleIngredient: (name: string) => void;
  onToggleInstruction: (index: number) => void;
}

export default function RecipeView({
  baseRecipe,
  scaleFactor,
  onScaleChange,
  unitOverrides,
  onUnitChange,
  onReset,
  checkedIngredients,
  checkedInstructions,
  onToggleIngredient,
  onToggleInstruction,
}: RecipeViewProps) {
  return (
    <div className="mt-10 space-y-10">
      <IngredientList
        baseIngredients={baseRecipe.ingredients}
        scaleFactor={scaleFactor}
        onScaleChange={onScaleChange}
        unitOverrides={unitOverrides}
        onUnitChange={onUnitChange}
        onReset={onReset}
        checkedIngredients={checkedIngredients}
        onToggleIngredient={onToggleIngredient}
      />
      <InstructionList
        instructions={baseRecipe.instructions}
        checkedInstructions={checkedInstructions}
        onToggleInstruction={onToggleInstruction}
      />
    </div>
  );
}
