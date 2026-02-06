import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  // OFFICIAL WEEK 12 SNAPSHOT for Tag Baselines
  const MFL_URL = "https://www47.myfantasyleague.com/2025/options?L=68756&O=07&WEEK=12&PRINTER=1";
  
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
      // We need team names to show who holds the top contracts
      const teamMatch = section.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const rawTeamName = teamMatch ? teamMatch[1].trim() : "Unknown Team";

      const rows = section.split('<tr');

      for (const rowFragment of rows) {
        const row = '<tr' + rowFragment;
        if (!row.includes('class="player"')) continue;

        const playerMatch = row.match(/class="player">([\s\S]*?)<\/td>/);
        const salaryMatch = row.match(/class="salary">([\s\S]*?)<\/td>/);

        if (playerMatch) {
          const clean = (text: string) => text.replace(/<[^>]*>/g, '').trim();
          
          const pName = clean(playerMatch[1]);
          const pSalary = salaryMatch ? clean(salaryMatch[1]).replace(/[^0-9.]/g, '') : '0';
          
          // Position Extraction
          const nameParts = pName.split(' ');
          const rawPos = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'UNK';
          const position = rawPos.replace(/[^a-zA-Z]/g, '');

          players.push({
            Team: rawTeamName,
            Player: pName,
            Position: position,
            Salary: pSalary,
          });
        }
      }
    }

    return NextResponse.json(players);
    
  } catch (error: any) {
    console.error("KDL Tag Data Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}