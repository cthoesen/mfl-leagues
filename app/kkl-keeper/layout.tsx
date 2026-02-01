import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KKL Keeper Manager | MFL Leagues',
  description: 'Knuckleheads Keeper League (KKL) 2026 Season Planning Tool',
};

export default function KKLKeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" 
        rel="stylesheet" 
      />
      {children}
    </>
  );
}
