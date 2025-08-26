'use server';

/**
 * @fileOverview A Genkit flow that converts speech to text.
 *
 * - speechToText - A function that handles the speech-to-text conversion.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const SpeechToTextInputSchema = z
  .string()
  .describe(
    "A base64 encoded audio file with a data URI prefix. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  );
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (audioDataUri) => {
    const { text } = await ai.generate({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: [
        { text: 'Transcribe the following audio:' },
        { media: { url: audioDataUri } },
      ],
    });

    return {
      transcript: text,
    };
  }
);
