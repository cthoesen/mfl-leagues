import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

// --- 1. THE LOOKUP TABLE ---
// I've pre-filled this with the data from your original project.
// If a name is wrong or missing, just edit it right here!
const TEAM_OWNERS: Record<string, string> = {
  "Hipster Doofus": "Corey Thoesen",
  "Midnight Marauders": "Rodney Sasher",
  "Wa Wa Wee Wa": "Mike Stein", // Note: I removed the extra space from the end if it existed
  "Wa Wa Wee Wa ": "Mike Stein", // Kept this just in case MFL has the typo
  "Over the Hill and Tua the Waddle we go!": "Craig Wiesen",
  "Phoenix Force": "Chris Culbreath",
  "Guinness All Blacks": "Rob Sherman",
  "Karaoke Craig": "Ever Rivera",
  "Foladelphia Iggles": "Mike Foley",
  "Sleepy Hollow Stranglers": "Damien Long",
  "Hail Marys": "Bill Davidson",
  "Fightin Irish Mist": "Craig Mayo",
  "BoRaDLeSHoW": "Brad Thoesen", // Note: I removed the extra space from the end if it existed
  "BoRaDLeSHoW ": "Brad Thoesen", // Kept this just in case MFL has the typo
  // If there is a 12th team not listed here, add it below:
  // "Team Name From MFL Site": "Owner Name"
};

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

      // --- SIMPLIFIED LOGIC ---
      
      // 1. Extract Team Name
      const teamMatch = section.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const rawTeamName = teamMatch ? teamMatch[1].trim() : "Unknown Team";
      
      // 2. Look up Owner directly (No HTML parsing needed!)
      // We default to "Unknown Owner" only if the team isn't in your list above
      const ownerName = TEAM_OWNERS[rawTeamName] || "Unknown Owner";

      // Log if we miss one so you can fix the list
      if (ownerName === "Unknown Owner" && rawTeamName !== "Unknown Team") {
        console.warn(`MISSING OWNER for team: "${rawTeamName}"`);
      }

      // ------------------------

      const rowMatches = section.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs);

      for (const row of rowMatches) {
        const rowContent = row[1];
        if (rowContent.includes('<th')) continue;
        
        const playerMatch = rowContent.match(/<td class="player">(.*?)<\/td>/s);
        const yearsMatch = rowContent.match(/<td class="contractyear">([^<]*)<\/td>/);
        const keeperMatch = rowContent.match(/<td class="contractinfo">([^<]*)/);
        const acquiredMatch = rowContent.match(/<td class="drafted">([^<]*)<\/td>/);

        if (playerMatch) {
          const cleanPlayerName = playerMatch[1].replace(/<[^>]*>/g, '').trim();

          players.push({
            Team: rawTeamName,
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