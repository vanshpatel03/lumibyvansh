'use server';

/**
 * @fileOverview An AI agent that generates emoji/image suggestions based on the chatbot's emotional state.
 *
 * - generateExpressiveSuggestions - A function that handles the generation of emoji/image suggestions.
 * - ExpressiveSuggestionsInput - The input type for the generateExpressiveSuggestions function.
 * - ExpressiveSuggestionsOutput - The return type for the generateExpressiveSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpressiveSuggestionsInputSchema = z.object({
  emotionalState: z
    .string()
    .describe("The current emotional state of the chatbot (e.g., joy, sadness, anger)."),
});
export type ExpressiveSuggestionsInput = z.infer<typeof ExpressiveSuggestionsInputSchema>;

const ExpressiveSuggestionsOutputSchema = z.object({
  emojiSuggestions: z.array(z.string()).describe("An array of emoji suggestions that reflect the chatbot's emotional state."),
  imageSuggestion: z
    .string()
    .optional()
    .describe("A data URI of an image suggestion that reflects the chatbot's emotional state."),
});
export type ExpressiveSuggestionsOutput = z.infer<typeof ExpressiveSuggestionsOutputSchema>;

export async function generateExpressiveSuggestions(
  input: ExpressiveSuggestionsInput
): Promise<ExpressiveSuggestionsOutput> {
  return expressiveSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'expressiveSuggestionsPrompt',
  input: {schema: ExpressiveSuggestionsInputSchema},
  output: {schema: ExpressiveSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides emoji and image suggestions based on the current emotional state of a chatbot.

  The current emotional state is: {{{emotionalState}}}

  Suggest 3-5 relevant emojis that reflect this emotional state.

  Optionally, suggest a single relevant image as a data URI (if appropriate for the emotional state). Focus on generating images only if user asks for it.

  Return the emoji suggestions as an array of strings and the image suggestion as a data URI string (or null if no image is suggested).`,
});

const expressiveSuggestionsFlow = ai.defineFlow(
  {
    name: 'expressiveSuggestionsFlow',
    inputSchema: ExpressiveSuggestionsInputSchema,
    outputSchema: ExpressiveSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
