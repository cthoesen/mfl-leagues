import { NextResponse } from 'next/server';

// Force the API to run on every request (no caching)
export const dynamic = 'force-dynamic'; 

export async function GET() {
  const MFL_URL = "https://www47.myfantasyleague.com/2025/options?L=45267&O=07&PRINTER=1";
  
  try {
    const response = await fetch(MFL_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch MFL data" }, { status: 500 });
    }
    
    const htmlText = await response.text();
    const players = [];
    const sections = htmlText.split('<caption');

    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];

      // --- IMPROVED PARSING LOGIC ---

      // 1. Extract Team Name (Text inside the link)
      const teamMatch = section.match(/>([^<]+)<\/a>/);
      const teamName = teamMatch ? teamMatch[1].trim() : "Unknown Team";

      // 2. Extract Owner Name
      // Strategy A: Grab from the "title" attribute (Most Reliable)
      // format is: title="Owner: Corey Thoesen, Record:..."
      const ownerTitleMatch = section.match(/title="Owner:\s*(.+?)\s*,\s*Record:/);
      
      // Strategy B: Grab from the visual span (Fallback)
      // format is: <span class="ownername"> - Corey Thoesen</span>
      const ownerSpanMatch = section.match(/class="ownername">\s*-\s*([^<]+)</);

      const ownerName = ownerTitleMatch 
        ? ownerTitleMatch[1].trim() 
        : (ownerSpanMatch ? ownerSpanMatch[1].trim() : "Unknown Owner");

      // ------------------------------

      const rowMatches = section.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs);

      for (const row of rowMatches) {
        const rowContent = row[1];
        if (rowContent.includes('<th')) continue;
        
        // Extract player details
        const playerMatch = rowContent.match(/<td class="player">(.*?)<\/td>/s);
        const yearsMatch = rowContent.match(/<td class="contractyear">([^<]*)<\/td>/);
        const keeperMatch = rowContent.match(/<td class="contractinfo">([^<]*)/);
        const acquiredMatch = rowContent.match(/<td class="drafted">([^<]*)<\/td>/);

        if (playerMatch) {
          // Clean up player name (remove HTML tags inside the name cell)
          const cleanPlayerName = playerMatch[1].replace(/<[^>]*>/g, '').trim();

          players.push({
            Team: teamName,
            Owner: ownerName,
            Player: cleanPlayerName,
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