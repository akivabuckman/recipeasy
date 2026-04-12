import { useEffect, useRef, useState } from 'react';
import type { RecipeResponse } from '../types';
import { API_URL } from '../constants';

export function useRecipe() {
  const [url, setUrl] = useState<string>('');
  const [urlSubmitted, setUrlSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorFromUrl, setErrorFromUrl] = useState<boolean>(false);
  const [baseRecipe, setBaseRecipe] = useState<RecipeResponse | null>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [unitOverrides, setUnitOverrides] = useState<Record<string, string>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedInstructions, setCheckedInstructions] = useState<Set<number>>(new Set());
  const [recipeText, setRecipeText] = useState<string>('');
  const [textSubmitted, setTextSubmitted] = useState<boolean>(false);
  const recipeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && baseRecipe && recipeRef.current) {
      recipeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, baseRecipe]);

  const resetState = () => {
    setError(null);
    setErrorFromUrl(false);
    setBaseRecipe(null);
    setScaleFactor(1);
    setUnitOverrides({});
    setCheckedIngredients(new Set());
    setCheckedInstructions(new Set());
  };

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setUrlSubmitted(true);
    setLoading(true);
    resetState();
    setRecipeText('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'scrape', url: url.trim() }),
      });
      const data = await res.json() as RecipeResponse | { error: string };

      if (!res.ok) {
        setError("We couldn't read the recipe from that page. Some websites block this kind of access.");
        setErrorFromUrl(true);
        setUrlSubmitted(false);
      } else {
        setBaseRecipe(data as RecipeResponse);
      }
    } catch {
      setError("Couldn't reach the server — check your internet connection and try again.");
      setErrorFromUrl(true);
      setUrlSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!recipeText.trim()) return;
    setTextSubmitted(true);
    setLoading(true);
    resetState();
    setUrl('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'convert', recipe: recipeText.trim() }),
      });
      const data = await res.json() as RecipeResponse | { error: string };
      if (!res.ok) {
        setError("Something went wrong while processing your recipe. Make sure it contains ingredients and instructions, then try again.");
        setTextSubmitted(false);
      } else {
        setBaseRecipe(data as RecipeResponse);
      }
    } catch {
      setError("Couldn't reach the server — check your internet connection and try again.");
      setTextSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = (name: string, newUnit: string) => {
    setUnitOverrides((prev) => ({ ...prev, [name]: newUnit }));
  };

  const handleReset = () => {
    setScaleFactor(1);
    setUnitOverrides({});
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

  return {
    url,
    setUrl,
    urlSubmitted,
    setUrlSubmitted,
    loading,
    error,
    errorFromUrl,
    baseRecipe,
    scaleFactor,
    setScaleFactor,
    unitOverrides,
    checkedIngredients,
    checkedInstructions,
    recipeText,
    setRecipeText,
    textSubmitted,
    setTextSubmitted,
    recipeRef,
    handleSubmit,
    handleConvert,
    handleUnitChange,
    handleReset,
    toggleIngredient,
    toggleInstruction,
  };
}
