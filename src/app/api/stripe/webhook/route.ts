
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

// This function will be expanded later to provision a server in your custom panel.
async function createServer(userId: number, metadata: Stripe.Metadata, connection: mysql.Connection) {
  const { gameName, planName, planId } = metadata;
  
  if (!planId) {
      throw new Error("Plan ID is missing from Stripe metadata.");
  }

  // In the future, this function will provision a server.
  // For now, it returns a mock server ID.
  console.log(`Simulating server creation for user ${userId} with plan ${planName} (${planId}).`);
  
  const mockServerId = Math.floor(Math.random() * 100000);
  
  console.log(`✅ Successfully created mock server with ID: ${mockServerId}`);
  return { id: mockServerId };
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

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { userId: discordId, gameId, planId } = session.metadata || {};

      if (!discordId || !session.subscription || !gameId || !planId) {
        console.error("Webhook received with missing metadata:", session.metadata);
        return NextResponse.json({ error: 'Missing required metadata for server provisioning.' }, { status: 400 });
      }

      console.log('✅ Successful checkout for user:', discordId);
      console.log("Attempting to provision server...");

      try {
        await connection.beginTransaction();

        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id FROM users WHERE discordId = ?',
            [discordId]
        );

        if (userRows.length === 0) {
            throw new Error(`Database user with Discord ID ${discordId} not found.`);
        }
        const dbUser = userRows[0];

        // This will be replaced with real server creation logic later.
        // For now, we are inserting a record without a real server.
        
        await connection.execute(
            `INSERT INTO subscriptions (userId, gameId, planId, stripeSubscriptionId, status)
            VALUES (?, ?, ?, ?, ?)`,
            [dbUser.id, Number(gameId), Number(planId), session.subscription.toString(), 'active']
        );
        console.log(`✅ Successfully created subscription record in database.`);

        await connection.commit();

      } catch (error) {
        await connection.rollback();
        console.error("❌ Provisioning failed:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: `Failed to provision the game server. Reason: ${errorMessage}` }, { status: 500 });
      }

      break;
    
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const subStatus = subscription.status; // e.g., 'active', 'canceled', 'past_due'

        try {
            await connection.execute(
                'UPDATE subscriptions SET status = ? WHERE stripeSubscriptionId = ?',
                [subStatus, subscription.id]
            );
             console.log(`✅ Subscription ${subscription.id} status updated to ${subStatus}.`);
        } catch (error) {
            console.error(`❌ Failed to update subscription status for ${subscription.id}:`, error);
        }
        break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  await connection.end();
  return NextResponse.json({ received: true });
}
