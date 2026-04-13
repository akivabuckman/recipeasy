import './App.css';
import { useDarkMode } from './hooks/useDarkMode';
import { useRecipe } from './hooks/useRecipe';
import UrlForm from './components/UrlForm';
import RecipeTextArea from './components/RecipeTextArea';
import RecipeView from './components/RecipeView';
import RecipeLoader from './components/RecipeLoader';
import DarkModeToggle from './components/DarkModeToggle';

export default function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const {
    url, setUrl, urlSubmitted, setUrlSubmitted,
    loading, error, errorFromUrl,
    baseRecipe, scaleFactor, setScaleFactor,
    unitOverrides, checkedIngredients, checkedInstructions,
    recipeText, setRecipeText, textSubmitted, setTextSubmitted,
    recipeRef,
    handleSubmit, handleConvert, handleUnitChange, handleReset,
    toggleIngredient, toggleInstruction,
  } = useRecipe();

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white flex flex-col">
      <div className="max-w-3xl w-full mx-auto px-4 py-24 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">Recipeasy</span>
          </h1>
          <DarkModeToggle isDark={isDark} onToggle={toggleDark} />
        </div>
        <p className="mb-4 text-zinc-500 dark:text-zinc-400">Yay! Now any recipe from any website can be super easy to use!</p>
        <p className="mb-4 text-zinc-500 dark:text-zinc-400">Enter a URL or paste recipe text below:</p>
        <UrlForm
          url={url}
          onUrlChange={(val) => { setUrl(val); setUrlSubmitted(false); }}
          onSubmit={handleSubmit}
          loading={loading}
          submitted={urlSubmitted}
        />
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-700" />
          <span className="text-zinc-400 dark:text-zinc-500 text-sm">or</span>
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <RecipeTextArea
          value={recipeText}
          onChange={(val) => { setRecipeText(val); setTextSubmitted(false); }}
          onSubmit={handleConvert}
          loading={loading}
          submitted={textSubmitted}
        />
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg text-sm space-y-2">
            <p className="text-red-600 dark:text-red-300">{error}</p>
            {errorFromUrl && (
              <p className="text-zinc-600 dark:text-zinc-400">
                <strong>Tip:</strong> Try going to the recipe page, selecting all the text, copying it, and pasting it into the box above instead.
              </p>
            )}
          </div>
        )}
        {loading && <RecipeLoader />}
        {!loading && baseRecipe && (
          <RecipeView
            ref={recipeRef}
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
      <footer className="text-center text-zinc-200 text-xs py-2 px-4 bg-gradient-to-r from-blue-900 via-orange-900 to-blue-900 border-t border-zinc-600 select-none pointer-events-none tracking-wide">
        Everything here was made by yours truly — frontend, backend, CI, and AWS. See more projects at{' '}
        <a
          href="https://akivabuckman.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white pointer-events-auto"
        >
          akivabuckman.com
        </a>
      </footer>
    </div>
  );
}
