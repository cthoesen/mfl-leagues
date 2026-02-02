'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, DollarSign, XCircle, CheckCircle } from 'lucide-react';

interface MMHPlayer {
  Player: string;
  Team: string;
  Owner: string;
  Salary: string;
  Base: string;
  Years: string;
  Info: string;
  Acquired: string;
  IsTaxi: boolean;
}

function calculateMMHKeeperStatus(player: MMHPlayer) {
  if (!player || !player.Player) return { eligible: false, cost: 0, reason: 'Invalid Data' };

  // Parse Money Values
  const currentSalary = parseFloat(player.Salary) || 0;
  const keeperBase = parseFloat(player.Base) || 0;
  
  // --- UPDATED YEARS LOGIC ---
  // If Years is blank/empty, they are on a fresh contract (3 years remaining)
  // Otherwise, it is Current Years - 1
  let yearsRemaining;
  let currentYears = 0;

  if (!player.Years || player.Years.trim() === '') {
    yearsRemaining = 3;
    currentYears = 4; // Arbitrary number > 0 to ensure eligibility check passes
  } else {
    currentYears = parseInt(player.Years);
    yearsRemaining = currentYears - 1;
  }
  
  // Determine Position for Minimums
  const isKicker = player.Player.includes(' K') || player.Player.includes('(K)');
  const minSalary = isKicker ? 3 : 5;

  // Determine Max Contract Length (Rookie Rule)
  const isDraftedRookie = /R\d{2}-\d/.test(player.Info) || /R\d{2}/.test(player.Info); 
  const maxYears = isDraftedRookie ? 5 : 3;

  if (yearsRemaining <= 0 && currentYears > 0) {
    return {
      eligible: false, cost: 0, reason: 'Contract Expired', yearsRemaining: 0, isTaxi: player.IsTaxi, maxYears
    };
  }

  // Calculate New Salary
  let newCost = 0;
  if (player.IsTaxi) {
    newCost = currentSalary;
  } else {
    // (Higher of Base vs Salary) + 25%, rounded up
    const baseCalculation = Math.max(currentSalary, keeperBase);
    newCost = Math.ceil(baseCalculation * 1.25);
    if (newCost < minSalary) newCost = minSalary;
  }

  return {
    eligible: true, 
    cost: newCost, 
    reason: null, 
    yearsRemaining: Math.max(0, yearsRemaining), 
    isDraftedRookie, 
    isTaxi: player.IsTaxi, 
    maxYears
  };
}

