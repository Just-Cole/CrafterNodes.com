
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
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.payment_status !== 'paid') {
        console.log(`Checkout session ${session.id} not paid yet.`);
        return NextResponse.json({ received: true });
      }

      if (!session.subscription) {
         console.error(`❌ Webhook Error: Checkout session ${session.id} is missing subscription ID.`);
         return NextResponse.json({ error: 'Missing subscription ID.' }, { status: 400 });
      }

      const subscriptionId = session.subscription.toString();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const { userId: discordId, gameId, planId } = subscription.metadata;

      if (!discordId || !gameId || !planId) {
        console.error(`❌ Webhook Error: Subscription ${subscriptionId} metadata is missing crucial data:`, subscription.metadata);
        return NextResponse.json({ error: 'Missing required metadata on subscription.' }, { status: 400 });
      }

      console.log(`✅ Successful checkout for Discord user: ${discordId}. Game: ${gameId}, Plan: ${planId}`);
      
      let connection;
      try {
        connection = await getDbConnection();
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id FROM users WHERE discordId = ?',
            [discordId]
        );

        if (userRows.length === 0) {
            console.error(`❌ Database Error: User with Discord ID ${discordId} not found in the database.`);
            return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
        }
        const internalUserId = userRows[0].id;
        
        console.log(`Found internal user ID: ${internalUserId}. Creating subscription record...`);

        const [insertResult] = await connection.execute(
            `INSERT INTO subscriptions (userId, gameId, planId, stripeSubscriptionId, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE status = VALUES(status), updatedAt = NOW()`,
            [internalUserId, Number(gameId), Number(planId), subscription.id, 'active']
        );
        
        console.log(`✅ Successfully created/updated subscription in database for user ${internalUserId}. Result:`, insertResult);

      } catch (error) {
        console.error("❌ Webhook database handler for checkout.session.completed failed:", error);
        return NextResponse.json({ error: 'Database operation failed.' }, { status: 500 });
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
      
      console.log(`Subscription ${subId} status changed to ${subStatus}.`);

      let connection;
      try {
        connection = await getDbConnection();
        await connection.execute(
            'UPDATE subscriptions SET status = ? WHERE stripeSubscriptionId = ?',
            [subStatus, subId]
        );
        console.log(`✅ Database record for subscription ${subId} status updated to ${subStatus}.`);
      } catch (error) {
        console.error(`❌ Webhook database handler for subscription update/delete failed for sub ID ${subId}:`, error);
        return NextResponse.json({ error: 'Database operation failed.' }, { status: 500 });
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
