
'use server';

/**
 * @fileoverview A flow for creating a Stripe checkout session.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Stripe from 'stripe';
import {NextRequest} from 'next/server';
import { headers } from 'next/headers';
import mysql from 'mysql2/promise';

const CheckoutInputSchema = z.object({
  priceId: z.string().describe('The ID of the Stripe price.'),
  successUrl: z.string().describe('The URL to redirect to on success.'),
  cancelUrl: z.string().describe('The URL to redirect to on cancellation.'),
  gameId: z.number().describe('The ID of the game being purchased.'),
  planId: z.number().describe('The ID of the plan being purchased.'),
  userId: z.string().describe('The ID of the user making the purchase.'),
  userEmail: z.string().describe("The email of the user making the purchase."),
  userName: z.string().describe("The name of the user making the purchase."),
  pterodactylNestId: z.number().describe("The Pterodactyl Nest ID for the game."),
  pterodactylEggId: z.number().describe("The Pterodactyl Egg ID for the game."),
  gameName: z.string().describe("The name of the game."),
  planName: z.string().describe("The name of the plan."),
  cpu: z.number().describe("The CPU limit for the server."),
  ram: z.number().describe("The RAM limit for the server."),
  disk: z.number().describe("The disk limit for the server."),
});
export type CheckoutInput = z.infer<typeof CheckoutInputSchema>;

const CheckoutOutputSchema = z.object({
  sessionId: z.string().describe('The ID of the Stripe checkout session.'),
});
export type CheckoutOutput = z.infer<typeof CheckoutOutputSchema>;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

async function createCheckoutSession(
  input: CheckoutInput
): Promise<CheckoutOutput> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: input.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: input.userEmail,
    metadata: {
      userId: input.userId, // This is the Discord ID
      gameId: input.gameId,
      planId: input.planId,
      // Pass Ptero info for server creation in webhook
      pterodactylNestId: input.pterodactylNestId,
      pterodactylEggId: input.pterodactylEggId,
      gameName: input.gameName,
      planName: input.planName,
      priceId: input.priceId,
      cpu: input.cpu,
      ram: input.ram,
      disk: input.disk,
    },
  });

  if (!session.id) {
    throw new Error('Could not create Stripe checkout session');
  }

  return { sessionId: session.id };
}

export const checkoutFlow = ai.defineFlow(
  {
    name: 'checkoutFlow',
    inputSchema: CheckoutInputSchema,
    outputSchema: CheckoutOutputSchema,
  },
  createCheckoutSession
);

    