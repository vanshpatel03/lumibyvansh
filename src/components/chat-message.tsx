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
    
    // If we have audio and it's paused, play it.
    if (audio && audio.paused) {
      audio.play();
      return;
    }

    // If we are already playing, do nothing
    if (audio && !audio.paused) {
      // Optional: Or maybe pause it? For now, do nothing.
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
        'flex items-start gap-3',
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
          'max-w-xs md:max-w-md lg:max-w-xl p-3 rounded-2xl shadow-sm group relative',
          isLumi
            ? 'bg-muted rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
         {isLumi && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute -right-11 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePlayAudio}
              disabled={audioState === 'loading'}
            >
              <AudioIcon />
            </Button>
          )}
      </div>
       {!isLumi && (
        <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-muted-foreground/50 text-background">
                U
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
