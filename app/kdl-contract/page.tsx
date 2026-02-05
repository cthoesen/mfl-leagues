'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Crown, ArrowLeft, Shield } from 'lucide-react';

interface KDLPlayer {
  Player: string;
  Position: string; 
  Team: string;
  Owner: string;
  Salary: string;
  Years: string;
  IsTaxi: boolean;
}

interface TagValues {
  [position: string]: {
    franchise: number; // Avg of Top 5
    restricted: number; // Avg of Top 10
  }
}

// --- HELPER: CALCULATE LEAGUE-WIDE TAG BASELINES ---
function calculateTagBaselines(allPlayers: KDLPlayer[]): TagValues {
  // Common MFL positions + IDP
  const positions = ['QB', 'RB', 'WR', 'TE', 'PK', 'DT', 'DE', 'LB', 'CB', 'S'];
  const baselines: TagValues = {};

  positions.forEach(pos => {
    // 1. Filter by position (Match " Pos" at end of string or explicit field)
    const posPlayers = allPlayers.filter(p => p.Position === pos || p.Player.endsWith(` ${pos}`));
    
    // 2. Get all salaries, sort descending
    const salaries = posPlayers
      .map(p => parseFloat(p.Salary) || 0)
      .sort((a, b) => b - a);

    // 3. Avg Top 5 (Franchise)
    const top5 = salaries.slice(0, 5);
    const avgTop5 = top5.length > 0 ? top5.reduce((a, b) => a + b, 0) / top5.length : 0;

    // 4. Avg Top 10 (Restricted)
    const top10 = salaries.slice(0, 10);
    const avgTop10 = top10.length > 0 ? top10.reduce((a, b) => a + b, 0) / top10.length : 0;

    baselines[pos] = { franchise: avgTop5, restricted: avgTop10 };
  });

  return baselines;
}

function calculatePlayerStatus(player: KDLPlayer, tagBaselines: TagValues) {
  const salary = parseFloat(player.Salary) || 0;
  const years = parseInt(player.Years) || 0;
  
  // Normalize Position for Lookup
  let pos = player.Position;
  if (!tagBaselines[pos]) {
    // Fallback: Try to find known pos in name if extraction failed
    ['QB', 'RB', 'WR', 'TE', 'PK', 'DT', 'DE', 'LB', 'CB', 'S'].forEach(p => {
      if (player.Player.endsWith(` ${p}`)) pos = p;
    });
  }

  const baseline = tagBaselines[pos] || { franchise: 0, restricted: 0 };

  // --- TAG CALCULATIONS ---
  // Franchise: Max(AvgTop5, 120% Salary)
  const franchiseCost = Math.max(baseline.franchise, salary * 1.2);
  
  // Restricted: Max(AvgTop10, 110% Salary)
  const restrictedCost = Math.max(baseline.restricted, salary * 1.1);

  return {
    salary,
    years,
    franchiseCost: Math.ceil(franchiseCost),
    restrictedCost: Math.ceil(restrictedCost),
    isExpiring: years === 0, // Only show tag options if expiring
    isTaxi: player.IsTaxi
  };
}

