import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

// --- BSB TEAM OWNERS LOOKUP ---
// Update these with the actual BSB owner names
const TEAM_OWNERS: Record<string, string> = {
  "The One Who Knocks": "Corey Thoesen",
  "Victorious Secret": "Joshua Scott",
  "WWJeff": "Jeff Reeve",
  "I'm Drunk Bitches!!": "Paul Pultz",
  "Keep Austin Weirder": "George Dugan", // Note: I removed the extra space from the end if it existed
  "Keep Austin Weirder ": "George Dugan", // Kept this just in case MFL has the typo
  "Moneyball": "Jesse Jimenez",
  "Memory Hole": "Ken Goldberg",
  "Fourth & Fondle": "Jared Higgins",
  "Stephen Hawking’s Football Cleats": "Tyler Beck",
  "Grit Happens": "Josiah James",
  "Ball Sacks n All That": "Kyle Kober",
  "Urine Trouble": "Mike Pollack",
  "Appleton Avalanche": "Scott Sell", // Note: I removed the extra space from the end if it existed
  "Appleton Avalanche ": "Scott Sell", // Kept this just in case MFL has the typo
  "89ers": "Mike Stewart",
  "Cajun Wild Turkeys": "Mark Bergeaux, Daryl Cetnar",
  "CJ Oliva Franchise": "CJ Oliva",
  // Add all 16 teams above...
};

export async function GET() {
  const MFL_URL = "https://www47.myfantasyleague.com/2025/options?L=62908&O=07&PRINTER=1";
  
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

      // 1. Get Team Name & Owner
      const teamMatch = section.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const rawTeamName = teamMatch ? teamMatch[1].trim() : "Unknown Team";
      const ownerName = TEAM_OWNERS[rawTeamName] || rawTeamName;

      // 2. Process Rows
      const rows = section.split('<tr');
      let isTaxiSquad = false;

      for (const rowFragment of rows) {
        const row = '<tr' + rowFragment;

        // Check for Taxi Squad Header
        if (row.includes('Taxi Squad') && row.includes('<th')) {
          isTaxiSquad = true;
          continue;
        }

        if (!row.includes('class="player"')) continue;

        // 3. Robust Data Extraction
        const playerMatch = row.match(/class="player">([\s\S]*?)<\/td>/);
        const yearsMatch = row.match(/class="contractyear">([\s\S]*?)<\/td>/);
        const acquiredMatch = row.match(/class="drafted">([\s\S]*?)<\/td>/);

        if (playerMatch) {
          const clean = (text: string) => text.replace(/<[^>]*>/g, '').trim();

          players.push({
            Team: rawTeamName,
            Owner: ownerName,
            Player: clean(playerMatch[1]),
            Years: yearsMatch ? clean(yearsMatch[1]) : '',
            Acquired: acquiredMatch ? clean(acquiredMatch[1]) : '',
            IsTaxi: isTaxiSquad
          });
        }
      }
    }

    return NextResponse.json(players);
    
  } catch (error: any) {
    console.error("BSB API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}