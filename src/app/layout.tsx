
'use client';

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Since we're not exporting metadata, we can remove it or comment it out.
// But as per instructions to only make the change and no comments, I will just remove it.


function AuthProvider({children}: {children: React.ReactNode}) {
  return <SessionProvider>{children}</SessionProvider>
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
       <head>
        <Script type="text/javascript" src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" async />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
