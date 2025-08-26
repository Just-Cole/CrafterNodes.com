
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

// This function queries the database to get the resource specs for a given plan ID.
async function getPlanSpecs(planId: number, connection: mysql.Connection) {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT cpu, ram, disk FROM plans WHERE id = ?',
        [planId]
    );

    if (rows.length === 0) {
        throw new Error(`Plan with ID ${planId} not found in the database.`);
    }

    const { cpu, ram, disk } = rows[0];

    if (!cpu || !ram || !disk) {
        throw new Error(`Plan ${planId} is missing resource specifications (CPU, RAM, or Disk) in the database.`);
    }

    return { cpu, ram, disk };
}


async function createPterodactylServer(userId: number, metadata: Stripe.Metadata, connection: mysql.Connection) {
  const { gameName, pterodactylNestId, pterodactylEggId, planName, planId } = metadata;
  
  if (!planId) {
      throw new Error("Plan ID is missing from Stripe metadata.");
  }

  // Fetch the plan specifications (CPU, RAM, DISK) from the database
  const spec = await getPlanSpecs(Number(planId), connection);

  const serverDetails = await createPteroServer({
      name: `${gameName} Server - ${planName}`,
      user: userId,
      nest: Number(pterodactylNestId),
      egg: Number(pterodactylEggId),
      docker_image: `ghcr.io/pterodactyl/yolks:java_17`, // This might need to be dynamic based on the egg
      startup: `java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar`, // This also depends on the egg
      limits: {
        memory: spec.ram,
        disk: spec.disk,
        cpu: spec.cpu,
        swap: 0,
        io: 500,
      },
      feature_limits: {
          databases: 1,
          allocations: 1,
          backups: 2,
      },
      // You might need to implement logic to find a free allocation
      // For now, we request the default one.
      allocation: {
        default: 1, 
      },
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
      
      const { userId: discordId, gameId, planId } = session.metadata || {};

      if (!discordId || !session.subscription || !gameId || !planId) {
        console.error("Webhook received with missing metadata:", session.metadata);
        return NextResponse.json({ error: 'Missing required metadata for server provisioning.' }, { status: 400 });
      }

      console.log('✅ Successful checkout for user:', discordId);
      console.log("Attempting to provision server via Pterodactyl...");

      try {
        await connection.beginTransaction();

        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id, pterodactylId FROM users WHERE discordId = ?',
            [discordId]
        );

        if (userRows.length === 0 || !userRows[0].pterodactylId) {
            throw new Error(`Database user with Discord ID ${discordId} not found or not linked to Pterodactyl. The user may need to log into the panel first.`);
        }
        const dbUser = userRows[0];

        console.log(`Found Pterodactyl user ID: ${dbUser.pterodactylId}`);

        const serverDetails = await createPterodactylServer(dbUser.pterodactylId, session.metadata, connection);
        const pteroServerId = serverDetails.id;
        console.log("✅ Successfully created Pterodactyl server:", serverDetails.identifier);
        
        await connection.execute(
            `INSERT INTO subscriptions (userId, pterodactylServerId, gameId, planId, stripeSubscriptionId, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [dbUser.id, pteroServerId, Number(gameId), Number(planId), session.subscription.toString(), 'active']
        );
        console.log(`✅ Successfully created subscription record in database.`);

        await connection.commit();

      } catch (error) {
        await connection.rollback();
        console.error("❌ Pterodactyl provisioning failed:", error);
        // Provide a more detailed error message to the client if possible
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
            // Return 200 to Stripe so it doesn't retry, but log the error for manual intervention.
        }
        break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  await connection.end();
  return NextResponse.json({ received: true });
}
