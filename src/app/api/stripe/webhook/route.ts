
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createPterodactylServer as createPteroServer } from '@/lib/pterodactyl';
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

async function createPterodactylServer(userId: number, metadata: Stripe.Metadata) {
  const { 
      gameName, 
      planName, 
      pterodactylNestId, 
      pterodactylEggId, 
      cpu, 
      ram, 
      disk 
    } = metadata;
  
  if (!cpu || !ram || !disk) {
      throw new Error("Missing resource allocation metadata (cpu, ram, or disk).");
  }

  const serverDetails = await createPteroServer({
      name: `${gameName} Server - ${planName}`,
      user: userId,
      nest: Number(pterodactylNestId),
      egg: Number(pterodactylEggId),
      docker_image: `ghcr.io/pterodactyl/yolks:java_17`, // This might need to be dynamic based on the egg
      startup: `java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar`, // This also depends on the egg
      limits: {
        memory: Number(ram),
        disk: Number(disk),
        cpu: Number(cpu),
        swap: 0,
        io: 500,
      },
      feature_limits: {
          databases: 1,
          allocations: 1,
          backups: 2,
      },
      allocation: {
        default: 1, 
      },
      deploy: {
          locations: [1], 
          dedicated_ip: false,
          port_range: [],
      }
  });


  if (!serverDetails) {
    throw new Error(`Failed to create Pterodactyl server.`);
  }

  return serverDetails;
}


export async function POST(req: Request) {
  const PTERODACTYL_URL = process.env.PTERODACTYL_PANEL_URL;
  const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;

  if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
      console.error("Pterodactyl environment variables are not set.");
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

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
      
      const { userId, gameId, planId } = session.metadata || {}; // userId is now the Pterodactyl User ID

      if (!userId || !session.subscription || !gameId || !planId) {
        console.error("Webhook received with missing metadata:", session.metadata);
        return NextResponse.json({ error: 'Missing required metadata for server provisioning.' }, { status: 400 });
      }

      console.log('✅ Successful checkout for user:', userId);
      console.log("Attempting to provision server via Pterodactyl...");

      try {
        await connection.beginTransaction();

        // With Discord login removed, we rely on the `userId` in metadata being the Pterodactyl ID
        // This part of the flow will need to be redesigned when a new auth system is in place.
        const pteroUserId = Number(userId);

        const serverDetails = await createPterodactylServer(pteroUserId, session.metadata);
        const pteroServerId = serverDetails.id;
        console.log("✅ Successfully created Pterodactyl server:", serverDetails.identifier);
        
        // This assumes a record in the `users` table already exists for this pterodactyl user.
        // This might fail until a new user registration flow is built.
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>('SELECT id FROM users WHERE pterodactylId = ?', [pteroUserId]);
        if (userRows.length === 0) {
            throw new Error(`Could not find a user in our database with Pterodactyl ID ${pteroUserId}. Cannot create subscription.`);
        }
        const dbUserId = userRows[0].id;
        
        await connection.execute(
            `INSERT INTO subscriptions (userId, pterodactylServerId, gameId, planId, stripeSubscriptionId, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [dbUserId, pteroServerId, Number(gameId), Number(planId), session.subscription.toString(), 'active']
        );
        console.log(`✅ Successfully created subscription record in database.`);

        await connection.commit();

      } catch (error) {
        await connection.rollback();
        console.error("❌ Pterodactyl provisioning failed:", error);
        return NextResponse.json({ error: 'Failed to provision the game server.' }, { status: 500 });
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
            // Return 200 to Stripe so it doesn't retry, but log the error for manual intervention.
        }
        break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  await connection.end();
  return NextResponse.json({ received: true });
}
