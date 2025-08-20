import { Button } from '@/components/ui/button';

type EmojiSuggestionsProps = {
  emojis: string[];
  onSelect: (emoji: string) => void;
};

export function EmojiSuggestions({ emojis, onSelect }: EmojiSuggestionsProps) {
  if (!emojis || emojis.length === 0) {
    return null;
  }

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {emojis.map((emoji, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="rounded-full text-lg"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}
