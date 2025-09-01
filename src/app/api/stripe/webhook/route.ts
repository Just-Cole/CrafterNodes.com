
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

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (!session.subscription) {
         console.error("Webhook received but session is missing subscription ID.");
         return NextResponse.json({ error: 'Missing subscription ID.' }, { status: 400 });
      }

      // Retrieve the full subscription object to get the metadata
      const subscription = await stripe.subscriptions.retrieve(session.subscription.toString());
      const { userId: discordId, gameId, planId } = subscription.metadata;

      if (!discordId || !gameId || !planId) {
        console.error("Webhook received but subscription metadata is missing:", subscription.metadata);
        return NextResponse.json({ error: 'Missing required metadata on subscription.' }, { status: 400 });
      }

      console.log(`✅ Successful checkout for Discord user: ${discordId}.`);
      
      let connection;
      try {
        connection = await getDbConnection();
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id FROM users WHERE discordId = ?',
            [discordId]
        );

        if (userRows.length === 0) {
            console.error(`❌ User with Discord ID ${discordId} not found in the database.`);
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }
        const internalUserId = userRows[0].id;
        
        console.log(`Found internal user ID: ${internalUserId}. Creating subscription...`);

        await connection.execute(
            `INSERT INTO subscriptions (userId, gameId, planId, stripeSubscriptionId, status)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status), updatedAt = NOW()`,
            [internalUserId, Number(gameId), Number(planId), subscription.id, 'active']
        );
        console.log(`✅ Successfully created/updated subscription record in database for user ${internalUserId}.`);
      } catch (error) {
        console.error("❌ Webhook handler for checkout.session.completed failed:", error);
        // Don't return 500 to Stripe, as it will retry for our logic errors.
      } finally {
        if (connection) await connection.end();
      }
      break;
    }
    
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const subStatus = subscription.status;
      const subId = subscription.id;
      
      let connection;
      try {
        connection = await getDbConnection();
        await connection.execute(
            'UPDATE subscriptions SET status = ? WHERE stripeSubscriptionId = ?',
            [subStatus, subId]
        );
        console.log(`✅ Subscription ${subId} status updated to ${subStatus}.`);
      } catch (error) {
        console.error(`❌ Webhook handler for subscription update/delete failed for sub ID ${subId}:`, error);
      } finally {
        if (connection) await connection.end();
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}
