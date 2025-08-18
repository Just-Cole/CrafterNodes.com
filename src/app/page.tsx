
import { getPricingData } from '@/lib/pricing';
import { LandingPageContent } from './_components/landing-page-content';
import SteamGridDb from 'steamgriddb';

async function getSteamGridDBImage(gameName: string): Promise<string> {
    const defaultImage = `https://placehold.co/1920x1080.png`;
    try {
        const steamGridDbKey = process.env.STEAMGRIDDB_API_KEY;
        if (!steamGridDbKey) {
            console.warn("STEAMGRIDDB_API_KEY is not set. Using placeholder image.");
            return defaultImage;
        }

        const client = new SteamGridDb(steamGridDbKey);
        const [searchResult] = await client.searchGame(gameName);

        if (!searchResult) {
            console.warn(`No game found on SteamGridDB for "${gameName}". Using placeholder.`);
            return defaultImage;
        }

        const heroes = await client.getHeroes({ type: 'game', id: searchResult.id });

        if (heroes && heroes.length > 0) {
            return heroes[0].url;
        } else {
             console.warn(`No hero image found for "${gameName}". Using placeholder.`);
            return defaultImage;
        }
    } catch (error) {
        console.error(`Error fetching image from SteamGridDB for "${gameName}":`, error);
        return defaultImage;
    }
}


export default async function LandingPage() {
    const pricingData = await getPricingData();
    const heroImage = await getSteamGridDBImage("Star Citizen");

    return <LandingPageContent supportedGames={pricingData.supportedGames} heroImage={heroImage} />;
}

    