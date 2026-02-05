import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// --- KDL TEAM OWNERS LOOKUP ---
// Update with actual KDL owners
const TEAM_OWNERS: Record<string, string> = {
  "Fargin Sneaky Bastages": "Corey Thoesen",
  "Marauders": "Rodney Sasher", // Note: I removed the extra space from the end if it existed
  "Marauders ": "Rodney Sasher", // Kept this just in case MFL has the typo
  "The W's": "Chris Culbreath",
  "Fightin' Irish Mist": "Craig Mayo",
  "CommishThePhish": "Craig Wiesen",
  "Pigskin Prophets": "Ryan Bassett",
  "13 seconds Never again!": "Ever Rivera", // Note: I removed the extra space from the end if it existed
  "13 seconds Never again! ": "Ever Rivera", // Kept this just in case MFL has the typo
  "💪HuRRiCaNe DiTKa 💪": "Brad Thoesen", // Note: I removed the extra space from the end if it existed
  " 💪HuRRiCaNe DiTKa 💪 ": "Brad Thoesen", // Kept this just in case MFL has the typo
  "I'm Drunk Bitches!!": "Paul Pultz",
  "Victorious Secret": "Josh Scott",
  "Twisters": "Drew Stephen",
  "Tenacious D": "Paul Houser",
  // Add all 12 teams here...
};

export async function GET() {
  const MFL_URL = "https://www47.myfantasyleague.com/2025/options?L=68756&O=07&PRINTER=1";
  
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

        if (row.includes('Taxi Squad') && row.includes('<th')) {
          isTaxiSquad = true;
          continue;
        }

        if (!row.includes('class="player"')) continue;

        // 3. Extraction
        const playerMatch = row.match(/class="player">([\s\S]*?)<\/td>/);
        const salaryMatch = row.match(/class="salary">([\s\S]*?)<\/td>/);
        const yearsMatch = row.match(/class="contractyear">([\s\S]*?)<\/td>/);
        const statusMatch = row.match(/class="contractstatus">([\s\S]*?)<\/td>/);
        const infoMatch = row.match(/class="contractinfo">([\s\S]*?)<\/td>/);

        if (playerMatch) {
          const clean = (text: string) => text.replace(/<[^>]*>/g, '').trim();
          
          const pName = clean(playerMatch[1]);
          const pSalary = salaryMatch ? clean(salaryMatch[1]).replace(/[^0-9.]/g, '') : '0';
          const pYears = yearsMatch ? clean(yearsMatch[1]) : '0';
          const pStatus = statusMatch ? clean(statusMatch[1]) : '';
          const pInfo = infoMatch ? clean(infoMatch[1]) : '';
          
          // Position Extraction
          const nameParts = pName.split(' ');
          const rawPos = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'UNK';
          const position = rawPos.replace(/[^a-zA-Z]/g, '');

          players.push({
            Team: rawTeamName,
            Owner: ownerName,
            Player: pName,
            Position: position,
            Salary: pSalary,
            Years: pYears,
            Status: pStatus, // e.g. "R25"
            Info: pInfo,     // e.g. "4.04"
            IsTaxi: isTaxiSquad
          });
        }
      }
    }

    return NextResponse.json(players);
    
  } catch (error: any) {
    console.error("KDL API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}