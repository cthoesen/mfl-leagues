'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Award, XCircle, CheckCircle, AlertCircle, Trophy } from 'lucide-react';

interface Player {
  Team: string;
  Owner: string;
  Player: string;
  Years: string;
  Keeper: string;
  Acquired: string;
}

interface KeeperStatus {
  eligible: boolean;
  reason: string | null;
  nextRound: number | null;
  yearsRemaining: number | null;
  isRookie: boolean;
}

function calculateKeeperStatus(player: Player): KeeperStatus {
  if (!player || !player.Player) {
    return {
      eligible: false,
      reason: 'Invalid player data',
      nextRound: null,
      yearsRemaining: 0,
      isRookie: false
    };
  }

  const isRookie = player.Player.includes('(R)');
  const acquired = player.Acquired?.trim();
  const currentYears = player.Years ? parseInt(player.Years) : null;
  
  // Parse acquired round (format is like "17.06" where 17 is the round)
  let acquiredRound: number | null = null;
  if (acquired) {
    const match = acquired.match(/^(\d+)\./);
    if (match) {
      acquiredRound = parseInt(match[1]);
    }
  }
  
  // Rule: Players drafted in rounds 1-3 are ineligible
  if (acquiredRound && acquiredRound <= 3) {
    return {
      eligible: false,
      reason: 'Drafted in rounds 1-3',
      nextRound: null,
      yearsRemaining: null,
      isRookie
    };
  }
  
  // Calculate years remaining for next season
  let yearsRemaining: number;
  if (currentYears === null || player.Years === '') {
    // Blank years = 3 years remaining next season
    yearsRemaining = 3;
  } else {
    // Subtract 1 from current years
    yearsRemaining = currentYears - 1;
  }
  
  // If years remaining is 0 or less, player is ineligible
  if (yearsRemaining <= 0) {
    return {
      eligible: false,
      reason: 'No keeper years remaining',
      nextRound: null,
      yearsRemaining: 0,
      isRookie
    };
  }
  
  // Calculate next season's draft round
  let nextRound: number;
  if (!acquired) {
    // Blank acquired = 12th round
    nextRound = 12;
  } else if (isRookie) {
    // Rookies stay in same round
    nextRound = acquiredRound!;
  } else {
    // Regular players move up 2 rounds
    nextRound = acquiredRound! - 2;
  }
  
  // Ensure round doesn't go below 1
  if (nextRound < 1) {
    nextRound = 1;
  }
  
  return {
    eligible: true,
    reason: null,
    nextRound: nextRound,
    yearsRemaining: yearsRemaining,
    isRookie: isRookie
  };
}