export default function KDLContractApp() {
  const [players, setPlayers] = useState<KDLPlayer[]>([]);
  const [tagBaselines, setTagBaselines] = useState<TagValues>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/kdl-league-data');
        if (!response.ok) throw new Error('Failed to fetch KDL data');
        const data = await response.json();
        
        // Calculate Tag Baselines immediately using ALL data
        const baselines = calculateTagBaselines(data);
        console.log("Tag Baselines:", baselines); // For debugging
        setTagBaselines(baselines);
        setPlayers(data);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const teams = useMemo(() => {
    const teamMap = new Map();
    players.forEach(player => {
      if (!teamMap.has(player.Team)) {
        teamMap.set(player.Team, { name: player.Team, owner: player.Owner, players: [] });
      }
      teamMap.get(player.Team).players.push({
        ...player,
        status: calculatePlayerStatus(player, tagBaselines)
      });
    });
    return Array.from(teamMap.values());
  }, [players, tagBaselines]);

  const filteredTeams = useMemo(() => {
    let result = teams;
    if (selectedTeam !== 'all') result = result.filter(t => t.name === selectedTeam);
    if (searchTerm) {
      result = result.map(t => ({
        ...t,
        players: t.players.filter((p: any) => p.Player.toLowerCase().includes(searchTerm.toLowerCase()))
      })).filter(t => t.players.length > 0);
    }
    return result;
  }, [teams, selectedTeam, searchTerm]);

  // --- STATS HELPER ---
  const getTeamStats = (players: any[]) => {
    const SALARY_CAP = 1000;
    const YEARS_CAP = 65;
    
    // Taxi Squad Exemptions
    const activePlayers = players.filter(p => !p.status.isTaxi);
    
    const totalSalary = activePlayers.reduce((sum, p) => sum + p.status.salary, 0);
    const totalYears = activePlayers.reduce((sum, p) => sum + p.status.years, 0);

    return {
      salaryCap: SALARY_CAP,
      salaryUsed: totalSalary,
      salarySpace: SALARY_CAP - totalSalary,
      yearsCap: YEARS_CAP,
      yearsUsed: totalYears,
      yearsSpace: YEARS_CAP - totalYears
    };
  };

  if (isLoading) return (
    <div className="min-h-screen cyber-bg flex items-center justify-center">
      <div className="text-violet-400 font-mono animate-pulse text-xl">
        ANALYZING DYNASTY CONTRACTS...
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen cyber-bg p-8 text-rose-500">Error: {error}</div>
  );

  return (
    <div className="min-h-screen cyber-bg">
      <div className="scan-line" />
      
      {/* Header */}
      <div className="relative z-10 border-b border-violet-900/30 bg-black/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/kdl" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-xs font-mono mb-2">
            <ArrowLeft size={12} /> RETURN TO DASHBOARD
          </Link>
          <div className="flex items-center gap-3">
            <Crown size={32} className="text-violet-400" />
            <h1 className="text-2xl font-black gradient-text-violet glow-violet tracking-wide">
              KDL CONTRACT MANAGER
            </h1>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Controls */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search player, position, or salary..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-zinc-100 focus:border-violet-500 outline-none font-mono"
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <select 
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:border-violet-500 outline-none font-mono"
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="all">ALL FRANCHISES</option>
            {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        {/* Teams List */}
        <div className="space-y-8">
          {filteredTeams.map((team: any) => {
            const stats = getTeamStats(team.players);
            return (
              <div key={team.name} className="cyber-card border-violet-500/20">
                {/* Team Header */}
                <div className="p-6 border-b border-zinc-800/50 bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{team.name}</h2>
                    <p className="text-zinc-500 text-sm font-mono">{team.owner}</p>
                  </div>

                  {/* Cap Dashboard */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-center">
                      <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Cap Space ($1000)</div>
                      <div className={`text-xl font-mono font-bold ${stats.salarySpace < 0 ? 'text-rose-500' : 'text-violet-400'}`}>
                        ${stats.salarySpace}
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 text-center opacity-60">
                      <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Active Salary</div>
                      <div className="text-lg font-mono text-zinc-400">${stats.salaryUsed}</div>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-center">
                      <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Years Space (65)</div>
                      <div className={`text-xl font-mono font-bold ${stats.yearsSpace < 0 ? 'text-rose-500' : 'text-violet-400'}`}>
                        {stats.yearsSpace}
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 text-center opacity-60">
                      <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Active Years</div>
                      <div className="text-lg font-mono text-zinc-400">{stats.yearsUsed}</div>
                    </div>
                  </div>
                </div>
                
                {/* Roster Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/50 text-xs text-zinc-500 uppercase font-bold tracking-wider">
                        <th className="px-6 py-3">Player</th>
                        <th className="px-6 py-3">Salary</th>
                        <th className="px-6 py-3">Years</th>
                        <th className="px-6 py-3 text-center">Franchise Tag</th>
                        <th className="px-6 py-3 text-center">Restricted Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {team.players.map((p: any, i: number) => (
                        <tr key={i} className={`hover:bg-violet-500/5 transition-colors ${p.status.isTaxi ? 'opacity-70 bg-amber-500/5' : ''}`}>
                          <td className="px-6 py-3">
                            <div className="font-bold text-zinc-200">{p.Player}</div>
                            <div className="flex gap-2 mt-1">
                              {p.status.isTaxi && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-mono">
                                  TAXI
                                </span>
                              )}
                              {p.status.isExpiring && !p.status.isTaxi && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/30 font-mono animate-pulse">
                                  EXPIRING
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 font-mono text-violet-300">
                            ${p.status.salary}
                          </td>
                          <td className="px-6 py-3">
                             <span className={`font-mono font-bold ${p.status.years === 0 ? 'text-rose-500' : 'text-zinc-400'}`}>
                               {p.status.years}
                             </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            {p.status.years === 0 ? (
                              <div className="inline-block bg-zinc-950 border border-violet-500/30 rounded px-3 py-1">
                                <span className="block text-[10px] text-zinc-500 uppercase">Tag Cost</span>
                                <span className="font-mono text-violet-400 font-bold">${p.status.franchiseCost}</span>
                              </div>
                            ) : (
                              <span className="text-zinc-700 font-mono">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-center">
                            {p.status.years === 0 ? (
                              <div className="inline-block bg-zinc-950 border border-cyan-500/30 rounded px-3 py-1">
                                <span className="block text-[10px] text-zinc-500 uppercase">Tag Cost</span>
                                <span className="font-mono text-cyan-400 font-bold">${p.status.restrictedCost}</span>
                              </div>
                            ) : (
                              <span className="text-zinc-700 font-mono">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}