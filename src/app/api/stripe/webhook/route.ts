
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getPterodactylUserByDiscordId } from '@/lib/pterodactyl';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const PTERODACTYL_URL = process.env.PTERODACTYL_PANEL_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;

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

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { userId, userEmail, userName, ...metadata } = session.metadata || {};

      if (!userId || !userEmail || !userName || !metadata.pterodactylNestId || !metadata.pterodactylEggId) {
        console.error("Webhook received with missing metadata:", session.metadata);
        return NextResponse.json({ error: 'Missing required metadata for server provisioning.' }, { status: 400 });
      }

      console.log('✅ Successful checkout for user:', userId);
      console.log(`Plan: ${metadata.gameName} - ${metadata.planName}`);
      console.log("Attempting to provision server via Pterodactyl...");

      try {
        // 1. Get the user in Pterodactyl using their Discord ID
        const pterodactylUser = await getPterodactylUserByDiscordId({
          discordId: userId,
        });
        
        if (!pterodactylUser) {
           throw new Error(`Pterodactyl user with Discord ID ${userId} not found. The user may need to log into the panel first.`);
        }

        console.log(`Found Pterodactyl user ID: ${pterodactylUser.id}`);

        // 2. Create the server
        const serverDetails = await createPterodactylServer(pterodactylUser.id, metadata);
        console.log("✅ Successfully created Pterodactyl server:", serverDetails.attributes.identifier);

      } catch (error) {
        console.error("❌ Pterodactyl provisioning failed:", error);
        // Here you would add logic to handle the failure, e.g., notify an admin,
        // or queue a retry. For now, we'll just return an error.
        return NextResponse.json({ error: 'Failed to provision the game server. The user may need to log into the panel first.' }, { status: 500 });
      }

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
