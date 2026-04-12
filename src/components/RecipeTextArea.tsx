interface RecipeTextAreaProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RecipeTextArea({ value, onChange }: RecipeTextAreaProps) {
  return (
    <div className="mt-4">
      <label className="block text-sm text-zinc-400 mb-1.5">Or paste recipe text</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste recipe text here..."
        rows={4}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-y"
      />
    </div>
  );
}
