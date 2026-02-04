'use client';

import Link from 'next/link';
import { Trophy, DollarSign, Flame, Crown, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-800 bg-zinc-900/50">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            MFL LEAGUES
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">
            Centralized command center for fantasy football asset management, salary cap tracking, and dynasty analysis.
          </p>
        </div>
      </div>

      {/* League Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* KKL Card (Cyberpunk Purple) */}
          <Link href="/kkl" className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8 transition-all hover:border-purple-500/50 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                  <Trophy size={32} />
                </div>
                <h2 className="text-3xl font-bold font-mono tracking-tight">KKL</h2>
              </div>
              <p className="text-zinc-400 mb-8 flex-grow">Knuckleheads Keeper League. Analyzing keeper value and round inflation logic.</p>
              <div className="flex items-center text-purple-400 font-bold group-hover:translate-x-2 transition-transform">
                ENTER DASHBOARD <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* MMH Card (Emerald Money) */}
          <Link href="/mmh" className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8 transition-all hover:border-emerald-500/50 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign size={32} />
                </div>
                <h2 className="text-3xl font-bold font-mono tracking-tight">MMH</h2>
              </div>
              <p className="text-zinc-400 mb-8 flex-grow">Monday Morning Hangover. Salary cap management and contract tracking.</p>
              <div className="flex items-center text-emerald-400 font-bold group-hover:translate-x-2 transition-transform">
                ENTER DASHBOARD <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* BSB Card (Red Fire) */}
          <Link href="/bsb" className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8 transition-all hover:border-rose-500/50 hover:shadow-[0_0_40px_-10px_rgba(225,29,72,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500">
                  <Flame size={32} />
                </div>
                <h2 className="text-3xl font-bold font-mono tracking-tight">BSB</h2>
              </div>
              <p className="text-zinc-400 mb-8 flex-grow">Blood, Sweat & Beers. Round accelerator logic and free agent restrictions.</p>
              <div className="flex items-center text-rose-500 font-bold group-hover:translate-x-2 transition-transform">
                ENTER DASHBOARD <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* KDL Card (Gold/Dynasty - Placeholder) */}
          <Link href="/kdl" className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8 transition-all hover:border-amber-500/50 hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
                  <Crown size={32} />
                </div>
                <h2 className="text-3xl font-bold font-mono tracking-tight">KDL</h2>
              </div>
              <p className="text-zinc-400 mb-8 flex-grow">Knuckleheads Dynasty League. Complex contract years and salary cap analysis.</p>
              <div className="flex items-center text-amber-500 font-bold group-hover:translate-x-2 transition-transform">
                ENTER DASHBOARD <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}