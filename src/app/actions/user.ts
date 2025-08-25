
'use server';

import { z } from 'zod';
import { getOrCreatePterodactylUser } from '@/lib/pterodactyl';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

const accountSetupSchema = z.object({
  discordId: z.string(),
  email: z.string().email(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
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
    // This function now handles both creation and linking.
    await getOrCreatePterodactylUser({
      discordId: result.data.discordId,
      email: result.data.email,
      username: result.data.username,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      password: result.data.password, // Password is now required for explicit setup
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


export async function checkIfPterodactylUserExists(discordId: string): Promise<boolean> {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.id !== discordId) {
        // Basic security check to ensure the logged-in user is checking their own status
        console.warn(`Unauthorized attempt to check Pterodactyl user for Discord ID: ${discordId}`);
        return false;
    }
    // We need to import the actual check from the library
    const { checkIfPterodactylUserExists: checkDb } = await import('@/lib/pterodactyl');
    return checkDb(discordId);
}
