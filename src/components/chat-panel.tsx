
import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, BrainCircuit, ArrowLeft, Sparkles } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { EmojiSuggestions } from './emoji-suggestions';
import type { Message } from '@/app/page';
import { cn } from '@/lib/utils';
import { AuthButton } from './auth-button';


const models = [
  'Vansh Meta',
  'Vansh Prime',
];

const proModels = [
  'Vansh Spectre',
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
  remainingMessages: number;
  trialMessageLimit: number;
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
  remainingMessages,
  trialMessageLimit,
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

  const ModelSelector = () => (
    <Select onValueChange={onModelChange} value={model}>
        <SelectTrigger className="w-auto h-auto px-3 py-1 text-xs sm:text-sm sm:h-10 sm:px-3 sm:py-2 md:w-[150px] shrink-0 border-2 border-primary/50 font-semibold">
          <SelectValue>Select Model</SelectValue>
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectLabel>Standard Models</SelectLabel>
                {models.map((modelName) => (
                    <SelectItem key={modelName} value={modelName}>
                        {modelName}
                    </SelectItem>
                ))}
            </SelectGroup>
            <SelectGroup>
                <SelectLabel>Lumi Pro Models</SelectLabel>
                {proModels.map((modelName) => (
                   <SelectItem key={modelName} value={modelName}>
                     <div className="flex items-center justify-between w-full">
                       <span>{modelName}</span>
                       {!isSubscribed && <span className="text-xs bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-full ml-2">PRO</span>}
                     </div>
                   </SelectItem>
                ))}
            </SelectGroup>
        </SelectContent>
    </Select>
  );

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
          <div className="flex items-center gap-2">
            <ModelSelector />
            <AuthButton />
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
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
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
            className="rounded-full shrink-0 aspect-square"
          >
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
         <footer className="pt-2 text-center text-xs text-muted-foreground">
           {!isSubscribed && remainingMessages <= trialMessageLimit && remainingMessages > 0 && (
            <p>You have {remainingMessages} messages left in your trial.</p>
           )}
            {!isSubscribed && remainingMessages <= 0 && (
                <p>Your trial has ended. Please upgrade to continue.</p>
            )}
           <p className="mt-1">made by vansh rabadiya</p>
        </footer>
      </div>
    </div>
  );
}
