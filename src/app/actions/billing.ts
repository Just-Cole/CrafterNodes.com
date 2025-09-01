
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import mysql from 'mysql2/promise';
import { getPricingData, Game } from '@/lib/pricing';

const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";
const ADMIN_DISCORD_ID = "949172257345921045";


async function getDbConnection() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is not set.');
    }
    return mysql.createConnection(DATABASE_URL);
}

export interface Subscription {
  id: number;
  userId: number;
  gameId: number;
  planId: number;
  stripeSubscriptionId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  gameName: string;
  planName: string;
}


export async function getUserSubscriptions(): Promise<Subscription[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("No user session found.");
    return [];
  }

  let connection;
  try {
    connection = await getDbConnection();

    // First, get the internal user ID from the Discord ID
    const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT id FROM users WHERE discordId = ?',
        [session.user.id]
    );

    if (userRows.length === 0) {
        console.error(`No internal user found for Discord ID: ${session.user.id}`);
        return [];
    }
    const internalUserId = userRows[0].id;
    
    // Now, fetch real subscriptions for that internal user ID
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT 
        s.*, 
        g.name as gameName,
        p.name as planName
      FROM subscriptions s
      JOIN games g ON s.gameId = g.id
      JOIN plans p ON s.planId = p.id
      WHERE s.userId = ?
      ORDER BY s.createdAt DESC`,
      [internalUserId]
    );
    
    const realSubscriptions = rows as Subscription[];

    // If the user is the special admin, fabricate subscriptions for all games
    if (session.user.id === ADMIN_DISCORD_ID) {
        const pricingData = await getPricingData();
        const allGames = pricingData.supportedGames;

        const fabricatedSubscriptions: Subscription[] = allGames.map(game => {
            // Find the "best" plan (most expensive)
            const bestPlan = game.plans.reduce((best, current) => {
                const bestPrice = parseFloat(best.price.replace(/[^0-9.-]+/g,""));
                const currentPrice = parseFloat(current.price.replace(/[^0-9.-]+/g,""));
                return currentPrice > bestPrice ? current : best;
            }, game.plans[0]);

            return {
                id: game.id! * -1, // Use a negative ID to avoid conflicts
                userId: internalUserId,
                gameId: game.id!,
                planId: bestPlan.id!,
                stripeSubscriptionId: 'admin-access',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                gameName: game.name,
                planName: `👑 ${bestPlan.name}` // Add a crown for flair
            };
        });

        // Combine real and fabricated, ensuring no duplicates for the same game
        const realSubGameIds = new Set(realSubscriptions.map(s => s.gameId));
        const uniqueFabricatedSubs = fabricatedSubscriptions.filter(fs => !realSubGameIds.has(fs.gameId));

        return [...realSubscriptions, ...uniqueFabricatedSubs];
    }


    return realSubscriptions;
  } catch (error) {
    console.error('Failed to fetch user subscriptions:', error);
    // In a real app, you might want to handle specific errors differently
    return [];
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
