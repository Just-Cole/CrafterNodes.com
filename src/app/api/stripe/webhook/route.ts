
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

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

async function createPterodactylUser(email: string, userName: string) {
  // In a real app, you might want to generate a random password and email it to the user,
  // or use a temporary password.
  const [firstName, lastName] = userName.split(' ');
  const response = await fetch(`${PTERODACTYL_URL}/api/application/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      username: userName.replace(/\s+/g, '_'), // Pterodactyl usernames can't have spaces
      first_name: firstName || userName,
      last_name: lastName || 'User',
      password: Math.random().toString(36).slice(-12), // WARNING: Insecure, for example only
    }),
  });
  if (response.status === 422) {
    // User might already exist, try to find them
    const usersResponse = await fetch(`${PTERODACTYL_URL}/api/application/users?filter[email]=${email}`, {
        headers: { 'Authorization': `Bearer ${PTERODACTYL_API_KEY}`, 'Accept': 'application/json' }
    });
    const usersData = await usersResponse.json();
    if (usersData.data && usersData.data.length > 0) {
      return usersData.data[0].attributes.id;
    }
  }
  const data = await response.json();
  if (data.object === 'user') {
    return data.attributes.id;
  }
  console.error("Pterodactyl user creation failed:", data);
  throw new Error("Failed to create or find Pterodactyl user.");
}

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
      
      const { userEmail, userName, ...metadata } = session.metadata || {};

      if (!userEmail || !userName || !metadata.pterodactylNestId || !metadata.pterodactylEggId) {
        console.error("Webhook received with missing metadata:", session.metadata);
        return NextResponse.json({ error: 'Missing required metadata for server provisioning.' }, { status: 400 });
      }

      console.log('✅ Successful checkout for user:', metadata.userId);
      console.log(`Plan: ${metadata.gameName} - ${metadata.planName}`);
      console.log("Attempting to provision server via Pterodactyl...");

      try {
        // 1. Create or find the user in Pterodactyl
        const pterodactylUserId = await createPterodactylUser(userEmail, userName);
        console.log(`Pterodactyl user ID: ${pterodactylUserId}`);

        // 2. Create the server
        const serverDetails = await createPterodactylServer(pterodactylUserId, metadata);
        console.log("✅ Successfully created Pterodactyl server:", serverDetails.attributes.identifier);

      } catch (error) {
        console.error("❌ Pterodactyl provisioning failed:", error);
        // Here you would add logic to handle the failure, e.g., notify an admin,
        // or queue a retry. For now, we'll just return an error.
        return NextResponse.json({ error: 'Failed to provision the game server.' }, { status: 500 });
      }

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
