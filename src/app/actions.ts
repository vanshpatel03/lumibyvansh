
'use server';

import { adaptPersona } from '@/ai/flows/persona-adaption';
import { generateExpressiveSuggestions } from '@/ai/flows/expressive-ui';
import { getStripe } from '@/lib/stripe';
import { headers } from 'next/headers';

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

export async function createStripeCheckoutSession(): Promise<{ url: string | null; error?: string }> {
  const headersList = headers();
  const origin = headersList.get('origin');
  const stripe = getStripe();

  if (!origin) {
    return { url: null, error: 'Could not determine origin' };
  }
  
  if (!stripe) {
     return { url: null, error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Lumi Pro',
              description: 'Unlock the most powerful models and features.',
            },
            unit_amount: 999, // $9.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    return { url: null, error: 'Could not create checkout session' };
  }
}
