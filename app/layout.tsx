import './globals.css'; // <--- THIS IS THE MISSING KEY!

export const metadata = {
  title: 'MFL Leagues',
  description: 'Custom CSS, JavaScript, and assets for MyFantasyLeague.com leagues',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  )
}