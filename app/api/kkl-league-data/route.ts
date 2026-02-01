// API route to fetch and parse KKL league data from MyFantasyLeague

export async function GET() {
  const MFL_URL = "https://www47.myfantasyleague.com/2025/options?L=45267&O=07&PRINTER=1";
  
  try {
    const response = await fetch(MFL_URL);
    if (!response.ok) {
      return Response.json({ error: "Failed to fetch MFL data" }, { status: 500 });
    }
    
    const htmlText = await response.text();
    const players = [];

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
        
        // MFL has malformed HTML - contractinfo td is not closed properly
        // We need to extract data more carefully
        
        // Extract player name
        const playerMatch = rowContent.match(/<td class="player">(.*?)<\/td>/s);
        if (!playerMatch) continue;
        const playerText = playerMatch[1].replace(/<[^>]*>/g, '').trim();
        
        // Extract points (ignore)
        // Extract week/bye (ignore)
        
        // Extract contractyear (Years)
        const yearsMatch = rowContent.match(/<td class="contractyear">([^<]*)<\/td>/);
        const years = yearsMatch ? yearsMatch[1].trim() : '';
        
        // Extract contractinfo (Keeper) - this one doesn't have a closing tag!
        // Pattern: <td class="contractinfo">K11 or <td class="contractinfo"> (blank) followed by <td class="drafted">
        const keeperMatch = rowContent.match(/<td class="contractinfo">([^<]*)/);
        let keeper = '';
        if (keeperMatch) {
          // The content might have a newline and continue on next line
          const keeperContent = keeperMatch[1].trim();
          // Remove any trailing "K" numbers that might span lines
          keeper = keeperContent.replace(/\n/g, ' ').trim();
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
    
    console.log("Parsed players sample:", players.slice(0, 5)); // Log first 5 for debugging
    console.log("Total players parsed:", players.length);
    
    return Response.json(players, {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300" // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error("Error in KKL league-data:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
