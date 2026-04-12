export interface IngredientDetail {
  unit: string | null;
  count: number | null;
}

export interface RecipeResponse {
  ingredients: Record<string, IngredientDetail>;
  instructions: string[];
}
