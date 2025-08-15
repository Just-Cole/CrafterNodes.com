
import { getPricingData } from '@/lib/pricing';
import { LandingPageContent } from './_components/landing-page-content';

export default async function LandingPage() {
    const pricingData = await getPricingData();

    return <LandingPageContent supportedGames={pricingData.supportedGames} />;
}
