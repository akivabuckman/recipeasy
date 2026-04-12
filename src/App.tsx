import { useEffect, useState } from 'react';
import './App.css';
import type { RecipeResponse } from './types';
import UrlForm from './components/UrlForm';
import RecipeTextArea from './components/RecipeTextArea';
import RecipeView from './components/RecipeView';

const API_URL = 'https://mypxpcpfw8.execute-api.ap-southeast-1.amazonaws.com/prod/scrape';

const SKELETON_INGREDIENT_WIDTHS = ['w-2/5', 'w-3/5', 'w-1/2', 'w-2/3', 'w-3/4', 'w-2/5'];
const SKELETON_INSTRUCTION_WIDTHS = [['w-full', 'w-4/5'], ['w-full', 'w-3/5'], ['w-full', 'w-2/3']];

function RecipeSkeleton() {
  return (
    <div className="mt-10 space-y-10 animate-pulse">
      <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm">🍳 Cooking up your recipe...</p>
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 w-36 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <ul className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-4">
          {SKELETON_INGREDIENT_WIDTHS.map((w, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
              <div className="w-4 h-4 rounded bg-zinc-300 dark:bg-zinc-700 shrink-0" />
              <div className={`h-3.5 bg-zinc-300 dark:bg-zinc-700 rounded flex-1 ${w}`} />
              <div className="w-16 h-7 bg-zinc-300 dark:bg-zinc-700 rounded" />
              <div className="w-16 h-7 bg-zinc-300 dark:bg-zinc-700 rounded" />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-700 rounded mb-3" />
        <ol className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-4">
          {SKELETON_INSTRUCTION_WIDTHS.map((lines, i) => (
            <li key={i} className="flex gap-3 py-3 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
              <div className="w-4 h-4 mt-0.5 rounded bg-zinc-300 dark:bg-zinc-700 shrink-0" />
              <div className="w-5 h-4 mt-0.5 bg-zinc-300 dark:bg-zinc-700 rounded shrink-0" />
              <div className="flex-1 space-y-2">
                {lines.map((lw, j) => (
                  <div key={j} className={`h-3.5 bg-zinc-300 dark:bg-zinc-700 rounded ${lw}`} />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorFromUrl, setErrorFromUrl] = useState<boolean>(false);
  const [baseRecipe, setBaseRecipe] = useState<RecipeResponse | null>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [unitOverrides, setUnitOverrides] = useState<Record<string, string>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedInstructions, setCheckedInstructions] = useState<Set<number>>(new Set());
  const [recipeText, setRecipeText] = useState<string>('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

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
      } else {
        setBaseRecipe(data as RecipeResponse);
      }
    } catch {
      setError("Couldn't reach the server — check your internet connection and try again.");
      setErrorFromUrl(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!recipeText.trim()) return;
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
      } else {
        setBaseRecipe(data as RecipeResponse);
      }
    } catch {
      setError("Couldn't reach the server — check your internet connection and try again.");
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

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            🍳 <span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">Recipeasy</span>
          </h1>
          <button
            onClick={() => setIsDark((d) => !d)}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
            aria-label="Toggle light/dark mode"
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            )}
          </button>
        </div>
        <p className="mb-4 text-zinc-500 dark:text-zinc-400">🥳 Yay! Now any recipe from any website can be super easy to use!</p>
        <p className="mb-4 text-zinc-500 dark:text-zinc-400">Enter a URL 🔗 or paste recipe text 📋 below:</p>
        <UrlForm
          url={url}
          onUrlChange={setUrl}
          onSubmit={handleSubmit}
          loading={loading}
        />
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-700" />
          <span className="text-zinc-400 dark:text-zinc-500 text-sm">or</span>
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <RecipeTextArea
          value={recipeText}
          onChange={setRecipeText}
          onSubmit={handleConvert}
          loading={loading}
        />
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg text-sm space-y-2">
            <p className="text-red-600 dark:text-red-300">❌ {error}</p>
            {errorFromUrl && (
              <p className="text-zinc-600 dark:text-zinc-400">
                💡 <strong>Tip:</strong> Try going to the recipe page, selecting all the text, copying it, and pasting it into the box above instead.
              </p>
            )}
          </div>
        )}
        {loading && <RecipeSkeleton />}
        {!loading && baseRecipe && (
          <RecipeView
            baseRecipe={baseRecipe}
            scaleFactor={scaleFactor}
            onScaleChange={setScaleFactor}
            unitOverrides={unitOverrides}
            onUnitChange={handleUnitChange}
            onReset={handleReset}
            checkedIngredients={checkedIngredients}
            checkedInstructions={checkedInstructions}
            onToggleIngredient={toggleIngredient}
            onToggleInstruction={toggleInstruction}
          />
        )}
      </div>
      <footer className="fixed bottom-0 left-0 right-0 text-center text-zinc-200 text-xs py-2 px-4 bg-gradient-to-r from-blue-900 via-orange-900 to-blue-900 border-t border-zinc-600 select-none pointer-events-none tracking-wide">
        ✨ Everything here was made by yours truly — 🖥️ frontend, ⚙️ backend, 🚀 CI, and ☁️ AWS. See more projects at{' '}
        <a
          href="https://akivabuckman.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white pointer-events-auto"
        >
          akivabuckman.com
        </a>
        {' '}✨
      </footer>
    </div>
  );
}
