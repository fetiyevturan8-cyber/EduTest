
import React, { useState, useEffect } from 'react';
import { User, Classroom, Test, TestAttempt } from '../types';
import { db } from '../services/database';
import TestTaker from '../components/TestTaker';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [activeTab, setActiveTab] = useState<'assigned' | 'global'>('assigned');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedClasses, fetchedTests, fetchedAttempts] = await Promise.all([
      db.getStudentClassrooms(user.id),
      db.getAvailableTests(user.id),
      db.getStudentAttempts(user.id)
    ]);
    setClasses(fetchedClasses);
    setAvailableTests(fetchedTests);
    setAttempts(fetchedAttempts);
    setIsLoading(false);
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!joinCode) return;
    const joined = await db.joinClassroom(joinCode.toUpperCase(), user.id);
    if (joined) {
      alert(`${joined.name} sınıfına başarıyla katıldınız.`);
      setJoinCode('');
      loadData();
    } else {
      alert("Hata: Sınıf bulunamadı veya kod geçersiz.");
    }
  };

  const startTest = (test: Test) => {
    if (!test.isActive) return;
    const previousAttempts = attempts.filter(a => a.testId === test.id);
    if (!test.allowMultipleAttempts && previousAttempts.length > 0) {
      alert("Bu test için tek giriş hakkınız vardı ve bu hakkı kullandınız.");
      return;
    }
    setActiveTest(test);
  };

  if (activeTest) {
    return (
      <TestTaker 
        user={user} 
        test={activeTest} 
        onComplete={() => { setActiveTest(null); loadData(); }}
        onCancel={() => setActiveTest(null)}
      />
    );
  }

  const filteredTests = activeTab === 'assigned' 
    ? availableTests.filter(t => !t.isPublic) 
    : availableTests.filter(t => t.isPublic);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Öğrenci Terminali</h1>
          <p className="text-slate-500 font-semibold text-lg">Cloud sistemine bağlısın. Başarılar, {user.name.split(' ')[0]}!</p>
        </div>
        <form onSubmit={handleJoinClass} className="flex gap-3 w-full lg:w-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40">
          <input 
            type="text" 
            required 
            placeholder="SINIF KODU" 
            value={joinCode} 
            onChange={e => setJoinCode(e.target.value)} 
            className="flex-1 lg:w-48 px-4 py-3 border-none outline-none uppercase font-black text-sm placeholder:text-slate-300 tracking-widest" 
          />
          <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/30 active:scale-95 transition-all">Sınıfa Gir</button>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('assigned')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assigned' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Atanan Sınavlar
            </button>
            <button 
              onClick={() => setActiveTab('global')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'global' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Global Keşif
            </button>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Global Veriler Alınıyor...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
                <div className="text-5xl mb-6 grayscale opacity-20">📡</div>
                <p className="text-slate-400 font-black text-lg uppercase tracking-widest">Bu kategoride sınav bulunamadı.</p>
                <p className="text-slate-300 font-bold mt-2">Sınıf kodunu girerek veya global listeyi kontrol ederek başla.</p>
              </div>
            ) : (
              filteredTests.map(test => {
                const userAttemptCount = attempts.filter(a => a.testId === test.id).length;
                const isLocked = !test.isActive || (!test.allowMultipleAttempts && userAttemptCount > 0);
                
                return (
                  <div key={test.id} className={`group bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all shadow-sm ${isLocked ? 'opacity-50 grayscale' : 'hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1'}`}>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest border ${test.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {test.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                        {test.isPublic && <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest">Global</span>}
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{test.questions.length} Soru Seti</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{test.title}</h3>
                      <p className="text-sm text-slate-500 font-medium line-clamp-2 max-w-2xl">{test.description || 'Bu sınav için açıklama girilmemiş.'}</p>
                    </div>
                    <div className="w-full sm:w-auto shrink-0">
                       <button
                        onClick={() => startTest(test)}
                        disabled={isLocked}
                        className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${
                          isLocked
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-95'
                        }`}
                      >
                        {userAttemptCount > 0 ? 'Yeniden Deneyin' : 'Oturumu Başlat'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 px-2">
              <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
              Performansın
           </h2>
           <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
             <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sınav Geçmişi</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{attempts.length} Kayıt</span>
             </div>
             <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
               {attempts.length === 0 ? (
                 <div className="p-12 text-center">
                    <p className="text-slate-300 font-black text-xs uppercase tracking-widest italic">Henüz veri yok.</p>
                 </div>
               ) : (
                 attempts.sort((a,b) => b.timestamp - a.timestamp).map(a => {
                   const t = availableTests.find(x => x.id === a.testId);
                   const scorePercent = Math.round((a.score/a.totalQuestions)*100);
                   return (
                     <div key={a.id} className="p-6 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                       <p className="text-sm font-black text-slate-900 truncate mb-2 group-hover:text-indigo-600 transition-colors">{t?.title || 'Arşivlenen Sınav'}</p>
                       <div className="flex justify-between items-end">
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded w-fit">{new Date(a.timestamp).toLocaleDateString()}</span>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                               <div className={`h-full transition-all duration-1000 ${scorePercent > 80 ? 'bg-emerald-500' : scorePercent > 50 ? 'bg-indigo-500' : 'bg-rose-500'}`} style={{ width: `${scorePercent}%` }}></div>
                            </div>
                         </div>
                         <div className="flex flex-col items-end leading-none">
                            <span className={`text-2xl font-black ${scorePercent > 80 ? 'text-emerald-600' : scorePercent > 50 ? 'text-indigo-600' : 'text-rose-600'}`}>%{scorePercent}</span>
                            <span className="text-[9px] text-slate-300 font-black mt-1 uppercase tracking-widest">{a.score}/{a.totalQuestions} DOĞRU</span>
                         </div>
                       </div>
                     </div>
                   );
                 })
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
