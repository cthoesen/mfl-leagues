export const metadata = {
  title: 'MFL Leagues - Asset Repository',
  description: 'Custom CSS, JavaScript, and assets for MyFantasyLeague.com leagues',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
