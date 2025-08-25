
'use server';

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
    // This function will not work until a user session is re-implemented.
    return [];
}
