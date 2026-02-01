import { NextResponse } from 'next/server';

// 1. Force dynamic (server-side only) to prevent caching stale data
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
      console.error(`MFL Fetch Error: ${response.status}`);
      return NextResponse.json({ error: "Failed to fetch MFL data" }, { status: 500 });
    }
    
    const htmlText = await response.text();
    const players = [];
    
    // Split by caption to isolate each team's table
    const sections = htmlText.split('<caption');

    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];

      // --- ROBUST PARSING LOGIC ---
      
      // 1. Team Name: Find text inside the first anchor tag
      // We use [\s\S]*? to ensure we match even if there are newlines inside the tag
      const teamMatch = section.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const teamName = teamMatch ? teamMatch[1].trim() : "Unknown Team";

      // 2. Owner Name: Try multiple strategies
      let ownerName = "Unknown Owner";

      // Strategy A: The "title" attribute (Hidden metadata)
      // Matches: title="Owner: Corey Thoesen,"
      const titleMatch = section.match(/title=["']Owner:\s*([^,]+)/i);
      
      // Strategy B: The "ownername" class (Visual text)
      // Matches: class="ownername"> - Corey Thoesen</span>
      const classMatch = section.match(/class=["']ownername["'][^>]*>([\s\S]*?)<\/span>/i);

      if (titleMatch) {
        ownerName = titleMatch[1].trim();
      } else if (classMatch) {
        // Remove leading dashes, spaces, or HTML entities like &nbsp;
        ownerName = classMatch[1].replace(/^[\s\W]+/, '').replace(/&nbsp;/g, '').trim();
      }
      
      // Log warning if we still can't find an owner (check your server console)
      if (ownerName === "Unknown Owner") {
        console.warn(`Could not find owner for team: ${teamName}`);
      }

      // ---------------------------

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