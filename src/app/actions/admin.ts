
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

const ADMIN_DISCORD_ID = "949172257345921045";

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
  image: z.string().min(1, "Image path is required."),
  hint: z.string().min(1, "AI hint is required."),
  pterodactylNestId: z.coerce.number().min(1, "Pterodactyl Nest ID is required."),
  pterodactylEggId: z.coerce.number().min(1, "Pterodactyl Egg ID is required."),
  plans: z.array(planSchema).min(1, "At least one plan is required."),
});

export type GameSchema = z.infer<typeof gameSchema>;
export type PlanSchema = z.infer<typeof planSchema>;

export async function addGame(formData: GameSchema) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.id !== ADMIN_DISCORD_ID) {
    return { success: false, error: "Unauthorized" };
  }

  const result = gameSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }

  const newGame = result.data;

  try {
    const pricingFilePath = path.join(process.cwd(), 'src', 'data', 'pricing.json');
    const fileContents = await fs.readFile(pricingFilePath, 'utf8');
    const pricingData = JSON.parse(fileContents);

    pricingData.supportedGames.push(newGame);

    await fs.writeFile(pricingFilePath, JSON.stringify(pricingData, null, 4));

    revalidatePath('/');

    return { success: true, message: "Game added successfully!" };
  } catch (error) {
    console.error("Failed to add game:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred." };
  }
}
