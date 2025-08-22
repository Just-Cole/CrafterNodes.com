
'use server';

import { z } from 'zod';
import { getOrCreatePterodactylUser } from '@/lib/pterodactyl';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

const accountSetupSchema = z.object({
  discordId: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(8),
});

export async function completeAccountSetup(input: z.infer<typeof accountSetupSchema>) {
  const session = await getServerSession(authOptions);
  
  // Ensure the user performing the action is the one who is logged in.
  if (!session || session.user?.id !== input.discordId) {
    return { success: false, error: "Unauthorized." };
  }

  const result = accountSetupSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: "Invalid data provided." };
  }

  try {
    await getOrCreatePterodactylUser({
      discordId: result.data.discordId,
      email: result.data.email,
      name: result.data.name,
      password: result.data.password,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to complete account setup:", error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}


export async function checkIfPterodactylUserExists(discordId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.id !== discordId) {
        // Basic security check
        return false;
    }

    const { checkIfPterodactylUserExists: checkDb } = await import('@/lib/pterodactyl');
    return checkDb(discordId);
}
