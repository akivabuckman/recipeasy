import type { RecipeResponse } from '../types';
import IngredientList from './IngredientList';
import InstructionList from './InstructionList';

interface RecipeViewProps {
  baseRecipe: RecipeResponse;
  scaleFactor: number;
  onIngredientChange: (name: string, newCount: number) => void;
  checkedIngredients: Set<string>;
  checkedInstructions: Set<number>;
  onToggleIngredient: (name: string) => void;
  onToggleInstruction: (index: number) => void;
}

export default function RecipeView({
  baseRecipe,
  scaleFactor,
  onIngredientChange,
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
        onIngredientChange={onIngredientChange}
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
