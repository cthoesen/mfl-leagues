'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Award, XCircle, CheckCircle, AlertCircle, Trophy } from 'lucide-react';

interface PlayerData {
  Player?: string;
  Acquired?: string;
  Years?: string | number;
  Team?: string;
  Owner?: string;
  Keeper?: string;
}

function calculateKeeperStatus(player: PlayerData) {
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
  const currentYears = player.Years ? parseInt(String(player.Years)) : null;
  
  // Parse acquired round (format is like "17.06" where 17 is the round)
  let acquiredRound = null;
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
  let yearsRemaining;
  if (currentYears === null) {
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
  let nextRound;
  if (!acquired) {
    // Blank acquired = 12th round
    nextRound = 12;
  } else if (isRookie) {
    // Rookies stay in same round
    nextRound = acquiredRound || 12;
  } else {
    // Regular players move up 2 rounds
    nextRound = (acquiredRound || 12) - 2;
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
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch from OUR internal API route
        const response = await fetch('/api/league-data');
        
        if (!response.ok) {
           const errText = await response.text();
           throw new Error(`Server Error ${response.status}: ${errText}`);
        }
        
        const parsedPlayers = await response.json();
        console.log("Fetched KKL Data:", parsedPlayers.slice(0, 5));
        setPlayers(parsedPlayers);
      } catch (err: any) {
        setError(`Error loading KKL league data: ${err.message}`);
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
      result = result.filter(t => t.name === selectedTeam);
    }
    if (searchTerm) {
      result = result.map(t => ({
        ...t,
        players: t.players.filter((p: PlayerData & { keeperStatus: ReturnType<typeof calculateKeeperStatus> }) => 
          p.Player ? p.Player.toLowerCase().includes(searchTerm.toLowerCase()) : false
        )
      })).filter(t => t.players.length > 0);
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
      <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Rajdhani', sans-serif",
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1347 50%, #2d1b69 100%)',
          color: '#b19cd9'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Trophy className="w-12 h-12 mx-auto mb-4 animate-pulse" />
            <p>Loading KKL keeper data...</p>
          </div>
      </div>
    );
  }

  if (error || players.length === 0) {
    return (
      <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Rajdhani', sans-serif",
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1347 50%, #2d1b69 100%)',
          color: '#ff6b6b'
        }}>
          <div style={{ textAlign: 'center' }}>
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>{error || 'No KKL player data available'}</p>
          </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background: linear-gradient(135deg, #0a0e27 0%, #1a1347 50%, #2d1b69 100%);
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(75, 0, 130, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .scan-line {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent);
          animation: scan 4s linear infinite;
          pointer-events: none;
          z-index: 1000;
        }
        
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
      
      <div className="scan-line" />
      
      <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Rajdhani', sans-serif" }}>
        {/* Header */}
        <header style={{
          borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
          background: 'rgba(10, 14, 39, 0.5)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#00ffff',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff00ff';
              e.currentTarget.style.transform = 'translateX(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#00ffff';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              ← BACK TO HOME
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Trophy style={{ width: '40px', height: '40px', color: '#00ffff' }} />
              <h1 style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
              }}>
                KKL KEEPER ANALYZER
              </h1>
            </div>
            <p style={{ color: '#b19cd9', fontSize: '1.1rem', fontWeight: 600 }}>
              Knuckleheads Keeper League • 2026 Season Analysis
            </p>
          </div>
        </header>

        {/* Stats Cards */}
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.3))',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '2px solid rgba(0, 255, 255, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Award style={{ width: '20px', height: '20px', color: '#b19cd9' }} />
                <span style={{ color: 'rgba(177, 156, 217, 0.6)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Total Players
                </span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#b19cd9' }}>{stats.total}</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 200, 100, 0.2))',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '2px solid rgba(0, 255, 136, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <CheckCircle style={{ width: '20px', height: '20px', color: '#00ff88' }} />
                <span style={{ color: 'rgba(0, 255, 136, 0.6)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Eligible
                </span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00ff88' }}>{stats.eligible}</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 136, 0.2), rgba(200, 0, 100, 0.2))',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '2px solid rgba(255, 0, 136, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <XCircle style={{ width: '20px', height: '20px', color: '#ff0088' }} />
                <span style={{ color: 'rgba(255, 0, 136, 0.6)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Ineligible
                </span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ff0088' }}>{stats.ineligible}</div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem 1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                color: '#b19cd9',
              }} />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  background: 'rgba(10, 14, 39, 0.5)',
                  border: '2px solid rgba(0, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#b19cd9',
                  fontSize: '1rem',
                  outline: 'none',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.6)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.2)'}
              />
            </div>
            
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(10, 14, 39, 0.5)',
                border: '2px solid rgba(0, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#b19cd9',
                fontSize: '1rem',
                outline: 'none',
                cursor: 'pointer',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.6)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.2)'}
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team.name} value={team.name}>{team.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Teams Grid */}
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredTeams.map(team => (
              <div key={team.name} style={{
                background: 'rgba(10, 14, 39, 0.4)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '2px solid rgba(0, 255, 255, 0.2)',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, rgba(138, 43, 226, 0.6), rgba(75, 0, 130, 0.6))',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                }}>
                  <h2 style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#b19cd9',
                  }}>
                    {team.name}
                  </h2>
                  <p style={{ color: 'rgba(177, 156, 217, 0.6)', fontSize: '0.875rem' }}>{team.owner}</p>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{
                        background: 'rgba(10, 14, 39, 0.4)',
                        color: 'rgba(177, 156, 217, 0.6)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700 }}>Player</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700 }}>Current Acq.</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700 }}>Current Years</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700 }}>2026 Round</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700 }}>Years Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.players.map((player: PlayerData & { keeperStatus: ReturnType<typeof calculateKeeperStatus> }, idx: number) => (
                        <tr 
                          key={idx} 
                          style={{
                            borderTop: '1px solid rgba(0, 255, 255, 0.1)',
                            opacity: player.keeperStatus.eligible ? 1 : 0.6,
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = player.keeperStatus.eligible 
                              ? 'rgba(0, 255, 136, 0.05)' 
                              : 'rgba(255, 0, 136, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td style={{ padding: '1rem 1.5rem', color: '#b19cd9', fontWeight: 500 }}>
                            {player.Player}
                          </td>
                          <td style={{ padding: '1rem 1.5rem', color: 'rgba(177, 156, 217, 0.8)' }}>
                            {player.Acquired || '—'}
                          </td>
                          <td style={{ padding: '1rem 1.5rem', color: 'rgba(177, 156, 217, 0.8)' }}>
                            {player.Years || '—'}
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            {player.keeperStatus.eligible ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle style={{ width: '16px', height: '16px', color: '#00ff88' }} />
                                <span style={{ color: '#00ff88', fontWeight: 700, fontSize: '0.875rem' }}>Eligible</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <XCircle style={{ width: '16px', height: '16px', color: '#ff0088' }} />
                                <span style={{ color: '#ff0088', fontSize: '0.875rem' }}>{player.keeperStatus.reason}</span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            {player.keeperStatus.eligible ? (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                background: 'rgba(138, 43, 226, 0.2)',
                                border: '1px solid rgba(138, 43, 226, 0.4)',
                              }}>
                                <span style={{ color: '#b19cd9', fontWeight: 900, fontSize: '1.125rem' }}>
                                  {player.keeperStatus.nextRound}
                                </span>
                                {player.keeperStatus.isRookie && (
                                  <span style={{ fontSize: '0.75rem', color: '#b19cd9', fontWeight: 700 }}>(R)</span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'rgba(138, 43, 226, 0.4)' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            {player.keeperStatus.eligible ? (
                              <span style={{ color: '#b19cd9', fontWeight: 700 }}>
                                {player.keeperStatus.yearsRemaining} {player.keeperStatus.yearsRemaining === 1 ? 'year' : 'years'}
                              </span>
                            ) : (
                              <span style={{ color: 'rgba(138, 43, 226, 0.4)' }}>—</span>
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
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem 2rem' }}>
          <div style={{
            background: 'rgba(10, 14, 39, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '2px solid rgba(0, 255, 255, 0.2)',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertCircle style={{ width: '24px', height: '24px', color: '#b19cd9' }} />
              <h3 style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#b19cd9',
              }}>
                KKL Keeper Rules
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
              color: 'rgba(177, 156, 217, 0.8)',
              fontSize: '0.875rem',
              lineHeight: '1.6',
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#b19cd9', fontWeight: 700 }}>•</span>
                  <span>Players may be kept for a maximum of <strong style={{ color: '#b19cd9' }}>3 years</strong></span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#b19cd9', fontWeight: 700 }}>•</span>
                  <span>Players drafted in <strong style={{ color: '#b19cd9' }}>rounds 1-3</strong> are ineligible</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#b19cd9', fontWeight: 700 }}>•</span>
                  <span>Undrafted players count as <strong style={{ color: '#b19cd9' }}>12th round</strong> picks</span>
                </li>
              </ul>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#b19cd9', fontWeight: 700 }}>•</span>
                  <span>Regular players move up <strong style={{ color: '#b19cd9' }}>2 rounds</strong> when kept</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#b19cd9', fontWeight: 700 }}>•</span>
                  <span>Rookies (R) stay in the <strong style={{ color: '#b19cd9' }}>same round</strong> when kept</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#b19cd9', fontWeight: 700 }}>•</span>
                  <span>Years remaining calculated as current years <strong style={{ color: '#b19cd9' }}>minus 1</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}