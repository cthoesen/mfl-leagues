import { NextResponse } from 'next/server';

// 1. Force dynamic (server-side only)
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
    
    // Split by caption to isolate each team's table
    const sections = htmlText.split('<caption');

    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];

      // --- ROBUST OWNER PARSING ---
      
      // 1. Team Name: Find text inside the first anchor tag
      const teamMatch = section.match(/>([^<]+)<\/a>/);
      const teamName = teamMatch ? teamMatch[1].trim() : "Unknown Team";

      // 2. Owner Name: 
      // Strategy A: "Broad Search" for the Owner string pattern (Most Robust)
      // Matches: "Owner: Corey Thoesen, Record" -> Captures "Corey Thoesen"
      const ownerTitleMatch = section.match(/Owner:\s*([^,]+?),\s*Record/i);
      
      // Strategy B: The span class fallback
      // Matches: class="ownername"> - Corey Thoesen</span>
      const ownerSpanMatch = section.match(/class=["']ownername["'][^>]*>(.*?)<\/span>/i);

      let ownerName = "Unknown Owner";
      
      if (ownerTitleMatch) {
        ownerName = ownerTitleMatch[1].trim();
      } else if (ownerSpanMatch) {
        // Clean up the span text (remove "- " or "&nbsp;- ")
        ownerName = ownerSpanMatch[1].replace(/^[\s-&nbsp;]+/, '').trim();
      }
      
      // ---------------------------

      const rowMatches = section.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs);

      for (const row of rowMatches) {
        const rowContent = row[1];
        if (rowContent.includes('<th')) continue;
        
        const playerMatch = rowContent.match(/<td class="player">(.*?)<\/td>/s);
        const yearsMatch = rowContent.match(/<td class="contractyear">([^<]*)<\/td>/);
        const keeperMatch = rowContent.match(/<td class="contractinfo">([^<]*)/);
        const acquiredMatch = rowContent.match(/<td class="drafted">([^<]*)<\/td>/);

        if (playerMatch) {
          // Clean up player name by removing HTML tags (like <a>)
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