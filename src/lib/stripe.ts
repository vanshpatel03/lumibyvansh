import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (process.env.STRIPE_SECRET_KEY) {
    if (!stripe) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
        typescript: true,
      });
    }
    return stripe;
  }
  return null;
}
