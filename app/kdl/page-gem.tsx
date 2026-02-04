'use client';
import Link from 'next/link';
import { Crown, ArrowLeft } from 'lucide-react';

export default function KDLDashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-amber-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
        </Link>
        
        <div className="flex items-center gap-4 mb-12 border-b border-zinc-800 pb-8">
          <div className="p-4 bg-amber-500/10 rounded-2xl">
            <Crown size={48} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">KDL DASHBOARD</h1>
            <p className="text-amber-500 font-mono">Knuckleheads Dynasty League</p>
          </div>
        </div>

        <div className="p-12 border border-zinc-800 rounded-2xl bg-zinc-900 text-center">
          <Crown className="w-16 h-16 text-amber-500/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Under Construction</h2>
          <p className="text-zinc-500">The Final Boss is being built tonight...</p>
        </div>
      </div>
    </div>
  );
}