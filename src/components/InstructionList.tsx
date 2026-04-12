interface InstructionListProps {
  instructions: string[];
  checkedInstructions: Set<number>;
  onToggleInstruction: (index: number) => void;
}

interface InstructionItemProps {
  index: number;
  text: string;
  checked: boolean;
  onToggle: () => void;
}

function InstructionItem({ index, text, checked, onToggle }: InstructionItemProps) {
  return (
    <li className={`flex gap-3 py-3 border-b border-zinc-200 dark:border-zinc-800 last:border-0 ${checked ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-4 h-4 mt-0.5 shrink-0 accent-green-500 cursor-pointer"
      />
      <span className="text-green-500 font-semibold text-sm shrink-0 mt-0.5 w-5 text-right">{index + 1}.</span>
      <span className={`text-sm leading-relaxed ${checked ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-200'}`}>
        {text}
      </span>
    </li>
  );
}

export default function InstructionList({ instructions, checkedInstructions, onToggleInstruction }: InstructionListProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">👨‍🍳 Instructions</h2>
      {instructions.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No instructions were found in this recipe.</p>
      ) : (
        <ol className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-4">
          {instructions.map((text, index) => (
            <InstructionItem
              key={index}
              index={index}
              text={text}
              checked={checkedInstructions.has(index)}
              onToggle={() => onToggleInstruction(index)}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
