'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowLeft, Shield, DollarSign } from 'lucide-react';

interface TagPlayer {
  Player: string;
  Position: string;
  Team: string;
  Salary: string;
}

interface PositionalGroup {
  name: string;
  players: TagPlayer[];
  franchise: number; // Avg Top 5
  restricted: number; // Avg Top 10
}

// --- HELPER: NORMALIZE POSITIONS ---
function getPositionGroup(pos: string) {
  if (pos === 'DT' || pos === 'DE') return 'DL';
  if (pos === 'CB' || pos === 'S') return 'DB';
  return pos; 
}

export default function KDLTagsApp() {
  const [groups, setGroups] = useState<PositionalGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/kdl-tag-data');
        if (!response.ok) throw new Error('Failed to fetch Tag data');
        const data: TagPlayer[] = await response.json();
        
        // 1. Group Players
        const groupMap: Record<string, TagPlayer[]> = {};
        const groupNames = ['QB', 'RB', 'WR', 'TE', 'PK', 'LB', 'DL', 'DB'];
        
        groupNames.forEach(g => groupMap[g] = []);

        data.forEach(p => {
          let rawPos = p.Position;
          if (!rawPos || rawPos === 'UNK') {
            const parts = p.Player.split(' ');
            rawPos = parts[parts.length - 1].replace(/[^a-zA-Z]/g, '');
          }
          const g = getPositionGroup(rawPos);
          if (groupMap[g]) groupMap[g].push(p);
        });

        // 2. Calculate Stats
        const calculatedGroups = groupNames.map(name => {
          // Sort Descending
          const sorted = groupMap[name].sort((a, b) => 
            (parseFloat(b.Salary) || 0) - (parseFloat(a.Salary) || 0)
          );

          // Use Top 10 for display
          const top10 = sorted.slice(0, 10);
          
          // Math
          const top5Salaries = top10.slice(0, 5).map(p => parseFloat(p.Salary) || 0);
          const top10Salaries = top10.slice(0, 10).map(p => parseFloat(p.Salary) || 0);

          const franchise = top5Salaries.length ? top5Salaries.reduce((a,b)=>a+b,0)/top5Salaries.length : 0;
          const restricted = top10Salaries.length ? top10Salaries.reduce((a,b)=>a+b,0)/top10Salaries.length : 0;

          return {
            name,
            players: top10,
            franchise,
            restricted
          };
        });

        setGroups(calculatedGroups);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) return (
    <div className="min-h-screen cyber-bg flex items-center justify-center">
      <div className="text-violet-400 font-mono animate-pulse text-xl">CALCULATING OFFICIAL WEEK 12 TAGS...</div>
    </div>
  );

  return (
    <div className="min-h-screen cyber-bg">
      <div className="scan-line" />
      
      {/* Header */}
      <div className="relative z-10 border-b border-violet-900/30 bg-black/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link href="/kdl" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-xs font-mono">
              <ArrowLeft size={12} /> RETURN TO DASHBOARD
            </Link>
            <Link href="/kdl-contract" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-xs font-mono font-bold">
              GO TO CONTRACT MANAGER <ArrowLeft size={12} className="rotate-180" />
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <TrendingUp size={32} className="text-violet-400" />
            <div>
              <h1 className="text-2xl font-black gradient-text-violet glow-violet tracking-wide">
                OFFICIAL TAG AUDITOR
              </h1>
              <p className="text-xs text-zinc-500 font-mono uppercase">
                Based on Week 12 Salaries (Projected for 2026)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {groups.map(group => (
            <div key={group.name} className="cyber-card border-violet-500/20 flex flex-col">
              
              {/* Card Header: Prices */}
              <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-black text-white">{group.name}</h2>
                  <div className="p-2 bg-violet-500/10 rounded-lg">
                    {group.name === 'DL' || group.name === 'DB' ? <Shield size={20} className="text-violet-400" /> : <DollarSign size={20} className="text-violet-400" />}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
                    <div className="text-[9px] uppercase text-zinc-500 font-bold">Franchise (Top 5)</div>
                    <div className="text-lg font-mono font-bold text-violet-400">${Math.ceil(group.franchise)}</div>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
                    <div className="text-[9px] uppercase text-zinc-500 font-bold">Restricted (Top 10)</div>
                    <div className="text-lg font-mono font-bold text-cyan-400">${Math.ceil(group.restricted)}</div>
                  </div>
                </div>
              </div>

              {/* Player List */}
              <div className="flex-1 overflow-hidden p-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-950/30 text-[10px] text-zinc-500 uppercase">
                    <tr>
                      <th className="px-4 py-2">Rank</th>
                      <th className="px-2 py-2">Player</th>
                      <th className="px-4 py-2 text-right">Wk12 Sal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {group.players.map((p, i) => (
                      <tr key={p.Player} className={i < 5 ? 'bg-violet-500/5' : ''}>
                        <td className="px-4 py-2 font-mono text-zinc-500">#{i + 1}</td>
                        <td className="px-2 py-2">
                          <div className="text-zinc-200 font-bold text-xs truncate max-w-30">{p.Player.split(' ').slice(0, 2).join(' ')}</div>
                          <div className="text-[9px] text-zinc-500">{p.Team.substring(0, 15)}</div>
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-violet-300">
                          ${p.Salary}
                        </td>
                      </tr>
                    ))}
                    {group.players.length === 0 && (
                      <tr><td colSpan={3} className="p-4 text-center text-zinc-600">No Data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-2 bg-zinc-950/30 border-t border-zinc-800 text-[9px] text-center text-zinc-600 font-mono">
                TOP 5 USED FOR FRANCHISE • TOP 10 USED FOR RESTRICTED
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}