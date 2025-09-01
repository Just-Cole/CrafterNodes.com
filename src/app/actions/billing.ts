
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

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

    // Now, fetch subscriptions for that internal user ID
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

    return rows as Subscription[];
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
