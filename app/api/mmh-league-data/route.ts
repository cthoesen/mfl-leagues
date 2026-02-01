import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

// --- MMH TEAM OWNERS LOOKUP ---
// Please update these names to match the MMH league owners!
const TEAM_OWNERS: Record<string, string> = {
  "Fat Guy in a Little Coat": "Corey Thoesen",
  "Tenacious D": "Paul Houser",
  "Adrenaline Mob": "Chuck Majewski",
  "BreakTables": "Neal Skillman",
  "Stephen Grigg": "Stephen Grigg",
  "Bench Don't Kill My Vibe": "Ivan Black",
  "WASHINGTON FANTASY TEAM": "Joshua Lee",
  "Beetlejuice": "Ron Pittman",
  "Pigskin Reapers": "George VanDuzer",
  "New Team": "Andrew Combs",
  "Twisters Auction": "Drew Stephen", // Note: I removed the extra space from the end if it existed
  "Twisters Auction ": "Drew Stephen", // Kept this just in case MFL has the typo
  "I'm Drunk Bitches!!": "Paul Pultz",
  // Add your MMH teams here...
};

export async function GET() {
  // MMH Rosters Report URL
  const MFL_URL = "https://www47.myfantasyleague.com/2025/options?L=72966&O=07&PRINTER=1";
  
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

      // 1. Get Team Name
      const teamMatch = section.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const rawTeamName = teamMatch ? teamMatch[1].trim() : "Unknown Team";
      
      // 2. Get Owner Name (Using Lookup Table)
      const ownerName = TEAM_OWNERS[rawTeamName] || rawTeamName; // Fallback to team name if owner not found

      // 3. Process Rows (Handling Taxi Squad detection)
      // We split by <tr> to process top-down so we know when we hit the Taxi Squad section
      const rows = section.split('<tr');
      let isTaxiSquad = false;

      for (const rowFragment of rows) {
        // Restore the <tr to make regex easier (optional but cleaner)
        const row = '<tr' + rowFragment;

        // Check for Taxi Squad Header
        // The header looks like: <tr><th colspan="8">Taxi Squad</th></tr>
        if (row.includes('Taxi Squad') && row.includes('<th')) {
          isTaxiSquad = true;
          continue;
        }

        // Check if this is a Player Row
        if (!row.includes('class="player"')) continue;

        // Extract Data Columns
        const playerMatch = row.match(/class="player">(.*?)<\/td>/s);
        const salaryMatch = row.match(/class="salary">(.*?)<\/td>/);
        const yearsMatch = row.match(/class="contractyear">(.*?)<\/td>/);
        const baseMatch = row.match(/class="contractstatus">(.*?)<\/td>/); // Keeper Base
        const infoMatch = row.match(/class="contractinfo">(.*?)<\/td>/);   // Rookie Info
        const acquiredMatch = row.match(/class="drafted">(.*?)<\/td>/);

        if (playerMatch) {
          const cleanPlayerName = playerMatch[1].replace(/<[^>]*>/g, '').trim();
          
          players.push({
            Team: rawTeamName,
            Owner: ownerName,
            Player: cleanPlayerName,
            Salary: salaryMatch ? salaryMatch[1].replace(/[^0-9.]/g, '') : '0', // Remove '$'
            Years: yearsMatch ? yearsMatch[1].trim() : '',
            Base: baseMatch ? baseMatch[1].replace(/[^0-9.]/g, '') : '0', // Remove '$'
            Info: infoMatch ? infoMatch[1].replace(/<[^>]*>/g, '').trim() : '', // e.g., "R25"
            Acquired: acquiredMatch ? acquiredMatch[1].trim() : '',
            IsTaxi: isTaxiSquad
          });
        }
      }
    }

    return NextResponse.json(players);
    
  } catch (error: any) {
    console.error("MMH API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}