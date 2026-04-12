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
    <div className="flex gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="https://example.com/recipe"
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
      />
      <button
        onClick={onSubmit}
        disabled={loading || !url.trim()}
        className="px-6 py-2.5 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Fetching...' : 'Fetch'}
      </button>
    </div>
  );
}
