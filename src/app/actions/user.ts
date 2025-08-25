
'use server';

// This file is being kept for future use when a new authentication system is implemented.
// The functions are currently not used since Discord login has been removed.

import { z } from 'zod';
import { getOrCreatePterodactylUser } from '@/lib/pterodactyl';

const accountSetupSchema = z.object({
  externalId: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(8),
});

export async function completeAccountSetup(input: z.infer<typeof accountSetupSchema>) {
  // This action is disabled until a new auth system is in place.
  return { success: false, error: "Account setup is temporarily disabled." };

  /*
  const result = accountSetupSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: "Invalid data provided." };
  }

  try {
    await getOrCreatePterodactylUser({
      externalId: result.data.externalId,
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
  */
}


export async function checkIfPterodactylUserExists(externalId: string) {
    // This action is disabled until a new auth system is in place.
    return false;
    /*
    const { checkIfPterodactylUserExists: checkDb } = await import('@/lib/pterodactyl');
    return checkDb(externalId);
    */
}
