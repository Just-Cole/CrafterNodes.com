
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const planSchema = z.object({
  name: z.string(),
  price: z.string(),
  priceId: z.string().optional(),
  features: z.array(z.string()),
  icon: z.string().optional(),
  popular: z.boolean().optional(),
});

const gameSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string(),
  hint: z.string(),
  pterodactylNestId: z.number(),
  pterodactylEggId: z.number(),
  plans: z.array(planSchema),
});

const pricingDataSchema = z.object({
  supportedGames: z.array(gameSchema),
});

export type PricingData = z.infer<typeof pricingDataSchema>;

// We cache the data so we don't have to read the file on every request.
// The cache is invalidated when the admin panel updates the file.
let cachedPricingData: PricingData | null = null;

export async function getPricingData(): Promise<PricingData> {
  // In a real production environment, you might want a more sophisticated cache
  // invalidation strategy, but for now, re-reading on revalidation is fine.
  
  try {
    const pricingFilePath = path.join(process.cwd(), 'src', 'data', 'pricing.json');
    const fileContents = await fs.readFile(pricingFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Validate data with Zod
    const validatedData = pricingDataSchema.parse(data);
    
    return validatedData;
  } catch (error) {
    console.error("Failed to read or parse pricing data:", error);
    // Return a default empty state or throw an error
    return { supportedGames: [] };
  }
}

// This function is for the client-side fetch on the admin page,
// as it cannot access the file system directly.
export async function createPricingApiRoute() {
    const data = await getPricingData();
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
    });
}
