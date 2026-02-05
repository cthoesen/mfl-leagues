'use client';

import Link from 'next/link';
import { Trophy, Crown, DollarSign, Flame, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen cyber-bg">
      <div className="scan-line" />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 slide-in-up">
          <h1 className="text-7xl md:text-8xl font-black mb-6 glitch-text">
            <span className="bg-linear-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              MFL LEAGUES
            </span>
          </h1>
          <div className="h-1 w-64 mx-auto bg-linear-to-r from-transparent via-cyan-400 to-transparent mb-8" />
          <p className="text-2xl md:text-3xl text-purple-300 font-semibold tracking-wide">
            ASSET REPOSITORY // CYBERPUNK EDITION
          </p>
          <p className="text-zinc-400 mt-4 text-lg">
            Powered by Next.js • Deployed on Vercel
          </p>
        </div>

        {/* Player Image Grid - Links to League Sites */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { 
              id: 1, 
              image: '/images/shared/player-1.png', 
              league: 'Knuckleheads Keeper League',
              code: 'KKL',
              url: 'https://www47.myfantasyleague.com/2025/home/45267#0',
              color: 'cyan'
            },
            { 
              id: 2, 
              image: '/images/shared/player-2.png', 
              league: 'Knuckleheads Dynasty League',
              code: 'KDL',
              url: 'https://www47.myfantasyleague.com/2025/home/68756#0',
              color: 'violet'
            },
            { 
              id: 3, 
              image: '/images/shared/player-3.png', 
              league: 'Monday Morning Hangover',
              code: 'MMH',
              url: 'https://www47.myfantasyleague.com/2025/home/72966#0',
              color: 'emerald'
            },
            { 
              id: 4, 
              image: '/images/shared/player-4.png', 
              league: 'Blood, Sweat, and Beers',
              code: 'BSB',
              url: 'https://www47.myfantasyleague.com/2025/home/62908#0',
              color: 'rose'
            },
          ].map((slot, i) => (
            <a 
              key={slot.id}
              href={slot.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`cyber-card card-${slot.code.toLowerCase()} group cursor-pointer float`}
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div className="aspect-square bg-linear-to-br from-zinc-800/50 to-zinc-900/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-zinc-700/50">
                <img 
                  src={slot.image} 
                  alt={slot.league}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('span');
                      placeholder.className = `text-${slot.color}-400 text-2xl font-bold`;
                      placeholder.textContent = slot.code;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
              <div className={`text-${slot.color}-400 font-bold text-lg mb-1 font-['Orbitron'] glow-${slot.color}`}>
                {slot.code}
              </div>
              <p className="text-zinc-400 text-sm leading-tight">
                {slot.league}
              </p>
            </a>
          ))}
        </div>

        {/* League Hub Navigation */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-10 text-purple-300">
            LEAGUE COMMAND CENTERS
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* KKL Hub */}
            <Link href="/kkl">
              <div className="cyber-card card-kkl group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
                    <Trophy size={32} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-400 glow-cyan">KKL</h3>
                    <p className="text-zinc-400 text-sm">Knuckleheads Keeper</p>
                  </div>
                </div>
                <p className="text-zinc-300 mb-3">
                  Keeper analyzer, draft tools, and league management
                </p>
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  1 TOOL ACTIVE
                </div>
              </div>
            </Link>

            {/* KDL Hub */}
            <Link href="/kdl">
              <div className="cyber-card card-kdl group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
                    <Crown size={32} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-violet-400 glow-violet">KDL</h3>
                    <p className="text-zinc-400 text-sm">Knuckleheads Dynasty</p>
                  </div>
                </div>
                <p className="text-zinc-300 mb-3">
                  Contract manager, salary cap tracker, and tag calculator
                </p>
                <div className="flex items-center gap-2 text-violet-400 text-sm font-mono">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                  1 TOOL ACTIVE
                </div>
              </div>
            </Link>

            {/* MMH Hub */}
            <Link href="/mmh">
              <div className="cyber-card card-mmh group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                    <DollarSign size={32} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-400 glow-emerald">MMH</h3>
                    <p className="text-zinc-400 text-sm">Monday Morning Hangover</p>
                  </div>
                </div>
                <p className="text-zinc-300 mb-3">
                  Salary cap manager, contract optimizer, and auction tools
                </p>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  1 TOOL ACTIVE
                </div>
              </div>
            </Link>

            {/* BSB Hub */}
            <Link href="/bsb">
              <div className="cyber-card card-bsb group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                    <Flame size={32} className="text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-rose-500 glow-rose">BSB</h3>
                    <p className="text-zinc-400 text-sm">Blood, Sweat, and Beers</p>
                  </div>
                </div>
                <p className="text-zinc-300 mb-3">
                  Keeper analyzer, draft strategy, and matchup predictions
                </p>
                <div className="flex items-center gap-2 text-rose-500 text-sm font-mono">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  1 TOOL ACTIVE
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Utilities */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-10 text-purple-300">
            UTILITIES
          </h2>
          <div className="max-w-2xl mx-auto">
            <Link href="/gallery">
              <div className="cyber-card border-violet-500/30 hover:border-violet-500 group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
                    <ImageIcon size={32} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-violet-400">Image Gallery</h3>
                    <p className="text-zinc-400">Browse league assets with lightbox viewer</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm font-mono tracking-wider">
            POWERED BY NEXT.JS // DEPLOYED ON VERCEL // CYBERPUNK AESTHETICS
          </p>
        </div>
      </main>
    </div>
  );
}
