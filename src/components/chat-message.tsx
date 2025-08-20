import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message } from '@/app/page';

export function ChatMessage({ message }: { message: Message }) {
  const isLumi = message.role === 'LUMI';
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
          'max-w-xs md:max-w-md lg:max-w-xl p-3 rounded-2xl shadow-sm',
          isLumi
            ? 'bg-muted rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
