
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Stripe from 'stripe';

const GetCheckoutSessionInputSchema = z.object({
  sessionId: z.string(),
});

// Define a flexible output schema to hold whatever metadata we get
const GetCheckoutSessionOutputSchema = z.object({
  metadata: z.record(z.string()).nullable(),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

export async function getCheckoutSessionFlow(
  input: z.infer<typeof GetCheckoutSessionInputSchema>
): Promise<z.infer<typeof GetCheckoutSessionOutputSchema>> {
  if (!input.sessionId) {
    throw new Error('Session ID is required.');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
        expand: ['subscription'],
    });

    // The metadata is on the subscription object
    const subscription = session.subscription as Stripe.Subscription;

    if (!subscription || !subscription.metadata) {
        // Fallback to checking the session itself if subscription isn't there for some reason
        return { metadata: session.metadata ?? null };
    }
    
    return { metadata: subscription.metadata };
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw new Error('Could not retrieve checkout session data.');
  }
}

ai.defineFlow(
  {
    name: 'getCheckoutSessionFlow',
    inputSchema: GetCheckoutSessionInputSchema,
    outputSchema: GetCheckoutSessionOutputSchema,
  },
  getCheckoutSessionFlow
);
