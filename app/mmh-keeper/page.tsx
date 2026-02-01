'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Users, XCircle, CheckCircle, AlertCircle, DollarSign, Shield } from 'lucide-react';

interface MMHPlayer {
  Player: string;
  Team: string;
  Owner: string;
  Salary: string; // Current Salary
  Base: string;   // Keeper Base Salary
  Years: string;  // Contract Years
  Info: string;   // Rookie Info (R25, etc)
  Acquired: string;
  IsTaxi: boolean;
}

function calculateMMHKeeperStatus(player: MMHPlayer) {
  if (!player || !player.Player) return { eligible: false, cost: 0, reason: 'Invalid Data' };

  // 1. Parse Money Values
  const currentSalary = parseFloat(player.Salary) || 0;
  const keeperBase = parseFloat(player.Base) || 0;
  const currentYears = parseInt(player.Years) || 0;
  
  // 2. Determine Position (for Minimum Salary Rule)
  // Format is usually "Name Team Pos" e.g., "Tucker, Justin BAL K"
  const isKicker = player.Player.includes(' K') || player.Player.includes('(K)');
  const minSalary = isKicker ? 3 : 5;

  // 3. Determine Max Contract Length (Rookie Rule)
  // Rule: Rookie acquired via Rookie Draft (Info has "R2x-x.xx") = 5 Years
  // Rule: Others = 3 Years
  // We check if Info contains a hyphen/dot structure typical of draft picks (e.g., R24-1.05)
  // Or if it simply says R25 (Current Rookie)
  const isDraftedRookie = /R\d{2}-\d/.test(player.Info) || /R\d{2}/.test(player.Info); 
  const maxYears = isDraftedRookie ? 5 : 3;

  // 4. Calculate Years Remaining
  // Rule: Current Years - 1
  const yearsRemaining = currentYears - 1;

  // Check Eligibility based on years
  if (yearsRemaining <= 0 && currentYears > 0) {
    return {
      eligible: false,
      cost: 0,
      reason: 'Contract Expired',
      yearsRemaining: 0,
      isTaxi: player.IsTaxi
    };
  }

  // 5. Calculate New Salary
  let newCost = 0;

  if (player.IsTaxi) {
    // Taxi Rule: No salary increase, retain rookie draft salary
    newCost = currentSalary;
  } else {
    // Standard Rule: (Higher of Base vs Salary) + 25%, rounded up
    const baseCalculation = Math.max(currentSalary, keeperBase);
    const increase = baseCalculation * 1.25;
    newCost = Math.ceil(increase);

    // Apply Minimums
    // Example 1 Rule: If calculated cost is below min, raise to min.
    if (newCost < minSalary) {
      newCost = minSalary;
    }
  }

  return {
    eligible: true,
    cost: newCost,
    reason: null,
    yearsRemaining: Math.max(0, yearsRemaining), // Don't show negative
    isDraftedRookie,
    isTaxi: player.IsTaxi,
    maxYears
  };
}

export default function MMHKeeperApp() {
  const [players, setPlayers] = useState<MMHPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/mmh-league-data');
        if (!response.ok) throw new Error('Failed to fetch MMH data');
        const data = await response.json();
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
        status: calculateMMHKeeperStatus(player)
      });
    });
    return Array.from(teamMap.values());
  }, [players]);

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

  if (isLoading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-400 font-mono">
      <div className="animate-pulse">Initializing MMH Salary Protocols...</div>
    </div>
  );

  if (error) return <div className="min-h-screen bg-zinc-950 text-red-500 p-10">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;900&display=swap');
        `}</style>

        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href="/" className="text-xs font-mono text-emerald-500 hover:text-emerald-400 mb-2 block">
              ← RETURN TO HUB
            </Link>
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl font-black tracking-tight text-white font-[Inter]">
                MMH <span className="text-emerald-400">SALARY CAP</span>
              </h1>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search player database..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-emerald-500 font-mono text-sm"
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="all">ALL FRANCHISES</option>
              {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
          </div>

          {/* Teams Grid */}
          <div className="space-y-8">
            {filteredTeams.map((team: any) => (
              <div key={team.name} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/50">
                <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white font-[Inter]">{team.name}</h2>
                    <p className="text-zinc-500 text-sm font-mono">{team.owner}</p>
                  </div>
                  <div className="bg-zinc-800 px-3 py-1 rounded text-xs font-mono text-zinc-400">
                    CAP SPACE: $--
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-mono text-zinc-500 bg-zinc-950/50 uppercase tracking-wider">
                        <th className="px-6 py-3">Player</th>
                        <th className="px-6 py-3">Current Sal</th>
                        <th className="px-6 py-3">Base</th>
                        <th className="px-6 py-3">2026 Cost</th>
                        <th className="px-6 py-3">Contract</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {team.players.map((p: any, i: number) => (
                        <tr key={i} className={`group hover:bg-zinc-800/50 transition-colors ${!p.status.eligible ? 'opacity-40 grayscale' : ''}`}>
                          <td className="px-6 py-4 font-medium text-sm flex flex-col">
                            <span className="text-white">{p.Player}</span>
                            <span className="text-xs text-zinc-500 font-mono mt-1">
                              {p.status.isTaxi && <span className="bg-yellow-500/10 text-yellow-500 px-1 rounded mr-2">TAXI</span>}
                              {p.status.isDraftedRookie && <span className="text-blue-400">Rookie Contract</span>}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 font-mono text-sm">${p.Salary}</td>
                          <td className="px-6 py-4 text-zinc-500 font-mono text-xs">${p.Base}</td>
                          <td className="px-6 py-4">
                            {p.status.eligible ? (
                              <div className="font-mono font-bold text-emerald-400 text-lg">
                                ${p.status.cost}
                              </div>
                            ) : (
                              <span className="text-zinc-600 font-mono">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className={`font-mono font-bold ${p.status.yearsRemaining === 1 ? 'text-red-400' : 'text-zinc-300'}`}>
                                {p.status.yearsRemaining} Yrs
                              </span>
                              <span className="text-[10px] text-zinc-600 uppercase">
                                Max: {p.status.maxYears}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {p.status.eligible ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase">
                                <XCircle className="w-4 h-4" /> {p.status.reason}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}