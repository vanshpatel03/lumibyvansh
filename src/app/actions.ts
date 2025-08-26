
'use server';

import { adaptPersona } from '@/ai/flows/persona-adaption';
import { generateExpressiveSuggestions } from '@/ai/flows/expressive-ui';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { speechToText } from '@/ai/flows/speech-to-text';

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

export async function getAudioForText(text: string) {
  try {
    const result = await textToSpeech(text);
    return result;
  } catch (error) {
    console.error('Error in getAudioForText:', error);
    return { audioDataUri: '' };
  }
}

export async function getTextFromAudio(audioDataUri: string) {
  try {
    const result = await speechToText(audioDataUri);
    return result;
  } catch (error) {
    console.error('Error in getTextFromAudio:', error);
    return { transcript: '' };
  }
}
