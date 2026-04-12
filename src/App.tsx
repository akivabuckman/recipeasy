import { useState } from 'react';
import './App.css';
import type { RecipeResponse } from './types';
import UrlForm from './components/UrlForm';
import RecipeTextArea from './components/RecipeTextArea';
import RecipeView from './components/RecipeView';

const API_URL = 'https://mypxpcpfw8.execute-api.ap-southeast-1.amazonaws.com/prod/scrape';

export default function App() {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [baseRecipe, setBaseRecipe] = useState<RecipeResponse | null>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedInstructions, setCheckedInstructions] = useState<Set<number>>(new Set());
  const [recipeText, setRecipeText] = useState<string>('');

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setBaseRecipe(null);
    setScaleFactor(1);
    setCheckedIngredients(new Set());
    setCheckedInstructions(new Set());

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json() as RecipeResponse | { error: string };
      if (!res.ok) {
        setError(('error' in data) ? data.error : 'An unexpected error occurred.');
      } else {
        setBaseRecipe(data as RecipeResponse);
      }
    } catch {
      setError('Failed to connect to the server. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientChange = (name: string, newCount: number) => {
    if (!baseRecipe) return;
    const baseCount = baseRecipe.ingredients[name]?.count;
    if (baseCount == null || baseCount === 0) return;
    setScaleFactor(newCount / baseCount);
  };

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleInstruction = (index: number) => {
    setCheckedInstructions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Recipeasy</h1>
        <UrlForm
          url={url}
          onUrlChange={setUrl}
          onSubmit={handleSubmit}
          loading={loading}
        />
        <RecipeTextArea value={recipeText} onChange={setRecipeText} />
        {error && (
          <div className="mt-4 p-4 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        {baseRecipe && (
          <RecipeView
            baseRecipe={baseRecipe}
            scaleFactor={scaleFactor}
            onIngredientChange={handleIngredientChange}
            checkedIngredients={checkedIngredients}
            checkedInstructions={checkedInstructions}
            onToggleIngredient={toggleIngredient}
            onToggleInstruction={toggleInstruction}
          />
        )}
      </div>
    </div>
  );
}
