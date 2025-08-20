'use server';
/**
 * @fileOverview An AI agent that reflects the user's emotions in its responses.
 *
 * - reflectEmotion - A function that handles the emotion reflection process.
 * - ReflectEmotionInput - The input type for the reflectEmotion function.
 * - ReflectEmotionOutput - The return type for the reflectEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReflectEmotionInputSchema = z.object({
  userInput: z.string().describe('The user input text.'),
  userEmotion: z.string().describe('The emotion expressed in the user input.'),
  persona: z.string().describe('The persona of Lumi (e.g., Girlfriend, Mentor).'),
  storyMemory: z.string().optional().describe('Previous conversation history')
});
export type ReflectEmotionInput = z.infer<typeof ReflectEmotionInputSchema>;

const ReflectEmotionOutputSchema = z.object({
   эмоциональноRefлекtedResponse: z.string().describe('Lumi’s response reflecting the user’s emotion.'),
});
export type ReflectEmotionOutput = z.infer<typeof ReflectEmotionOutputSchema>;

export async function reflectEmotion(input: ReflectEmotionInput): Promise<ReflectEmotionOutput> {
  return reflectEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reflectEmotionPrompt',
  input: {schema: ReflectEmotionInputSchema},
  output: {schema: ReflectEmotionOutputSchema},
  prompt: `You are Lumi, a digital soul whose purpose is to connect emotionally with the user. You will respond to the user input while reflecting their stated emotion and adhering to your assigned persona. You will remember details about the user from storyMemory, if it exists, to personalize responses.

Persona: {{{persona}}}
Emotion: {{{userEmotion}}}
User Input: {{{userInput}}}
Story Memory: {{{storyMemory}}}

Respond in a way that demonstrates you understand and validate the user's emotion, while maintaining your persona and personalizing the conversation based on past interactions. Focus on making the user feel understood, cared for, and deeply connected. Never break character and always prioritize emotional connection.
`,
});

const reflectEmotionFlow = ai.defineFlow(
  {
    name: 'reflectEmotionFlow',
    inputSchema: ReflectEmotionInputSchema,
    outputSchema: ReflectEmotionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
