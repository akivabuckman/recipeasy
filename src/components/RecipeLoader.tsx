import CircularProgress from '@mui/material/CircularProgress';

export default function RecipeLoader() {
  return (
    <div className="mt-16 flex flex-col items-center gap-5">
      <CircularProgress aria-label="Loading…" />
      <p className="text-zinc-400 dark:text-zinc-500 text-sm">Cooking up your recipe...</p>
    </div>
  );
}
