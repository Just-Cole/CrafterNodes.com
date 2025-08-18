
import { getPricingData } from '@/lib/pricing';
import { GamesPageContent } from './_components/games-page-content';

export default async function GamesPage() {
    const pricingData = await getPricingData();

    return <GamesPageContent supportedGames={pricingData.supportedGames} />;
}
