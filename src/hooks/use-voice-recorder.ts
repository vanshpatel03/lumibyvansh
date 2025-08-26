
'use client';
import { useState, useRef, useCallback } from 'react';
import { getTextFromAudio } from '@/app/actions';
import { useToast } from './use-toast';

export type RecordingStatus = 'idle' | 'recording' | 'transcribing' | 'error';

export function useVoiceRecorder(
    onTranscriptionComplete: (transcript: string) => void
) {
    const [status, setStatus] = useState<RecordingStatus>('idle');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const { toast } = useToast();

    const startRecording = useCallback(async () => {
        if (status !== 'idle') return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                setStatus('transcribing');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    try {
                        const { transcript } = await getTextFromAudio(base64Audio);
                        if (transcript) {
                            onTranscriptionComplete(transcript);
                        } else {
                            toast({ variant: 'destructive', title: 'Transcription failed', description: 'Could not understand the audio. Please try again.' });
                        }
                    } catch (error) {
                        console.error('Transcription error:', error);
                        toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during transcription.' });
                        setStatus('error');
                    } finally {
                        setStatus('idle');
                    }
                };
            };

            mediaRecorderRef.current.start();
            setStatus('recording');
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast({ variant: 'destructive', title: 'Microphone access denied', description: 'Please allow microphone access in your browser settings.' });
            setStatus('error');
        }
    }, [status, onTranscriptionComplete, toast]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && status === 'recording') {
            mediaRecorderRef.current.stop();
            // Stop all media tracks to turn off the microphone indicator
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    }, [status]);

    return { status, startRecording, stopRecording };
}