export default function KKLKeeperApp() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/kkl-league-data');
        if (!response.ok) throw new Error('Failed to fetch league data');
        
        const data = await response.json();
        console.log("Fetched KKL Data:", data);
        setPlayers(data);
      } catch (err: any) {
        setError("Error loading league data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const teams = useMemo(() => {
    const teamMap = new Map();
    players.forEach(player => {
      if (!player.Player) return;
      if (!teamMap.has(player.Team)) {
        teamMap.set(player.Team, { 
          name: player.Team, 
          owner: player.Owner, 
          players: [] 
        });
      }
      teamMap.get(player.Team).players.push({ 
        ...player, 
        keeperStatus: calculateKeeperStatus(player) 
      });
    });
    return Array.from(teamMap.values());
  }, [players]);

  const filteredTeams = useMemo(() => {
    let result = teams;
    if (selectedTeam !== 'all') {
      result = result.filter((t: any) => t.name === selectedTeam);
    }
    if (searchTerm) {
      result = result.map((t: any) => ({
        ...t,
        players: t.players.filter((p: any) => 
          p.Player.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter((t: any) => t.players.length > 0);
    }
    return result;
  }, [teams, selectedTeam, searchTerm]);

  const stats = useMemo(() => {
    const total = players.length;
    const eligible = players.filter(p => calculateKeeperStatus(p).eligible).length;
    const ineligible = total - eligible;
    return { total, eligible, ineligible };
  }, [players]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
          <p className="text-purple-300">Loading KKL keeper data...</p>
        </div>
      </div>
    );
  }

  if (error || players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-300">{error || 'No player data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-500/20 bg-slate-950/50 backdrop-blur-xl">
          <div className="max-w-[1600px] mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-2">
              <Trophy className="w-10 h-10 text-purple-400 flex-shrink-0" />
              <h1 
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400" 
                style={{ fontFamily: '"Bebas Neue", "Impact", cursive' }}
              >
                KKL Keeper Manager
              </h1>
            </div>
            <p 
              className="text-purple-300/60 text-lg ml-14" 
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              2026 Season Planning Tool
            </p>
          </div>
        </header>
        
        {/* Stats Bar */}
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300/60 text-sm uppercase tracking-wider font-bold">Total Players</span>
              </div>
              <div className="text-4xl font-black text-purple-200">{stats.total}</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-950/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300/60 text-sm uppercase tracking-wider font-bold">Eligible</span>
              </div>
              <div className="text-4xl font-black text-green-200">{stats.eligible}</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/40 to-rose-950/40 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300/60 text-sm uppercase tracking-wider font-bold">Ineligible</span>
              </div>
              <div className="text-4xl font-black text-red-200">{stats.ineligible}</div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-purple-500/20 rounded-xl text-purple-100 placeholder-purple-400/40 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-6 py-3 bg-slate-900/50 border border-purple-500/20 rounded-xl text-purple-100 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">All Teams</option>
              {teams.map((team: any) => (
                <option key={team.name} value={team.name}>{team.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Teams Grid */}
        <div className="max-w-[1600px] mx-auto px-6 py-6 pb-12">
          <div className="space-y-6">
            {filteredTeams.map((team: any) => (
              <div key={team.name} className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-900/60 to-blue-900/60 px-6 py-4 border-b border-purple-500/20">
                  <h2 
                    className="text-2xl font-black text-purple-100" 
                    style={{ fontFamily: '"Bebas Neue", "Impact", cursive' }}
                  >
                    {team.name}
                  </h2>
                  <p className="text-purple-300/60 text-sm">{team.owner}</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-950/40 text-purple-300/60 text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 text-left font-bold whitespace-nowrap">Player</th>
                        <th className="px-6 py-3 text-left font-bold whitespace-nowrap">Current Acq.</th>
                        <th className="px-6 py-3 text-left font-bold whitespace-nowrap">Current Years</th>
                        <th className="px-6 py-3 text-left font-bold whitespace-nowrap">Status</th>
                        <th className="px-6 py-3 text-left font-bold whitespace-nowrap">2026 Round</th>
                        <th className="px-6 py-3 text-left font-bold whitespace-nowrap">Years Left</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {team.players.map((player: any, idx: number) => (
                        <tr 
                          key={idx} 
                          className={`transition-colors ${
                            player.keeperStatus.eligible 
                              ? 'hover:bg-green-500/5' 
                              : 'hover:bg-red-500/5 opacity-60'
                          }`}
                        >
                          <td className="px-6 py-4 text-purple-100 font-medium whitespace-nowrap">
                            {player.Player}
                          </td>
                          <td className="px-6 py-4 text-purple-300/80 whitespace-nowrap">
                            {player.Acquired || '—'}
                          </td>
                          <td className="px-6 py-4 text-purple-300/80 whitespace-nowrap">
                            {player.Years || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {player.keeperStatus.eligible ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 font-bold text-sm">Eligible</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 text-sm">{player.keeperStatus.reason}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {player.keeperStatus.eligible ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40">
                                <span className="text-purple-200 font-black text-lg">
                                  {player.keeperStatus.nextRound}
                                </span>
                                {player.keeperStatus.isRookie && (
                                  <span className="text-xs text-purple-400 font-bold">(R)</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-purple-500/40">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {player.keeperStatus.eligible ? (
                              <span className="text-purple-300 font-bold">
                                {player.keeperStatus.yearsRemaining} {player.keeperStatus.yearsRemaining === 1 ? 'year' : 'years'}
                              </span>
                            ) : (
                              <span className="text-purple-500/40">—</span>
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
        
        {/* Rules Footer */}
        <div className="max-w-[1600px] mx-auto px-6 py-8 mb-8">
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-purple-400" />
              <h3 
                className="text-xl font-black text-purple-100" 
                style={{ fontFamily: '"Bebas Neue", "Impact", cursive' }}
              >
                KKL Keeper Rules
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-purple-300/80 text-sm leading-relaxed">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Players may be kept for a maximum of <strong className="text-purple-200">3 years</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Players drafted in <strong className="text-purple-200">rounds 1-3</strong> are ineligible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Undrafted players count as <strong className="text-purple-200">12th round</strong> picks</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Regular players move up <strong className="text-purple-200">2 rounds</strong> when kept</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Rookies (R) stay in the <strong className="text-purple-200">same round</strong> when kept</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Years remaining calculated as current years <strong className="text-purple-200">minus 1</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
