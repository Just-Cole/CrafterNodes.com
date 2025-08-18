
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
  pterodactylNestId: z.number(),
  pterodactylEggId: z.number(),
  plans: z.array(planSchema),
});

const pricingDataSchema = z.object({
  supportedGames: z.array(gameSchema),
});

export type PricingData = z.infer<typeof pricingDataSchema>;
export type Game = z.infer<typeof gameSchema>;
export type Plan = z.infer<typeof planSchema>;


async function getConnection() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  return connection;
}

export async function getPricingData(): Promise<PricingData> {
  const connection = await getConnection();
  try {
    const [gamesRows] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT * FROM games ORDER BY id
    `);

    const games: Game[] = [];

    for (const gameRow of gamesRows) {
      const [plansRows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT * FROM plans WHERE game_id = ? ORDER BY id',
        [gameRow.id]
      );
      
      const plans = plansRows.map(planRow => ({
        ...planRow,
        features: JSON.parse(planRow.features || '[]'),
        popular: Boolean(planRow.popular),
      })) as Plan[];

      games.push({
        ...gameRow,
        plans,
      } as Game);
    }
    
    return { supportedGames: games };
  } finally {
    await connection.end();
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
