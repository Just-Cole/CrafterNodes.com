
'use server';

/**
 * @fileoverview A flow for creating a Stripe customer portal session.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Stripe from 'stripe';
import { getUserSubscriptions } from '@/app/actions/billing'; 
import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

async function getDbConnection() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is not set.');
    }
    return mysql.createConnection(DATABASE_URL);
}


const CreateCustomerPortalInputSchema = z.object({
  discordId: z.string().describe('The Discord ID of the user.'),
  returnUrl: z.string().describe('The URL to redirect to after the portal session.'),
});
export type CreateCustomerPortalInput = z.infer<typeof CreateCustomerPortalInputSchema>;

const CreateCustomerPortalOutputSchema = z.object({
  url: z.string().describe('The URL of the Stripe customer portal session.'),
});
export type CreateCustomerPortalOutput = z.infer<typeof CreateCustomerPortalOutputSchema>;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

async function findStripeCustomerId(discordId: string): Promise<string | null> {
    const subscriptions = await getUserSubscriptions();
    const userSubscription = subscriptions.find(sub => sub.stripeSubscriptionId.startsWith('sub_'));

    if (!userSubscription) {
        return null; // No subscription found to derive customer ID from
    }

    try {
        const subscription = await stripe.subscriptions.retrieve(userSubscription.stripeSubscriptionId);
        return subscription.customer as string;
    } catch (error) {
        console.error("Could not retrieve subscription from stripe", error);
        return null;
    }
}


async function createCustomerPortalSession(
  input: CreateCustomerPortalInput
): Promise<CreateCustomerPortalOutput> {
  const customerId = await findStripeCustomerId(input.discordId);

  if (!customerId) {
    throw new Error('Could not find Stripe customer ID for the user.');
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: input.returnUrl,
  });

  return { url: portalSession.url };
}

export const createCustomerPortalFlow = ai.defineFlow(
  {
    name: 'createCustomerPortalFlow',
    inputSchema: CreateCustomerPortalInputSchema,
    outputSchema: CreateCustomerPortalOutputSchema,
  },
  createCustomerPortalSession
);

