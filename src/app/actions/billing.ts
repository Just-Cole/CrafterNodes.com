
'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
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
    gameName: string;
    planName: string;
    status: string;
    createdAt: string;
}

export async function getUserSubscriptions(): Promise<Subscription[]> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return [];
    }

    const connection = await getDbConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
            SELECT 
                s.id,
                g.name AS gameName,
                p.name AS planName,
                s.status,
                s.createdAt
            FROM subscriptions s
            JOIN users u ON s.userId = u.id
            JOIN games g ON s.gameId = g.id
            JOIN plans p ON s.planId = p.id
            WHERE u.discordId = ?
            ORDER BY s.createdAt DESC
        `, [session.user.id]);
        
        return rows as Subscription[];

    } catch (error) {
        console.error("Failed to fetch user subscriptions:", error);
        return [];
    } finally {
        await connection.end();
    }
}
