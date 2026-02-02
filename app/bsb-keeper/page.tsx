'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Flame, XCircle, CheckCircle } from 'lucide-react';

interface BSBPlayer {
  Player: string;
  Team: string;
  Owner: string;
  Years: string;
  Acquired: string; // e.g. "21.15"
  IsTaxi: boolean;
}

function calculateBSBKeeperStatus(player: BSBPlayer) {
  if (!player || !player.Player) return { eligible: false, cost: '', reason: 'Invalid Data' };

  // 1. Parse Acquired Round
  // STRICT RULE: If Acquired is blank (Free Agent), they are INELIGIBLE.
  if (!player.Acquired || player.Acquired.trim() === '') {
    return {
      eligible: false,
      cost: '—',
      reason: 'Undrafted / Free Agent',
      yearsRemaining: 0,
      nextRound: null
    };
  }

  let acquiredRound = 0;
  const roundMatch = player.Acquired.match(/^(\d+)\./);
  if (roundMatch) {
    acquiredRound = parseInt(roundMatch[1]);
  } else {
    // If there is text but it doesn't look like "21.15", we flag it
    return {
      eligible: false,
      cost: '—',
      reason: 'Invalid Draft Data',
      yearsRemaining: 0,
      nextRound: null
    };
  }

  // 2. Rule: Rounds 1-5 Ineligible
  if (acquiredRound > 0 && acquiredRound <= 5) {
    return {
      eligible: false,
      cost: '—',
      reason: 'Drafted Rd 1-5',
      yearsRemaining: 0,
      nextRound: null
    };
  }

  // 3. Calculate Years Remaining & Identifier
  let yearsRemaining;
  let currentYearsDisplay; // 'Fresh', '3', '2', or '1'

  if (!player.Years || player.Years.trim() === '') {
    yearsRemaining = 3;
    currentYearsDisplay = 'Fresh';
  } else {
    const y = parseInt(player.Years);
    yearsRemaining = y - 1;
    currentYearsDisplay = y.toString();
  }

  // If Years reaches 0 (Current Years was 1), they expire
  if (yearsRemaining <= 0) {
    return {
      eligible: false,
      cost: '—',
      reason: 'Contract Expired',
      yearsRemaining: 0,
      nextRound: null
    };
  }

  // 4. Calculate Next Round Cost (The Accelerator)
  let nextRound = acquiredRound;

  if (player.IsTaxi) {
    // Taxi Rule: Retain draft slot (No penalty)
    nextRound = acquiredRound;
  } else {
    // Accelerator Logic:
    // Fresh (Blank) -> Round - 2
    // Year 3 (shows 3 next year) -> Round - 3
    // Year 2 (shows 2 next year) -> Round - 4
    
    if (currentYearsDisplay === 'Fresh') {
      nextRound = acquiredRound - 2;
    } else if (currentYearsDisplay === '3') {
      nextRound = acquiredRound - 3;
    } else if (currentYearsDisplay === '2') {
      nextRound = acquiredRound - 4;
    }
  }

  // Floor Rule: Cannot go below Round 1
  if (nextRound < 1) nextRound = 1;

  return {
    eligible: true,
    cost: `Rd ${nextRound}`,
    nextRound: nextRound,
    reason: null,
    yearsRemaining,
    isTaxi: player.IsTaxi
  };
}

