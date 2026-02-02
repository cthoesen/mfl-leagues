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

        // 3. Robust Extraction (Now handles newlines [\s\S]*? and strips tags)
        
        // Player Name
        const playerMatch = row.match(/class="player">([\s\S]*?)<\/td>/);
        
        // Salary (removes $ and commas)
        const salaryMatch = row.match(/class="salary">([\s\S]*?)<\/td>/);
        
        // Years
        const yearsMatch = row.match(/class="contractyear">([\s\S]*?)<\/td>/);
        
        // Base Salary
        const baseMatch = row.match(/class="contractstatus">([\s\S]*?)<\/td>/);
        
        // Info (Rookie Status) - IMPORTANT: Use [\s\S] to catch multi-line
        const infoMatch = row.match(/class="contractinfo">([\s\S]*?)<\/td>/);
        
        // Acquired (Draft Pick) - IMPORTANT: Use [\s\S] to catch multi-line
        const acquiredMatch = row.match(/class="drafted">([\s\S]*?)<\/td>/);

        if (playerMatch) {
          // Helper to clean HTML tags and whitespace
          const clean = (text: string) => text.replace(/<[^>]*>/g, '').trim();

          const pName = clean(playerMatch[1]);
          const pSalary = salaryMatch ? clean(salaryMatch[1]).replace(/[^0-9.]/g, '') : '0';
          const pBase = baseMatch ? clean(baseMatch[1]).replace(/[^0-9.]/g, '') : '0';
          const pYears = yearsMatch ? clean(yearsMatch[1]) : '';
          const pInfo = infoMatch ? clean(infoMatch[1]) : '';
          const pAcquired = acquiredMatch ? clean(acquiredMatch[1]) : '';

          players.push({
            Team: rawTeamName,
            Owner: ownerName,
            Player: pName,
            Salary: pSalary,
            Years: pYears,
            Base: pBase,
            Info: pInfo,         // e.g. "R25"
            Acquired: pAcquired, // e.g. "5.10"
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