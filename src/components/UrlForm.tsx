interface UrlFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function UrlForm({ url, onUrlChange, onSubmit, loading }: UrlFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit();
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="https://example.com/recipe"
        className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
      />
      <button
        onClick={onSubmit}
        disabled={loading || !url.trim()}
        className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '✨ Doing AI stuff...' : 'Go! 🚀'}
      </button>
    </div>
  );
}
