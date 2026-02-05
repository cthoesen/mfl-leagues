'use client';

import Link from 'next/link';
import { Trophy, ArrowLeft, Calculator, TrendingUp, Users, FileText } from 'lucide-react';

export default function KKLHub() {
  return (
    <div className="min-h-screen cyber-bg">
      <div className="scan-line" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8 text-sm font-mono"
        >
          <ArrowLeft size={16} />
          RETURN TO HUB
        </Link>

        {/* Header */}
        <div className="text-center mb-16 slide-in-up">
          <div className="inline-flex items-center gap-4 mb-4">
            <Trophy size={48} className="text-cyan-400" />
            <h1 className="text-6xl font-black gradient-text-cyan glow-cyan">
              KKL
            </h1>
          </div>
          <div className="h-1 w-48 mx-auto bg-linear-to-r from-transparent via-cyan-400 to-transparent mb-4" />
          <p className="text-2xl text-purple-300 font-semibold tracking-wide">
            KNUCKLEHEADS KEEPER LEAGUE
          </p>
          <p className="text-zinc-400 mt-2">
            League ID: 45267 • MFL 2025
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Keeper Analyzer - Active */}
          <Link href="/kkl-keeper">
            <div className="tool-card group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                  <Calculator size={24} className="text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">Keeper Analyzer</h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    Calculate keeper eligibility and draft costs for the 2026 season
                  </p>
                  <div className="inline-flex items-center gap-1 text-xs text-cyan-400 font-mono">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    ACTIVE
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Draft Assistant - Coming Soon */}
          <div className="tool-card opacity-60 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-700/50 rounded-lg">
                <TrendingUp size={24} className="text-zinc-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-400 mb-1">Draft Assistant</h3>
                <p className="text-sm text-zinc-500 mb-3">
                  Live draft helper with player rankings and ADP tracking
                </p>
                <div className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono">
                  COMING SOON
                </div>
              </div>
            </div>
          </div>

          {/* Trade Analyzer - Coming Soon */}
          <div className="tool-card opacity-60 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-700/50 rounded-lg">
                <Users size={24} className="text-zinc-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-400 mb-1">Trade Analyzer</h3>
                <p className="text-sm text-zinc-500 mb-3">
                  Evaluate trade proposals with keeper implications
                </p>
                <div className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono">
                  COMING SOON
                </div>
              </div>
            </div>
          </div>

          {/* League Rules - Coming Soon */}
          <div className="tool-card opacity-60 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-700/50 rounded-lg">
                <FileText size={24} className="text-zinc-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-400 mb-1">League Constitution</h3>
                <p className="text-sm text-zinc-500 mb-3">
                  Official rules, scoring, and keeper regulations
                </p>
                <div className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono">
                  COMING SOON
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="cyber-card card-kkl">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Quick Links</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <a 
              href="https://www47.myfantasyleague.com/2025/home/45267#0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              <span className="text-cyan-400">→</span>
              <span className="text-zinc-300">League Homepage</span>
            </a>
            <a 
              href="https://www47.myfantasyleague.com/2025/options?L=45267&O=17" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              <span className="text-cyan-400">→</span>
              <span className="text-zinc-300">Rosters</span>
            </a>
            <a 
              href="https://www47.myfantasyleague.com/2025/options?L=45267&O=07" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              <span className="text-cyan-400">→</span>
              <span className="text-zinc-300">Salaries</span>
            </a>
            <a 
              href="https://www47.myfantasyleague.com/2025/options?L=45267&O=26" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              <span className="text-cyan-400">→</span>
              <span className="text-zinc-300">Standings</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
