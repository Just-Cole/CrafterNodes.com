
'use server';

/**
 * @fileoverview A flow for creating a Stripe customer portal session.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Stripe from 'stripe';
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

// This function finds the first active subscription for a user and returns its Stripe Customer ID.
async function findStripeCustomerId(discordId: string): Promise<string | null> {
    let connection;
    try {
        connection = await getDbConnection();
        // 1. Get the internal user ID from the Discord ID
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id FROM users WHERE discordId = ?',
            [discordId]
        );

        if (userRows.length === 0) {
            console.error(`No internal user found for Discord ID: ${discordId}`);
            return null;
        }
        const internalUserId = userRows[0].id;

        // 2. Get the user's active subscriptions from your database
        const [subRows] = await connection.execute<mysql.RowDataPacket[]>(
            `SELECT stripeSubscriptionId FROM subscriptions WHERE userId = ? AND status = 'active' LIMIT 1`,
            [internalUserId]
        );
        
        if (subRows.length === 0) {
             console.log(`No active subscriptions found in DB for user ${internalUserId}`);
             return null; // No active subscription found to derive customer ID from
        }
        const stripeSubscriptionId = subRows[0].stripeSubscriptionId;

        // 3. Retrieve the subscription from Stripe to get the customer ID
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        return subscription.customer as string;

    } catch (error) {
        console.error("Error in findStripeCustomerId:", error);
        return null;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}


async function createCustomerPortalSession(
  input: CreateCustomerPortalInput
): Promise<CreateCustomerPortalOutput> {
  const customerId = await findStripeCustomerId(input.discordId);

  if (!customerId) {
    // Instead of throwing an error, we can try to find the customer by email
    // as a fallback. This is useful if the user has a Stripe customer object
    // but no active subscriptions.
     const { data: customers } = await stripe.customers.list({
        email: (await (await getDbConnection()).execute<mysql.RowDataPacket[]>('SELECT email FROM users WHERE discordId = ?', [input.discordId]))[0][0]?.email,
        limit: 1,
    });
     if (customers.length > 0) {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customers[0].id,
            return_url: input.returnUrl,
        });
        return { url: portalSession.url };
     }
    throw new Error('You do not have any active subscriptions or a billing account with us. Please purchase a server to manage your billing.');
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
