import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2 } from 'lucide-react';
import type { Message } from '@/app/page';
import { getAudioForText } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function ChatMessage({ message }: { message: Message }) {
  const isLumi = message.role === 'LUMI';
  const { toast } = useToast();
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlayAudio = async () => {
    if (audioState === 'loading') return;
    
    if (audio && audio.paused) {
      audio.play();
      return;
    }

    if (audio && !audio.paused) {
      return;
    }

    setAudioState('loading');
    try {
      const result = await getAudioForText(message.content);
      if (result && result.audioDataUri) {
        const newAudio = new Audio(result.audioDataUri);
        setAudio(newAudio);
        
        newAudio.onplay = () => setAudioState('playing');
        newAudio.onended = () => setAudioState('idle');
        newAudio.onpause = () => setAudioState('idle');
        newAudio.onerror = () => {
          setAudioState('error');
          toast({ variant: 'destructive', title: 'Error playing audio.' });
        };
        newAudio.play();
      } else {
        setAudioState('error');
        toast({ variant: 'destructive', title: 'Could not generate audio.' });
      }
    } catch (err) {
      setAudioState('error');
      toast({ variant: 'destructive', title: 'Failed to fetch audio.' });
      console.error(err);
    }
  };

  const AudioIcon = () => {
    switch (audioState) {
      case 'loading':
        return <Loader2 className="animate-spin" />;
      case 'playing':
        return <Volume2 className="text-primary" />;
      case 'error':
        return <Volume2 className="text-destructive" />;
      default:
        return <Volume2 />;
    }
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 w-full',
        isLumi ? 'justify-start' : 'justify-end'
      )}
    >
      {isLumi && (
        <Avatar className="h-9 w-9 border-2 border-primary">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
            L
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-xs md:max-w-md lg:max-w-xl p-3 rounded-2xl shadow-sm relative',
          isLumi
            ? 'bg-muted rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
       {isLumi && (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity self-center"
          onClick={handlePlayAudio}
          disabled={audioState === 'loading'}
        >
          <AudioIcon />
        </Button>
      )}
       {!isLumi && (
         <div className="flex items-center">
            <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-muted-foreground/50 text-background">
                    U
                </AvatarFallback>
            </Avatar>
        </div>
      )}
    </div>
  );
}
