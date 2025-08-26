
'use client';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecorder, RecordingStatus } from '@/hooks/use-voice-recorder';
import { cn } from '@/lib/utils';


type VoiceInputProps = {
    onTranscription: (text: string) => void;
    disabled: boolean;
};

export function VoiceInput({ onTranscription, disabled }: VoiceInputProps) {
    const { status, startRecording, stopRecording } = useVoiceRecorder(onTranscription);

    const handleToggleRecording = () => {
        if (status === 'recording') {
            stopRecording();
        } else {
            startRecording();
        }
    };
    
    const Icon = () => {
        switch (status) {
            case 'recording':
                return <Square className="text-destructive" />;
            case 'transcribing':
                return <Loader2 className="animate-spin" />;
            case 'error':
                 return <MicOff className="text-destructive" />;
            default:
                return <Mic />;
        }
    }

    return (
        <Button
            type="button"
            size="icon"
            variant={status === 'recording' ? 'outline' : 'default'}
            onClick={handleToggleRecording}
            disabled={disabled || status === 'transcribing'}
            className={cn(
                "rounded-full shrink-0 aspect-square",
                 status === 'recording' && 'border-destructive text-destructive'
            )}
        >
            <Icon />
            <span className="sr-only">{status === 'recording' ? 'Stop recording' : 'Start recording'}</span>
        </Button>
    );
}