// --- NEW HELPER FOR ROOKIE TEXT ---
function getRookieLabel(info: string, acquired: string) {
  if (info.includes('R25')) {
    return `2025 Rookie Draft ${acquired}`;
  }
  if (info.includes('R24')) {
    return `2024 Rookie Draft`;
  }
  return 'Rookie Contract';
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

  // --- STATS CALCULATION HELPER ---
  const getTeamStats = (players: any[]) => {
    const SALARY_CAP = 1200;
    
    // 1. Current Payroll (Sum of Salary, excluding Taxi)
    const currentPayroll = players.reduce((sum, p) => {
      return p.status.isTaxi ? sum : sum + (parseFloat(p.Salary) || 0);
    }, 0);

    // 2. 2026 Projected (Sum of 2026 Cost, excluding Taxi, only if eligible)
    const projectedPayroll = players.reduce((sum, p) => {
      // We only sum eligible keepers. If ineligible, cost is 0 or they drop off.
      // If you want to sum ALL rostered players regardless of eligibility, logic changes here.
      // Assuming we sum eligible keepers + 0 for those who leave.
      if (p.status.isTaxi || !p.status.eligible) return sum;
      return sum + p.status.cost;
    }, 0);

    return {
      cap: SALARY_CAP,
      currentPayroll,
      currentSpace: SALARY_CAP - currentPayroll,
      projectedPayroll,
      projectedSpace: SALARY_CAP - projectedPayroll
    };
  };

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#34d399', fontFamily: 'monospace' }}>
      <div className="animate-pulse">Initializing MMH Salary Protocols...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#ef4444', padding: '2rem' }}>Error: {error}</div>
  );

  return (
    <div className="app-container">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;900&display=swap');
        
        body { background-color: #09090b; color: #f4f4f5; font-family: 'Inter', sans-serif; margin: 0; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Layout */
        .app-container { min-height: 100vh; }
        .max-w-7xl { max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; }
        
        /* Header */
        header { border-bottom: 1px solid #27272a; background: rgba(24, 24, 27, 0.8); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50; }
        .header-content { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 0; }
        
        /* Inputs */
        .controls { display: flex; gap: 1rem; margin: 2rem 0; flex-wrap: wrap; }
        input, select { background: #18181b; border: 1px solid #27272a; color: white; padding: 0.75rem 1rem; border-radius: 0.5rem; font-family: 'JetBrains Mono', monospace; }
        input { flex: 1; min-width: 300px; }
        
        /* Cards */
        .team-card { background: #18181b; border: 1px solid #27272a; border-radius: 0.75rem; overflow: hidden; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); }
        .card-header { padding: 1.5rem; background: #09090b; border-bottom: 1px solid #27272a; }
        
        /* Financial Dashboard in Header */
        .financial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-top: 1rem; }
        .stat-box { background: #18181b; border: 1px solid #27272a; padding: 0.75rem; border-radius: 0.5rem; text-align: center; }
        .stat-label { font-size: 0.7rem; color: #71717a; text-transform: uppercase; margin-bottom: 0.25rem; font-weight: 700; }
        .stat-value { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 1.1rem; }
        
        /* Table */
        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 0.75rem 1.5rem; font-size: 0.75rem; color: #71717a; text-transform: uppercase; background: rgba(9, 9, 11, 0.5); font-family: 'JetBrains Mono', monospace; }
        td { padding: 1rem 1.5rem; border-bottom: 1px solid #27272a; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        
        /* Colors & Status */
        .text-emerald { color: #34d399; }
        .text-zinc { color: #a1a1aa; }
        .text-red { color: #ef4444; }
        .badge-taxi { background: rgba(234, 179, 8, 0.1); color: #eab308; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-right: 8px; font-family: 'JetBrains Mono'; }
        .badge-rookie { color: #60a5fa; font-size: 0.75rem; font-family: 'JetBrains Mono'; }
        
        .cost-display { font-size: 1.125rem; font-weight: 700; font-family: 'JetBrains Mono'; color: #34d399; }
        .ineligible-row { opacity: 0.4; filter: grayscale(100%); }
      `}</style>

      <header>
        <div className="max-w-7xl">
          <div style={{ padding: '1rem 0' }}>
            <Link href="/" style={{ color: '#34d399', fontSize: '0.75rem', fontFamily: 'monospace', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>← RETURN TO HUB</Link>
            <div className="header-content">
              <DollarSign size={32} color="#34d399" />
              <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'white' }}>MMH <span className="text-emerald">SALARY CAP</span></h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl" style={{ paddingBottom: '4rem' }}>
        <div className="controls">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search player database..." style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select onChange={(e) => setSelectedTeam(e.target.value)}>
            <option value="all">ALL FRANCHISES</option>
            {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        {filteredTeams.map((team: any) => {
          // Calculate Stats for this team
          const stats = getTeamStats(team.players);

          return (
            <div key={team.name} className="team-card">
              <div className="card-header">
                <div style={{ marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{team.name}</h2>
                  <p style={{ color: '#71717a', fontSize: '0.875rem', fontFamily: 'monospace' }}>{team.owner}</p>
                </div>

                {/* Financial Dashboard */}
                <div className="financial-grid">
                   <div className="stat-box">
                      <div className="stat-label">Salary Cap</div>
                      <div className="stat-value text-emerald">${stats.cap}</div>
                   </div>
                   
                   <div className="stat-box">
                      <div className="stat-label">Current Payroll</div>
                      <div className="stat-value text-zinc">${stats.currentPayroll}</div>
                   </div>

                   <div className="stat-box">
                      <div className="stat-label">Current Space</div>
                      <div className={`stat-value ${stats.currentSpace < 0 ? 'text-red' : 'text-emerald'}`}>
                        ${stats.currentSpace}
                      </div>
                   </div>

                   <div className="stat-box">
                      <div className="stat-label">2026 Projected</div>
                      <div className="stat-value" style={{ color: '#a78bfa' }}>${stats.projectedPayroll}</div>
                   </div>

                   <div className="stat-box">
                      <div className="stat-label">2026 Space</div>
                      <div className={`stat-value ${stats.projectedSpace < 0 ? 'text-red' : 'text-emerald'}`}>
                        ${stats.projectedSpace}
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Current Sal</th>
                      <th>Base</th>
                      <th>2026 Cost</th>
                      <th>Contract</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.players.map((p: any, i: number) => (
                      <tr key={i} className={!p.status.eligible ? 'ineligible-row' : ''}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{p.Player}</div>
                          <div style={{ marginTop: '4px' }}>
                            {p.status.isTaxi && <span className="badge-taxi">TAXI</span>}
                            
                            {/* ROOKIE LABEL LOGIC */}
                            {p.status.isDraftedRookie && (
                              <span className="badge-rookie">
                                {getRookieLabel(p.Info, p.Acquired)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="font-mono text-zinc">${p.Salary}</td>
                        <td className="font-mono" style={{ fontSize: '0.75rem', color: '#71717a' }}>${p.Base}</td>
                        <td>
                          {p.status.eligible ? (
                            <div className="cost-display">${p.status.cost}</div>
                          ) : (
                            <span style={{ color: '#52525b' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="font-mono" style={{ color: p.status.yearsRemaining === 1 ? '#f87171' : '#d4d4d8', fontWeight: 700 }}>
                              {p.status.yearsRemaining} Yrs
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#52525b', textTransform: 'uppercase' }}>Max: {p.status.maxYears}</span>
                          </div>
                        </td>
                        <td>
                          {p.status.eligible ? (
                            <CheckCircle size={20} color="#34d399" />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
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
          );
        })}
      </div>
    </div>
  );
}