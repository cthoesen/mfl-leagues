'use client';
import Link from 'next/link';
import { Trophy, Calculator, ArrowLeft } from 'lucide-react';

export default function KKLDashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-purple-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
        </Link>
        
        <div className="flex items-center gap-4 mb-12 border-b border-zinc-800 pb-8">
          <div className="p-4 bg-purple-500/10 rounded-2xl">
            <Trophy size={48} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">KKL DASHBOARD</h1>
            <p className="text-purple-400 font-mono">Knuckleheads Keeper League</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tool 1: Keeper Analyzer */}
          <Link href="/kkl-keeper" className="group bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-purple-500 transition-all hover:-translate-y-1">
            <div className="mb-4 p-3 bg-zinc-950 rounded-lg w-fit group-hover:text-purple-400 transition-colors">
              <Calculator size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Keeper Analyzer</h3>
            <p className="text-sm text-zinc-400">Calculate eligible keepers, round costs, and inflation logic for next season.</p>
          </Link>

          {/* Tool 2: Placeholder */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-xl opacity-60">
            <div className="mb-4 p-3 bg-zinc-950 rounded-lg w-fit">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Draft Board</h3>
            <p className="text-sm text-zinc-500">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}