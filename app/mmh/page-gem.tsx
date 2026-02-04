'use client';
import Link from 'next/link';
import { DollarSign, Wallet, ArrowLeft } from 'lucide-react';

export default function MMHDashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-emerald-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
        </Link>
        
        <div className="flex items-center gap-4 mb-12 border-b border-zinc-800 pb-8">
          <div className="p-4 bg-emerald-500/10 rounded-2xl">
            <DollarSign size={48} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">MMH DASHBOARD</h1>
            <p className="text-emerald-400 font-mono">Monday Morning Hangover</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/mmh-keeper" className="group bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-emerald-500 transition-all hover:-translate-y-1">
            <div className="mb-4 p-3 bg-zinc-950 rounded-lg w-fit group-hover:text-emerald-400 transition-colors">
              <Wallet size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Salary Cap Manager</h3>
            <p className="text-sm text-zinc-400">Track cap space, contract inflation, and taxi squad exemptions.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}