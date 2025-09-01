
import { z } from 'zod';
import mysql from 'mysql2/promise';

const planSchema = z.object({
  id: z.number().optional(),
  game_id: z.number().optional(),
  name: z.string(),
  price: z.string(),
  priceId: z.string().optional().nullable(),
  features: z.array(z.string()),
  icon: z.string().optional().nullable(),
  popular: z.boolean().optional(),
});

const gameSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  hint: z.string(),
  plans: z.array(planSchema),
});

const pricingDataSchema = z.object({
  supportedGames: z.array(gameSchema),
});

export type PricingData = z.infer<typeof pricingDataSchema>;
export type Game = z.infer<typeof gameSchema>;
export type Plan = z.infer<typeof planSchema>;

// IMPORTANT: This is the hardcoded database connection string.
const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

async function getConnection() {
    if (!DATABASE_URL) {
        throw new Error(
            'DATABASE_URL is not set. Please add it directly in src/lib/pricing.ts'
        );
    }
  const connection = await mysql.createConnection(DATABASE_URL);
  return connection;
}

export async function getPricingData(): Promise<PricingData> {
  let connection;
  try {
    connection = await getConnection();
    const [gamesRows] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT id, name, description, image, hint FROM games ORDER BY id
    `);

    const games: Game[] = [];

    for (const gameRow of gamesRows) {
      const [plansRows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT * FROM plans WHERE game_id = ? ORDER BY id',
        [gameRow.id]
      );
      
      const plans = plansRows.map(planRow => ({
        ...planRow,
        id: planRow.id,
        features: JSON.parse(planRow.features || '[]'),
        popular: Boolean(planRow.popular),
      })) as Plan[];

      games.push({
        ...gameRow,
        id: gameRow.id,
        plans,
      } as Game);
    }
    
    return { supportedGames: games };
  } catch (error: any) {
    if (error.code === 'ETIMEDOUT') {
      throw new Error(
        'Database connection timed out. This is a firewall issue. Please ensure that your cloud provider\'s firewall allows inbound TCP traffic on port 3306 from all IPs (0.0.0.0/0). Also, verify that your server\'s firewall (ufw) allows traffic on port 3306.'
      );
    }
    // Re-throw other errors
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// This function is for the client-side fetch on the admin page,
// as it cannot access the file system directly.
export async function createPricingApiRoute() {
    const data = await getPricingData();
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
    });
}

    