export default function BSBKeeperApp() {
  const [players, setPlayers] = useState<BSBPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/bsb-league-data');
        if (!response.ok) throw new Error('Failed to fetch BSB data');
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
        status: calculateBSBKeeperStatus(player)
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
    <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#e11d48', fontFamily: 'monospace' }}>
      <div className="animate-pulse">Loading BSB Roster Data...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#ef4444', padding: '2rem' }}>Error: {error}</div>
  );

  return (
    <div className="app-container">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Roboto+Mono:wght@400;700&display=swap');
        
        body { background-color: #09090b; color: #f4f4f5; font-family: 'Roboto Mono', monospace; margin: 0; }
        
        /* Layout */
        .app-container { min-height: 100vh; padding-bottom: 4rem; }
        .max-w-7xl { max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; }
        
        /* Header */
        header { border-bottom: 1px solid #27272a; background: rgba(9, 9, 11, 0.9); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50; }
        .header-content { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; }
        .league-title { font-family: 'Black Ops One', cursive; font-size: 2rem; color: #e11d48; letter-spacing: 0.05em; text-transform: uppercase; }
        
        /* Inputs */
        .controls { display: flex; gap: 1rem; margin: 2rem 0; flex-wrap: wrap; }
        input, select { background: #18181b; border: 1px solid #27272a; color: white; padding: 0.75rem 1rem; border-radius: 0.25rem; font-family: 'Roboto Mono', monospace; }
        input:focus, select:focus { border-color: #e11d48; outline: none; }
        input { flex: 1; min-width: 300px; }
        
        /* Cards */
        .team-card { background: #18181b; border: 1px solid #27272a; border-radius: 0.5rem; overflow: hidden; margin-bottom: 2rem; }
        .card-header { padding: 1rem 1.5rem; background: #09090b; border-bottom: 1px solid #27272a; border-left: 4px solid #e11d48; }
        
        /* Table */
        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 0.75rem 1.5rem; font-size: 0.75rem; color: #71717a; text-transform: uppercase; background: rgba(9, 9, 11, 0.5); }
        td { padding: 1rem 1.5rem; border-bottom: 1px solid #27272a; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        
        /* Colors & Status */
        .text-rose { color: #e11d48; }
        .text-zinc { color: #a1a1aa; }
        .badge-taxi { background: rgba(225, 29, 72, 0.1); color: #fb7185; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid rgba(225, 29, 72, 0.3); }
        
        .round-display { font-size: 1.25rem; font-weight: 700; color: #e11d48; }
        .ineligible-row { opacity: 0.4; filter: grayscale(100%); }
      `}</style>

      <header>
        <div className="max-w-7xl">
          <div style={{ padding: '0.5rem 0' }}>
            <Link href="/" style={{ color: '#e11d48', fontSize: '0.75rem', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>← RETURN TO HUB</Link>
            <div className="header-content">
              <Flame size={32} color="#e11d48" />
              <div className="league-title">BLOOD, SWEAT & BEERS</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl">
        <div className="controls">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search BSB roster..." style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select onChange={(e) => setSelectedTeam(e.target.value)}>
            <option value="all">ALL FRANCHISES</option>
            {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        {filteredTeams.map((team: any) => (
          <div key={team.name} className="team-card">
            <div className="card-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>{team.name}</h2>
                <p style={{ color: '#71717a', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>{team.owner}</p>
              </div>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Acquired</th>
                    <th>Current Years</th>
                    <th>2026 Cost</th>
                    <th>Years Left</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((p: any, i: number) => (
                    <tr key={i} className={!p.status.eligible ? 'ineligible-row' : ''}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.Player}</div>
                        {p.status.isTaxi && <div style={{ marginTop: '4px' }}><span className="badge-taxi">TAXI SQUAD</span></div>}
                      </td>
                      <td className="text-zinc">{p.Acquired || 'Free Agent'}</td>
                      <td className="text-zinc">{p.Years || 'Blank'}</td>
                      <td>
                        {p.status.eligible ? (
                          <div className="round-display">{p.status.cost}</div>
                        ) : (
                          <span style={{ color: '#52525b' }}>—</span>
                        )}
                      </td>
                      <td>
                        {p.status.eligible ? (
                          <span style={{ color: 'white', fontWeight: 700 }}>
                            {p.status.yearsRemaining}
                          </span>
                        ) : (
                          <span style={{ color: '#52525b' }}>0</span>
                        )}
                      </td>
                      <td>
                        {p.status.eligible ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48' }}>
                            <CheckCircle size={20} />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#52525b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            <XCircle size={16} /> {p.status.reason}
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
  );
}