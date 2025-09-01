
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
  plans: z.array(planSchema).min(1, "At least one plan is required."),
});

const updateGameSchema = gameSchema.omit({ plans: true }).extend({
    id: z.number(),
});

const updatePlanSchema = planSchema.extend({
    id: z.number(),
});

const addPlanSchema = planSchema.extend({
    game_id: z.number(),
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
      `INSERT INTO games (name, description, image, hint) VALUES (?, ?, ?, ?)`,
      [
        newGameData.name,
        newGameData.description,
        imageUrl,
        newGameData.hint,
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
          plan.popular || false,
        ]
      );
    }

    await connection.commit();

    revalidatePath('/');
    revalidatePath('/games');
    revalidatePath('/admin');


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

export async function addPlan(formData: z.infer<typeof addPlanSchema>) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.id !== ADMIN_DISCORD_ID) {
        return { success: false, error: "Unauthorized" };
    }

    const result = addPlanSchema.safeParse(formData);
    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    const plan = result.data;
    const connection = await getConnection();

    try {
        await connection.execute(
            `INSERT INTO plans (game_id, name, price, priceId, features, icon, popular) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                plan.game_id,
                plan.name,
                plan.price,
                plan.priceId || null,
                JSON.stringify(plan.features),
                plan.icon || null,
                plan.popular || false,
            ]
        );
        revalidatePath('/');
        revalidatePath('/games');
        revalidatePath('/admin');
        return { success: true, message: 'Plan added successfully!' };
    } catch (error) {
        console.error("Failed to add plan:", error);
        return { success: false, error: "Database error occurred." };
    } finally {
        await connection.end();
    }
}

export async function updateGame(formData: z.infer<typeof updateGameSchema>) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.id !== ADMIN_DISCORD_ID) {
        return { success: false, error: "Unauthorized" };
    }

    const result = updateGameSchema.safeParse(formData);
    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    const { id, ...gameData } = result.data;
    const connection = await getConnection();
    try {
        await connection.execute(
            `UPDATE games SET name = ?, description = ?, hint = ? WHERE id = ?`,
            [gameData.name, gameData.description, gameData.hint, id]
        );
        revalidatePath('/');
        revalidatePath('/games');
        revalidatePath('/admin');
        return { success: true, message: 'Game updated successfully!' };
    } catch (error) {
        console.error("Failed to update game:", error);
        return { success: false, error: "Database error occurred." };
    } finally {
        await connection.end();
    }
}

export async function updatePlan(formData: z.infer<typeof updatePlanSchema>) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.id !== ADMIN_DISCORD_ID) {
        return { success: false, error: "Unauthorized" };
    }

    const result = updatePlanSchema.safeParse(formData);
    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    const { id, ...planData } = result.data;
    const connection = await getConnection();
    try {
        await connection.execute(
            `UPDATE plans SET name = ?, price = ?, priceId = ?, features = ?, icon = ?, popular = ? WHERE id = ?`,
            [planData.name, planData.price, planData.priceId || null, JSON.stringify(planData.features), planData.icon || null, planData.popular || false, id]
        );
        revalidatePath('/');
        revalidatePath('/games');
        revalidatePath('/admin');
        return { success: true, message: 'Plan updated successfully!' };
    } catch (error) {
        console.error("Failed to update plan:", error);
        return { success: false, error: "Database error occurred." };
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
        revalidatePath('/admin');


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

export async function deleteGame(gameId: number) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.id !== ADMIN_DISCORD_ID) {
        return { success: false, error: "Unauthorized" };
    }

    const connection = await getConnection();
    try {
        await connection.execute('DELETE FROM games WHERE id = ?', [gameId]);
        revalidatePath('/');
        revalidatePath('/games');
        revalidatePath('/admin');
        return { success: true, message: 'Game deleted successfully.' };
    } catch (error) {
        console.error("Failed to delete game:", error);
        return { success: false, error: "Database error occurred." };
    } finally {
        await connection.end();
    }
}

export async function deletePlan(planId: number) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.id !== ADMIN_DISCORD_ID) {
        return { success: false, error: "Unauthorized" };
    }

    const connection = await getConnection();
    try {
        await connection.execute('DELETE FROM plans WHERE id = ?', [planId]);
        revalidatePath('/');
        revalidatePath('/games');
        revalidatePath('/admin');
        return { success: true, message: 'Plan deleted successfully.' };
    } catch (error) {
        console.error("Failed to delete plan:", error);
        return { success: false, error: "Database error occurred." };
    } finally {
        await connection.end();
    }
}

    