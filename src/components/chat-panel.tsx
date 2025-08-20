import { useState, useRef, useEffect, type FormEvent } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, BrainCircuit } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { EmojiSuggestions } from './emoji-suggestions';
import type { Message } from '@/app/page';

type ChatPanelProps = {
  messages: Message[];
  isLoading: boolean;
  emojiSuggestions: string[];
  sendMessage: (message: string) => Promise<void>;
};

export function ChatPanel({
  messages,
  isLoading,
  emojiSuggestions,
  sendMessage,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setInput('');
    await sendMessage(input);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-l-2xl md:border-l">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <BrainCircuit className="h-5 w-5" />
                <span>LUMI is thinking...</span>
               </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-card/50">
        <EmojiSuggestions emojis={emojiSuggestions} onSelect={handleEmojiSelect} />
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to me..."
            rows={1}
            className="flex-1 resize-none bg-muted focus-visible:ring-1 focus-visible:ring-ring"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="rounded-full shrink-0"
          >
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
