
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, BrainCircuit, ArrowLeft, Sparkles } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { EmojiSuggestions } from './emoji-suggestions';
import type { Message } from '@/app/page';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';


const models = [
  'Vansh Meta',
  'Vansh Prime',
];

const proModels = [
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
  isSubscribed: boolean;
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
  isSubscribed,
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
              <p className={cn("text-sm flex items-center gap-1.5", isSubscribed ? "text-primary font-semibold" : "text-muted-foreground")}>
                {isSubscribed && <Sparkles className="w-4 h-4 text-primary" />}
                {model}
              </p>
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
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Select Model
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Standard Models</DropdownMenuLabel>
              {models.map((modelName) => (
                <DropdownMenuItem key={modelName} onSelect={() => onModelChange(modelName)} disabled={model === modelName}>
                  {modelName}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2">
                <Sparkles className="text-primary" /> Lumi Pro Models
              </DropdownMenuLabel>
              {proModels.map((modelName) => (
                <DropdownMenuItem key={modelName} onSelect={() => onModelChange(modelName)} disabled={model === modelName}>
                  <span className="flex-1">{modelName}</span>
                  {!isSubscribed && <span className="text-xs bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-full">PRO</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
         <footer className="pt-2 text-center text-sm text-muted-foreground">
          made by vansh rabadiya
        </footer>
      </div>
    </div>
  );
}
