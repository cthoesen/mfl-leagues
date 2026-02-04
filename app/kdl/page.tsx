'use client';

import Link from 'next/link';
import { Crown, ArrowLeft, DollarSign, TrendingUp, Users, FileText, Target } from 'lucide-react';

export default function KDLHub() {
  return (
    <div className="min-h-screen cyber-bg">
      <div className="scan-line" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors mb-8 text-sm font-mono"
        >
          <ArrowLeft size={16} />
          RETURN TO HUB
        </Link>

        {/* Header */}
        <div className="text-center mb-16 slide-in-up">
          <div className="inline-flex items-center gap-4 mb-4">
            <Crown size={48} className="text-violet-400" />
            <h1 className="text-6xl font-black gradient-text-violet glow-violet">
              KDL
            </h1>
          </div>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-violet-400 to-transparent mb-4" />
          <p className="text-2xl text-purple-300 font-semibold tracking-wide">
            KNUCKLEHEADS DYNASTY LEAGUE
          </p>
          <p className="text-zinc-400 mt-2">
            League ID: 68756 • MFL 2025 • Salary Cap & Contracts
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Contract Manager - Coming Soon */}
          <div className="tool-card opacity-60 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-700/50 rounded-lg">
                <DollarSign size={24} className="text-zinc-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-400 mb-1">Contract Manager</h3>
                <p className="text-sm text-zinc-500 mb-3">
                  Track contracts, tags (franchise/restricted), and free agents
                </p>
                <div className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono">
                  COMING SOON
                </div>
              </div>
            </div>
          </div>

          {/* Salary Cap Tracker - Coming Soon */}
          <div className="tool-card opacity-60 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-700/50 rounded-lg">
                <Target size={24} className="text-zinc-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-400 mb-1">Salary Cap Tracker</h3>
                <p className="text-sm text-zinc-500 mb-3">
                  Monitor cap space, projected salaries, and contract years
                </p>
                <div className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono">
                  COMING SOON
                </div>
              </div>
            </div>
          </div>

          {/* Tag Calculator - Coming Soon */}
          <div className="tool-card opacity-60 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-700/50 rounded-lg">
                <TrendingUp size={24} className="text-zinc-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-400 mb-1">Tag Calculator</h3>
                <p className="text-sm text-zinc-500 mb-3">
                  Calculate franchise and restricted tag costs
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
                  Evaluate trades with contract and cap implications
                </p>
                <div className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono">
                  COMING SOON
                </div>
              </div>
            </div>
          </div>

          {/* League Constitution - Coming Soon */}
          <div className="tool-card opacity-60 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-700/50 rounded-lg">
                <FileText size={24} className="text-zinc-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-400 mb-1">League Constitution</h3>
                <p className="text-sm text-zinc-500 mb-3">
                  Official rules, contract structure, and tag policies
                </p>
                <div className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono">
                  COMING SOON
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="cyber-card card-kdl">
          <h2 className="text-xl font-bold text-violet-400 mb-4">Quick Links</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <a 
              href="https://www47.myfantasyleague.com/2025/home/68756#0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              <span className="text-violet-400">→</span>
              <span className="text-zinc-300">League Homepage</span>
            </a>
            <a 
              href="https://www47.myfantasyleague.com/2025/options?L=68756&O=17" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              <span className="text-violet-400">→</span>
              <span className="text-zinc-300">Rosters</span>
            </a>
            <a 
              href="https://www47.myfantasyleague.com/2025/options?L=68756&O=07" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              <span className="text-violet-400">→</span>
              <span className="text-zinc-300">Salaries & Contracts</span>
            </a>
            <a 
              href="https://www47.myfantasyleague.com/2025/options?L=68756&O=26" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              <span className="text-violet-400">→</span>
              <span className="text-zinc-300">Standings</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
