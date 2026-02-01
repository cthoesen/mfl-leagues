import { NextResponse } from 'next/server';

// 1. THIS LINE IS CRITICAL: It forces the API to run on every request
export const dynamic = 'force-dynamic';

export async function GET() {
  const MFL_URL = "https://www47.myfantasyleague.com/2025/options?L=45267&O=07&PRINTER=1";
  
  try {
    const response = await fetch(MFL_URL, {
      // 2. Add headers to look like a real browser to avoid MFL blocking
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      next: { revalidate: 0 } // 3. Ensure no caching happens
    });
    
    if (!response.ok) {
      console.error(`MFL Fetch Error: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: `Failed to fetch from MFL: ${response.status}` }, { status: 500 });
    }
    
    const htmlText = await response.text();
    const players = [];
    const sections = htmlText.split('<caption');
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const teamMatch = section.match(/<a[^>]*>([^<]+)<\/a>/);
      const ownerMatch = section.match(/<span class="ownername">\s*-\s*([^<]+)<\/span>/);
      const teamName = teamMatch ? teamMatch[1].trim() : "Unknown Team";
      const ownerName = ownerMatch ? ownerMatch[1].trim() : "Unknown Owner";

      const rowMatches = section.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs);
      for (const row of rowMatches) {
        const rowContent = row[1];
        if (rowContent.includes('<th')) continue;
        
        const playerMatch = rowContent.match(/<td class="player">(.*?)<\/td>/s);
        const yearsMatch = rowContent.match(/<td class="contractyear">([^<]*)<\/td>/);
        const keeperMatch = rowContent.match(/<td class="contractinfo">([^<]*)/);
        const acquiredMatch = rowContent.match(/<td class="drafted">([^<]*)<\/td>/);

        if (playerMatch) {
          players.push({
            Team: teamName,
            Owner: ownerName,
            Player: playerMatch[1].replace(/<[^>]*>/g, '').trim(),
            Years: yearsMatch ? yearsMatch[1].trim() : '',
            Keeper: keeperMatch ? keeperMatch[1].replace(/\n/g, ' ').trim() : '',
            Acquired: acquiredMatch ? acquiredMatch[1].trim() : ''
          });
        }
      }
    }

    return NextResponse.json(players);
    
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}