
'use server';

import { getOrCreatePterodactylUser } from '@/lib/pterodactyl';
import { z } from 'zod';

const setupSchema = z.object({
  discordId: z.string(),
  email: z.string().email(),
  name: z.string(),
});

export async function initialUserSetup(input: z.infer<typeof setupSchema>) {
  try {
    // This function will create the user in Pterodactyl if they don't exist
    // and also create or update their record in our local database.
    await getOrCreatePterodactylUser({
        discordId: input.discordId,
        email: input.email,
        name: input.name,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed during initial user setup:", error);
     if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred during user setup.' };
  }
}
