// app/api/kkl-league-data/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const MFL_URL = "https://www47.myfantasyleague.com/2025/options?L=45267&O=07&PRINTER=1";
  
  try {
    const response = await fetch(MFL_URL, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch MFL data" }, { status: 500 });
    }
    
    const htmlText = await response.text();
    const players: any[] = [];

    // Split by table captions (team headers)
    const sections = htmlText.split('<caption');

    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];

      // Extract Team Name from anchor tag and Owner from ownername span
      const teamMatch = section.match(/<a[^>]*>([^<]+)<\/a>/);
      const ownerMatch = section.match(/<span class="ownername">\s*-\s*([^<]+)<\/span>/);
      
      const teamName = teamMatch ? teamMatch[1].trim() : "Unknown Team";
      const ownerName = ownerMatch ? ownerMatch[1].trim() : "Unknown Owner";

      // Find all table rows
      const rowMatches = section.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs);

      for (const row of rowMatches) {
        const rowContent = row[1];
        
        // Skip if this is a header row (has th tags)
        if (rowContent.includes('<th')) continue;
        
        // Extract player name
        const playerMatch = rowContent.match(/<td class="player">(.*?)<\/td>/s);
        if (!playerMatch) continue;
        const playerText = playerMatch[1].replace(/<[^>]*>/g, '').trim();
        
        // Extract contractyear (Years)
        const yearsMatch = rowContent.match(/<td class="contractyear">([^<]*)<\/td>/);
        const years = yearsMatch ? yearsMatch[1].trim() : '';
        
        // Extract contractinfo (Keeper) - malformed HTML, no closing tag
        const keeperMatch = rowContent.match(/<td class="contractinfo">([^<]*)/);
        let keeper = '';
        if (keeperMatch) {
          keeper = keeperMatch[1].replace(/\n/g, ' ').trim();
        }
        
        // Extract drafted (Acquired)
        const acquiredMatch = rowContent.match(/<td class="drafted">([^<]*)<\/td>/);
        const acquired = acquiredMatch ? acquiredMatch[1].trim() : '';
        
        players.push({
          Team: teamName,
          Owner: ownerName,
          Player: playerText,
          Years: years,
          Keeper: keeper,
          Acquired: acquired
        });
      }
    }
    
    return NextResponse.json(players);

  } catch (error: any) {
    console.error("Error in KKL league-data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
