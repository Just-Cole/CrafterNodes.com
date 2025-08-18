
'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import SteamGridDb from 'steamgriddb';
import mysql from 'mysql2/promise';

const ADMIN_DISCORD_ID = "949172257345921045";

// IMPORTANT: Replace this with your actual database connection string.
const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

async function getConnection() {
    if (!DATABASE_URL) {
        throw new Error(
            'DATABASE_URL is not set. Please add it directly in src/app/actions/admin.ts'
        );
    }
  const connection = await mysql.createConnection(DATABASE_URL);
  return connection;
}

const planSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  priceId: z.string().optional(),
  features: z.preprocess((val) => (typeof val === 'string' ? val.split(',').map(s => s.trim()) : val), z.array(z.string())),
  icon: z.string().optional(),
  popular: z.boolean().optional(),
});

const gameSchema = z.object({
  name: z.string().min(1, "Game name is required."),
  description: z.string().min(1, "Description is required."),
  hint: z.string().min(1, "AI hint is required."),
  pterodactylNestId: z.coerce.number().min(1, "Pterodactyl Nest ID is required."),
  pterodactylEggId: z.coerce.number().min(1, "Pterodactyl Egg ID is required."),
  plans: z.array(planSchema).min(1, "At least one plan is required."),
});

// We don't include 'image' here because it's fetched automatically.
export type GameSchema = z.infer<typeof gameSchema>;
export type PlanSchema = z.infer<typeof planSchema>;

async function getSteamGridDBImage(gameName: string): Promise<string> {
    const defaultImage = `https://placehold.co/600x900.png`;
    try {
        const steamGridDbKey = process.env.STEAMGRIDDB_API_KEY;
        if (!steamGridDbKey) {
            console.warn("STEAMGRIDDB_API_KEY is not set. Using placeholder image.");
            return defaultImage;
        }

        const client = new SteamGridDb(steamGridDbKey);
        const [searchResult] = await client.searchGame(gameName);

        if (!searchResult) {
            console.warn(`No game found on SteamGridDB for "${gameName}". Using placeholder.`);
            return defaultImage;
        }

        const grids = await client.getGrids({ type: 'game', id: searchResult.id, styles: ['alternate'], dimensions: ['600x900'] });

        if (grids && grids.length > 0) {
            return grids[0].url;
        } else {
             console.warn(`No 600x900 grid found for "${gameName}". Trying any grid as a fallback.`);
             const anyGrids = await client.getGrids({ type: 'game', id: searchResult.id });
             if (anyGrids && anyGrids.length > 0) {
                 return anyGrids[0].url;
             }
             console.warn(`No grids found at all for "${gameName}". Using placeholder.`);
            return defaultImage;
        }
    } catch (error) {
        console.error(`Error fetching image from SteamGridDB for "${gameName}":`, error);
        return defaultImage;
    }
}


export async function addGame(formData: GameSchema) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.id !== ADMIN_DISCORD_ID) {
    return { success: false, error: "Unauthorized" };
  }
  
  const result = gameSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }
  
  const newGameData = result.data;

  const imageUrl = await getSteamGridDBImage(newGameData.name);

  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [gameInsertResult] = await connection.execute<mysql.ResultSetHeader>(
      `INSERT INTO games (name, description, image, hint, pterodactylNestId, pterodactylEggId) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        newGameData.name,
        newGameData.description,
        imageUrl,
        newGameData.hint,
        newGameData.pterodactylNestId,
        newGameData.pterodactylEggId
      ]
    );
    const gameId = gameInsertResult.insertId;

    for (const plan of newGameData.plans) {
      await connection.execute(
        `INSERT INTO plans (game_id, name, price, priceId, features, icon, popular) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          gameId,
          plan.name,
          plan.price,
          plan.priceId || null,
          JSON.stringify(plan.features),
          plan.icon || null,
          plan.popular || false
        ]
      );
    }

    await connection.commit();

    revalidatePath('/');
    revalidatePath('/games');

    return { success: true, message: "Game added successfully!" };
  } catch (error) {
    await connection.rollback();
    console.error("Failed to add game:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred." };
  } finally {
      await connection.end();
  }
}

export async function updateAllGameImages() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.id !== ADMIN_DISCORD_ID) {
        return { success: false, error: "Unauthorized" };
    }
    
    const connection = await getConnection();
    try {
        const [games] = await connection.execute<mysql.RowDataPacket[]>('SELECT id, name FROM games');

        for (const game of games) {
            console.log(`Fetching image for ${game.name}...`);
            const imageUrl = await getSteamGridDBImage(game.name);
            await connection.execute(
              'UPDATE games SET image = ? WHERE id = ?',
              [imageUrl, game.id]
            );
        }

        revalidatePath('/');
        revalidatePath('/games');

        return { success: true, message: "All game images updated successfully!" };
    } catch (error) {
        console.error("Failed to update game images:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unknown error occurred while updating images." };
    } finally {
        await connection.end();
    }
}
