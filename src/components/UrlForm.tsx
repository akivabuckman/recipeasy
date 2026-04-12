import { useState } from 'react';

interface UrlFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  loading: boolean;
  submitted: boolean;
}

function isValidUrl(val: string): boolean {
  if (!val.trim() || /\s/.test(val)) return false;
  const toTest = /^https?:\/\//i.test(val) ? val : `https://${val}`;
  try {
    return new URL(toTest).hostname.includes('.');
  } catch {
    return false;
  }
}

export default function UrlForm({ url, onUrlChange, onSubmit, loading, submitted }: UrlFormProps) {
  const [attempted, setAttempted] = useState<boolean>(false);

  const handleChange = (val: string) => {
    setAttempted(false);
    onUrlChange(val);
  };

  const handleSubmit = () => {
    setAttempted(true);
    if (isValidUrl(url)) onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const showError = attempted && url.length > 0 && !isValidUrl(url);

  return (
    <div className="flex flex-col gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="https://example.com/recipe"
        className={`w-full bg-zinc-100 dark:bg-zinc-800 border rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-colors ${
          showError
            ? 'border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-500'
            : 'border-zinc-300 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500'
        }`}
      />
      {showError && (
        <p className="text-red-500 dark:text-red-400 text-xs px-1">
          That doesn't look like a valid URL. Make sure it contains a domain (e.g. example.com) and has no spaces.
        </p>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || submitted}
        className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '✨ Doing AI stuff...' : 'Go! 🚀'}
      </button>
    </div>
  );
}
