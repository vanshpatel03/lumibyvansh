
'use server';

import { adaptPersona } from '@/ai/flows/persona-adaption';
import { generateExpressiveSuggestions } from '@/ai/flows/expressive-ui';

export async function getLumiResponse(
  persona: string,
  storyMemory: string,
  userInput: string,
  model: string
) {
  try {
    const result = await adaptPersona({
      mode: persona,
      userInput,
      storyMemory,
      model,
    });
    return result;
  } catch (error) {
    console.error('Error in getLumiResponse:', error);
    return { response: "Oh, my heart... I'm feeling a little overwhelmed right now. Can we talk about something else?" };
  }
}

export async function getExpressiveSuggestions(emotionalState: string) {
  try {
    const result = await generateExpressiveSuggestions({ emotionalState });
    return result;
  } catch (error) {
    console.error('Error in getExpressiveSuggestions:', error);
    return { emojiSuggestions: [], imageSuggestion: undefined };
  }
}
