
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, BrainCircuit, ArrowLeft } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { EmojiSuggestions } from './emoji-suggestions';
import type { Message } from '@/app/page';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const models = [
  'Vansh Meta',
  'Vansh Prime',
  'Vansh Ultra',
  'Vansh Phantom',
];

type ChatPanelProps = {
  messages: Message[];
  isLoading: boolean;
  emojiSuggestions: string[];
  sendMessage: (message: string) => Promise<void>;
  persona: string;
  model: string;
  onBack: () => void;
  onModelChange: (model: string) => void;
};

export function ChatPanel({
  messages,
  isLoading,
  emojiSuggestions,
  sendMessage,
  persona,
  model,
  onBack,
  onModelChange,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        });
      }
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
    <div className="flex flex-col h-full bg-background">
      <header className="p-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft />
            </Button>
            <div>
              <h2 className="text-xl font-bold font-headline">{persona}</h2>
              <p className="text-sm text-muted-foreground">Chatting with {model}</p>
            </div>
          </div>
      </header>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4">
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
      <div className="p-4 border-t bg-card/50 shrink-0">
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
           <Select value={model} onValueChange={onModelChange} disabled={isLoading}>
            <SelectTrigger className="w-auto sm:w-[150px] shrink-0">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((modelName) => (
                <SelectItem key={modelName} value={modelName}>
                  {modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
         <footer className="pt-2 text-center text-xs text-muted-foreground">
          powered by vansh rabadiya
        </footer>
      </div>
    </div>
  );
}
