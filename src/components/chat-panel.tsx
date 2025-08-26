
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
import { SendHorizonal, BrainCircuit, ArrowLeft, Sparkles, Paperclip, X } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { EmojiSuggestions } from './emoji-suggestions';
import type { Message } from '@/app/page';
import { cn } from '@/lib/utils';
import { AuthButton } from './auth-button';
import { VoiceInput } from './voice-input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';


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
  sendMessage: (message: string, attachment?: { url: string; type: string; }) => Promise<void>;
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
  const [attachment, setAttachment] = useState<{ url: string; type: string; file: File } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please select a file smaller than 5MB.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAttachment({ url: dataUrl, type: file.type, file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || isLoading) return;
    
    const currentInput = input;
    const currentAttachment = attachment;
    
    setInput('');
    setAttachment(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    await sendMessage(currentInput, currentAttachment ? { url: currentAttachment.url, type: currentAttachment.type } : undefined);
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
  
  const handleTranscription = (transcript: string) => {
    setInput(prev => prev + transcript);
  }

  const ModelSelector = () => (
    <Select onValueChange={onModelChange} value={model}>
        <SelectTrigger className="w-full shrink-0 border-2 border-primary/50 font-semibold">
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
        {attachment && (
          <div className="relative w-24 h-24 mb-2 rounded-md overflow-hidden border">
            {attachment.type.startsWith('image/') ? (
              <Image src={attachment.url} alt="Attachment preview" layout="fill" objectFit="cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-muted p-2 text-center">
                <Paperclip className="w-6 h-6" />
                <span className="text-xs mt-1 truncate">{attachment.file.name}</span>
              </div>
            )}
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-0 right-0 h-6 w-6 rounded-full"
              onClick={() => {
                setAttachment(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col items-start gap-2">
           <div className="flex w-full items-start gap-2">
              <input type="file" ref={fileInputRef} onChange={handleAttachmentChange} className="hidden" accept="image/*,application/pdf,.doc,.docx,.txt" />
              {isSubscribed && (
                  <Button type="button" size="icon" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="self-end">
                      <Paperclip />
                      <span className="sr-only">Attach file</span>
                  </Button>
              )}
             <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Talk to me..."
                rows={1}
                className="flex-1 resize-none bg-muted focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isLoading}
              />
              <VoiceInput onTranscription={handleTranscription} disabled={isLoading} />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || (!input.trim() && !attachment)}
                className="rounded-full shrink-0 aspect-square self-end"
              >
                <SendHorizonal className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
           </div>
           <div className="w-full">
             <ModelSelector />
           </div>
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
