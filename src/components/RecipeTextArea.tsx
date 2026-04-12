interface RecipeTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  submitted: boolean;
}

export default function RecipeTextArea({ value, onChange, onSubmit, loading, submitted }: RecipeTextAreaProps) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste recipe text here..."
        rows={4}
        className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 resize-y"
      />
      <button
        onClick={onSubmit}
        disabled={loading || !value.trim() || submitted}
        className="mt-2 w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '✨ Doing AI stuff...' : 'Convert! 🪄'}
      </button>
    </div>
  );
}
