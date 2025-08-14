import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
