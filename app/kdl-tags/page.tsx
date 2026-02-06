'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowLeft, Shield, DollarSign } from 'lucide-react';

interface TagPlayer {
  Player: string;
  Position: string;
  Salary: string;
}

interface PositionalGroup {
  name: string;
  players: TagPlayer[];
  franchise: number;
  restricted: number;
}

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

        const calculatedGroups = groupNames.map(name => {
          const sorted = groupMap[name].sort((a, b) => 
            (parseFloat(b.Salary) || 0) - (parseFloat(a.Salary) || 0)
          );

          const top10 = sorted.slice(0, 10);
          
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
      <div className="text-violet-400 font-mono animate-pulse text-xl">LOADING OFFICIAL TAGS...</div>
    </div>
  );

  return (
    <div className="min-h-screen cyber-bg">
      <div className="scan-line" />
      
      {/* Header */}
      <div className="relative z-10 border-b border-violet-900/30 bg-black/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link href="/kdl" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-xs font-mono">
              <ArrowLeft size={12} /> DASHBOARD
            </Link>
            <Link href="/kdl-contract" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-xs font-mono font-bold">
              CONTRACT MANAGER <ArrowLeft size={12} className="rotate-180" />
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <TrendingUp size={28} className="text-violet-400" />
            <div>
              <h1 className="text-xl md:text-2xl font-black gradient-text-violet glow-violet tracking-wide">
                OFFICIAL TAG AUDITOR
              </h1>
              <p className="text-[10px] md:text-xs text-zinc-500 font-mono uppercase">
                Based on Week 12 Salaries (Projected for 2026)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {groups.map(group => (
            <div key={group.name} className="cyber-card border-violet-500/20 flex flex-col overflow-hidden">
              
              <div className="p-3 bg-zinc-900/50 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-black text-white">{group.name}</h2>
                  <div className="p-1.5 bg-violet-500/10 rounded-lg">
                    {group.name === 'DL' || group.name === 'DB' ? <Shield size={16} className="text-violet-400" /> : <DollarSign size={16} className="text-violet-400" />}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-950 p-1.5 rounded border border-zinc-800 text-center">
                    <div className="text-[8px] uppercase text-zinc-500 font-bold">Franchise (Top 5)</div>
                    {/* CHANGED Math.ceil to Math.round */}
                    <div className="text-base font-mono font-bold text-violet-400">${Math.round(group.franchise)}</div>
                  </div>
                  <div className="bg-zinc-950 p-1.5 rounded border border-zinc-800 text-center">
                    <div className="text-[8px] uppercase text-zinc-500 font-bold">Restricted (Top 10)</div>
                    {/* CHANGED Math.ceil to Math.round */}
                    <div className="text-base font-mono font-bold text-cyan-400">${Math.round(group.restricted)}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-0">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/30 text-[9px] text-zinc-500 uppercase">
                    <tr>
                      <th className="px-2 py-1.5 w-8 text-center">#</th>
                      <th className="px-1 py-1.5">Player</th>
                      <th className="px-2 py-1.5 text-right">Sal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {group.players.map((p, i) => (
                      <tr key={p.Player} className={i < 5 ? 'bg-violet-500/5' : ''}>
                        <td className="px-2 py-1 text-center font-mono text-[10px] text-zinc-600">{i + 1}</td>
                        <td className="px-1 py-1">
                          <div className="text-zinc-300 font-bold text-[11px] truncate max-w-[110px] md:max-w-[130px]">{p.Player}</div>
                        </td>
                        <td className="px-2 py-1 text-right font-mono text-violet-300 whitespace-nowrap">
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
              
              <div className="p-1.5 bg-zinc-950/30 border-t border-zinc-800 text-[8px] text-center text-zinc-600 font-mono">
                TOP 5: FRANCHISE • TOP 10: RESTRICTED
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}