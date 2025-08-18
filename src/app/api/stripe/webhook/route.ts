
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getPterodactylUserByDiscordId } from '@/lib/pterodactyl';
import mysql from 'mysql2/promise';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const PTERODACTYL_URL = process.env.PTERODACTYL_PANEL_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;
const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

async function getDbConnection() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is not set.');
    }
    return mysql.createConnection(DATABASE_URL);
}


// This is a simplified example. In a real-world scenario, you would have a more
// robust way to map Stripe Price IDs to Pterodactyl server configurations.
// For example, you might store these mappings in your database or in a dedicated config file.
const planToPterodactylSpec: { [key: string]: { cpu: number; ram: number; disk: number } } = {
  // Minecraft Plans
  "price_1RwDdDGiQmXe4wKvj0RexV7n": { cpu: 100, ram: 2048, disk: 5120 }, // Coal Plan
  // ... add other plan mappings here
};

async function createPterodactylServer(userId: number, metadata: Stripe.Metadata) {
  const { gameName, pterodactylNestId, pterodactylEggId, planName, priceId } = metadata;
  
  // You would expand this logic to map plans to Pterodactyl resource limits
  const spec = planToPterodactylSpec[priceId] || { cpu: 100, ram: 1024, disk: 5120 };

  const response = await fetch(`${PTERODACTYL_URL}/api/application/servers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      name: `${gameName} Server - ${planName}`,
      user: userId,
      nest: Number(pterodactylNestId),
      egg: Number(pterodactylEggId),
      docker_image: `ghcr.io/pterodactyl/yolks:java_17`, // This might need to be dynamic based on the egg
      startup: `java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar`, // This also depends on the egg
      limits: {
        memory: spec.ram,
        swap: 0,
        disk: spec.disk,
        io: 500,
        cpu: spec.cpu,
      },
      feature_limits: {
        databases: 1,
        allocations: 1,
        backups: 2,
      },
      // You need to have locations configured in Pterodactyl
      // and have allocated IPs to them.
      allocation: {
        default: 1 // This is the ID of the allocation
      }
    }),
  });

  const data = await response.json();

  if (response.status > 299) {
    console.error("Pterodactyl server creation failed:", data);
    throw new Error(`Failed to create Pterodactyl server. Status: ${response.status}`);
  }

  return data;
}


export async function POST(req: Request) {
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

        if (userRows.length === 0) {
            throw new Error(`Database user with Discord ID ${discordId} not found. The user may need to log into the panel first.`);
        }
        const dbUser = userRows[0];

        console.log(`Found Pterodactyl user ID: ${dbUser.pterodactylId}`);

        const serverDetails = await createPterodactylServer(dbUser.pterodactylId, session.metadata);
        const pteroServerId = serverDetails.attributes.id;
        console.log("✅ Successfully created Pterodactyl server:", serverDetails.attributes.identifier);
        
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
        return NextResponse.json({ error: 'Failed to provision the game server. Please ensure you have logged into the panel at least once.' }, { status: 500 });
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

