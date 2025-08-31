
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import mysql from 'mysql2/promise';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

async function getDbConnection() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is not set.');
    }
    return mysql.createConnection(DATABASE_URL);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const connection = await getDbConnection();

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const { userId: discordId, gameId, planId } = session.metadata || {};

        if (!discordId || !session.subscription || !gameId || !planId) {
          console.error("Webhook received with missing metadata:", session.metadata);
          return NextResponse.json({ error: 'Missing required metadata.' }, { status: 400 });
        }

        console.log(`✅ Successful checkout for Discord user: ${discordId}.`);

        // 1. Find the internal user ID from the discordId
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id FROM users WHERE discordId = ?',
            [discordId]
        );

        if (userRows.length === 0) {
            await connection.end();
            console.error(`❌ User with Discord ID ${discordId} not found in the database.`);
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }
        const internalUserId = userRows[0].id;
        
        console.log(`Found internal user ID: ${internalUserId}. Creating subscription...`);

        // 2. Insert the subscription using the internal user ID
        await connection.execute(
            `INSERT INTO subscriptions (userId, gameId, planId, stripeSubscriptionId, status)
            VALUES (?, ?, ?, ?, ?)`,
            [internalUserId, Number(gameId), Number(planId), session.subscription.toString(), 'active']
        );

        console.log(`✅ Successfully created subscription record in database for user ${internalUserId}.`);
        break;
      }
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subStatus = subscription.status; // e.g., 'active', 'canceled', 'past_due'

        await connection.execute(
            'UPDATE subscriptions SET status = ? WHERE stripeSubscriptionId = ?',
            [subStatus, subscription.id]
        );
        console.log(`✅ Subscription ${subscription.id} status updated to ${subStatus}.`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error("❌ Webhook handler failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    // We don't return a 500 here to prevent Stripe from retrying for our own logic errors.
  } finally {
    await connection.end();
  }
  
  return NextResponse.json({ received: true });
}
