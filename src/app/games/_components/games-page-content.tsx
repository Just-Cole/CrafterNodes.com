
'use client';

import { useState, useEffect } from 'react';
import type { PricingData } from '@/lib/pricing';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PricingDialog } from '@/app/_components/landing-page-content';
import { Search } from 'lucide-react';

export function GamesPageContent({ supportedGames }: { supportedGames: PricingData['supportedGames'] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredGames, setFilteredGames] = useState(supportedGames);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = supportedGames.filter(game =>
            game.name.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredGames(filtered);
    }, [searchTerm, supportedGames]);

    return (
        <div className="container mx-auto py-12 md:py-20">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        All Games
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Browse our full catalog of high-performance game servers.
                    </p>
                </div>
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search for a game..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {filteredGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {filteredGames.map((game) => (
                         <Card key={game.name} className="bg-background border-border/60 overflow-hidden flex flex-col hover:border-primary transition-colors duration-300">
                            <div className="relative aspect-[2/3]">
                                <Image src={game.image} alt={game.name} fill className="object-cover" data-ai-hint={game.hint} />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-2xl font-bold mb-2 text-foreground">{game.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 flex-grow">{game.description}</p>
                                <div className="flex justify-between items-center">
                                   <p className="text-muted-foreground text-sm">Starting from <span className="font-bold text-foreground">{game.plans ? game.plans[0].price : "$5"}</span>/mo</p>
                                    <PricingDialog game={game}>
                                        <Button variant="outline">View Plans</Button>
                                    </PricingDialog>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold">No Games Found</h2>
                    <p className="text-muted-foreground mt-2">
                        We couldn't find any games matching your search. Try a different term!
                    </p>
                </div>
            )}
        </div>
    );
}
