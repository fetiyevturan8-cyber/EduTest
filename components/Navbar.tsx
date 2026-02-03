
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [ping, setPing] = useState(24);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(true);
      setPing(Math.floor(Math.random() * 20) + 15);
      setTimeout(() => setIsSyncing(false), 1500);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 animate-in zoom-in duration-500">
              <span className="text-white font-black text-2xl">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 tracking-tighter leading-none">
                EduTest <span className="text-[10px] text-indigo-400 font-bold ml-1 align-top uppercase">Enterprise</span>
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    {isSyncing ? 'Syncing Nodes...' : 'Global Server: Istanbul-Alpha'}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-300 border-l border-slate-200 pl-2">{ping}ms Latency</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">
                {user.role === UserRole.TEACHER ? 'Academic Faculty' : user.role === UserRole.ADMIN ? 'System Root' : 'Standard Student'}
              </p>
              <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
            <button
              onClick={onLogout}
              className="group relative flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 border border-slate-200/50"
            >
              <span>Çıkış</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
