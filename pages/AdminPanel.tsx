
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { DatabaseSchema, UserRole } from '../types';

const AdminPanel: React.FC = () => {
  const [data, setData] = useState<DatabaseSchema | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'tests' | 'attempts'>('users');

  useEffect(() => {
    refresh();
  }, []);

  // Fixed: Made refresh async and awaited the database call
  const refresh = async () => {
    const systemState = await db.getGlobalSystemState();
    setData(systemState);
  };

  if (!data) return null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 mb-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            Global Root Console
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Sistem Merkezi</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">EduTest ağındaki tüm global veriler burada.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={refresh} className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-xs sm:text-sm hover:bg-slate-50">Yenile</button>
          <button onClick={() => db.wipeSystem()} className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 text-white font-black rounded-xl shadow-lg shadow-red-600/20 text-xs sm:text-sm">Sıfırla</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Kullanıcı', value: data.users.length, color: 'indigo' },
          { label: 'Sınıf', value: data.classrooms.length, color: 'violet' },
          { label: 'Test', value: data.tests.length, color: 'purple' },
          { label: 'Puan Kaydı', value: data.attempts.length, color: 'pink' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <p className="text-2xl sm:text-4xl font-black text-slate-900 mb-1">{item.value}</p>
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto border-b bg-slate-50/50 no-scrollbar">
          {(['users', 'classes', 'tests', 'attempts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 sm:px-10 py-4 sm:py-5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600 bg-white' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'users' ? 'Kullanıcılar' : 
               tab === 'classes' ? 'Sınıflar' : 
               tab === 'tests' ? 'Sınavlar' : 'Günlükler'}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-8">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            {activeTab === 'users' && (
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                    <th className="px-4 py-4">Kullanıcı</th>
                    <th className="px-4 py-4">İletişim</th>
                    <th className="px-4 py-4 text-center">Rol</th>
                    <th className="px-4 py-4 text-right">Eylem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 group">
                      <td className="px-4 py-4">
                        <p className="font-black text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{u.id.slice(0,8)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-medium text-slate-600">{u.email}</p>
                        <p className="text-[10px] text-indigo-500 font-bold">{u.phone}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          u.role === UserRole.TEACHER ? 'bg-indigo-100 text-indigo-700' :
                          u.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={async () => { if(confirm('Silinsin mi?')) { await db.removeEntity('users', u.id); refresh(); } }} className="text-red-400 hover:text-red-600 font-black text-[10px] uppercase">Kaldır</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'classes' && (
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                    <th className="px-4 py-4">Kod</th>
                    <th className="px-4 py-4">Sınıf</th>
                    <th className="px-4 py-4 text-center">Mevcut</th>
                    <th className="px-4 py-4 text-right">Eylem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.classrooms.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-6 font-black text-indigo-600 tracking-widest">{c.code}</td>
                      <td className="px-4 py-6 font-bold text-slate-900">{c.name}</td>
                      <td className="px-4 py-6 text-center">
                         <span className="font-black text-slate-700">{c.studentIds.length} Öğrenci</span>
                      </td>
                      <td className="px-4 py-6 text-right">
                        <button onClick={async () => { if(confirm('Sınıf silinsin mi?')) { await db.removeEntity('classrooms', c.id); refresh(); } }} className="text-red-400 font-black text-[10px] uppercase">Kaldır</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'tests' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.tests.map(t => (
                  <div key={t.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${t.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{t.isActive ? 'YAYINDA' : 'KAPALI'}</span>
                      <button onClick={async () => { if(confirm('Test silinsin mi?')) { await db.removeEntity('tests', t.id); refresh(); } }} className="text-[10px] text-red-400 font-bold uppercase">Sil</button>
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">{t.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{t.questions.length} Soru • Eğitmen ID: {t.teacherId.slice(0,6)}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'attempts' && (
              <div className="space-y-3">
                {data.attempts.sort((a,b) => b.timestamp - a.timestamp).map(a => (
                  <div key={a.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-xs sm:text-sm truncate">Çözüm: {a.id}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase truncate">Öğrenci: {a.studentId.slice(0,8)} • {new Date(a.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                       <p className="text-xl sm:text-2xl font-black text-indigo-600">{a.score}/{a.totalQuestions}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
