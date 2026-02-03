
import React, { useState, useEffect } from 'react';
import { User, Classroom, Test, TestAttempt } from '../types';
import { db } from '../services/database';
import ClassCard from '../components/ClassCard';
import TestCreator from '../components/TestCreator';

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | undefined>(undefined);
  const [newClassName, setNewClassName] = useState('');
  
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [selectedClassStudents, setSelectedClassStudents] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedClasses, fetchedTests] = await Promise.all([
      db.getTeacherClassrooms(user.id),
      db.getTeacherTests(user.id)
    ]);
    setClasses(fetchedClasses);
    setTests(fetchedTests);
    setIsLoading(false);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;
    setIsLoading(true);
    await db.createClassroom(newClassName, user.id);
    setNewClassName('');
    setIsCreatingClass(false);
    await loadData();
  };

  const handleToggleTest = async (id: string) => {
    setIsLoading(true);
    await db.toggleTest(id);
    await loadData();
  };

  const openClassDetails = async (cls: Classroom) => {
    setSelectedClass(cls);
    const students = await db.getClassStudentsDetailed(cls.studentIds);
    setSelectedClassStudents(students);
  };

  if (isLoading && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-xs">Cloud Database Bağlanılıyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Global Sync Overlay */}
      {isLoading && (
        <div className="fixed top-20 right-8 z-[100] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-indigo-100 shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
           <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
           <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Senkronize ediliyor...</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Akademik Panel</h1>
          <p className="text-slate-500 font-semibold text-sm sm:text-lg">Bulut tabanlı sınav ve sınıf yönetimi.</p>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <button onClick={() => setIsCreatingClass(true)} className="flex-1 sm:flex-none bg-white text-indigo-600 border border-slate-200 px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all text-xs sm:text-base">Sınıf Ekle</button>
          <button onClick={() => setEditingTest({} as Test)} className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-xs sm:text-base">Yeni Test</button>
        </div>
      </div>

      {selectedClass && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-5xl sm:rounded-[3rem] rounded-t-[2.5rem] h-[90vh] sm:h-auto sm:max-h-[92vh] overflow-y-auto p-6 sm:p-12 relative shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <button onClick={() => setSelectedClass(null)} className="absolute top-6 right-6 sm:top-10 sm:right-10 p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">✕</button>
            
            <div className="flex flex-col gap-4 mb-8 sm:mb-12">
              <div className="pr-12">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-indigo-200">Sınıf Veri Merkezi</span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">{selectedClass.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                   <p className="text-indigo-600 font-black text-lg sm:text-2xl tracking-widest uppercase">{selectedClass.code}</p>
                   <button onClick={() => {navigator.clipboard.writeText(selectedClass.code); alert('Kod kopyalandı!');}} className="text-[8px] sm:text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase">Kopyala</button>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2 sm:gap-3">
                <span className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-xs sm:text-sm">👥</span>
                Öğrenci Portföyü
              </h3>
              
              <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
                {selectedClassStudents.length === 0 ? (
                  <div className="text-center py-12 sm:py-24 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-slate-200">
                     <p className="text-slate-400 font-bold">Öğrenci bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="min-w-[600px] border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest border-b">
                        <tr>
                          <th className="px-4 sm:px-8 py-4 sm:py-5">Öğrenci</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-5">İletişim</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-5 text-right">Başarı</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedClassStudents.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50/60 transition-colors group">
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <p className="font-black text-slate-900 text-sm sm:text-base">{s.name}</p>
                              <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase">ID: {s.id.slice(0,8)}</p>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-700">{s.email}</p>
                              <p className="text-[10px] sm:text-xs text-indigo-600 font-black mt-1">{s.phone}</p>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6 text-right font-black text-slate-900">
                                --
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <span className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-indigo-200">🏫</span>
          Aktif Sınıflar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {classes.map(c => (
            <div key={c.id} onClick={() => openClassDetails(c)} className="group cursor-pointer">
              <ClassCard classroom={c} studentCount={c.studentIds.length} />
            </div>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full py-12 sm:py-24 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] sm:rounded-[3rem] text-center">
               <p className="text-slate-400 font-black text-base sm:text-xl">Henüz sınıfınız bulunmuyor.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <span className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-violet-200">📝</span>
          Sınav Kütüphanesi
        </h2>
        <div className="bg-white rounded-[1.5rem] sm:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <tr>
                  <th className="px-6 sm:px-10 py-4 sm:py-6">Sınav</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6 text-center">Durum</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6 text-right">Yönetim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tests.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 sm:px-10 py-6 sm:py-8">
                      <p className="font-black text-slate-900 text-sm sm:text-lg leading-tight">{t.title}</p>
                      <div className="flex gap-1.5 mt-2">
                         <span className="text-[7px] sm:text-[9px] font-black text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase">{t.questions.length} Soru</span>
                         <span className="text-[7px] sm:text-[9px] font-black text-indigo-400 border border-indigo-100 px-1.5 py-0.5 rounded uppercase">{t.isPublic ? 'Global' : 'Özel'}</span>
                      </div>
                    </td>
                    <td className="px-6 sm:px-10 py-6 sm:py-8 text-center">
                      <button 
                        onClick={() => handleToggleTest(t.id)} 
                        className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl text-[7px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${
                          t.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        }`}
                      >
                        {t.isActive ? 'Açık' : 'Kapalı'}
                      </button>
                    </td>
                    <td className="px-6 sm:px-10 py-6 sm:py-8 text-right">
                      {!t.isActive ? (
                        <button onClick={() => setEditingTest(t)} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 sm:px-6 sm:py-2 rounded-xl font-black text-[10px] sm:text-xs hover:bg-indigo-600 hover:text-white transition-all uppercase">Düzenle</button>
                      ) : (
                        <span className="text-slate-300 text-[8px] sm:text-[9px] font-black uppercase italic">Kilitli</span>
                      )}
                    </td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr><td colSpan={3} className="p-12 sm:p-20 text-center text-slate-300 font-bold italic text-base sm:text-lg">Test oluşturulmadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isCreatingClass && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[3rem] p-8 sm:p-12 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <h3 className="text-2xl sm:text-3xl font-black mb-2 text-slate-900 tracking-tight">Sınıf Tanımla</h3>
            <p className="text-slate-500 font-medium mb-6 sm:mb-8 text-sm sm:text-base">Yeni bir öğrenci grubu oluşturun.</p>
            <form onSubmit={handleCreateClass} className="space-y-4 sm:space-y-6">
              <input 
                type="text" 
                required 
                autoFocus 
                value={newClassName} 
                onChange={e => setNewClassName(e.target.value)} 
                className="w-full px-5 py-4 sm:px-6 sm:py-5 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-900 text-sm sm:text-base" 
                placeholder="Örn: 10-A Matematik" 
              />
              <div className="flex justify-end gap-3 sm:gap-4 pt-4">
                <button type="button" onClick={() => setIsCreatingClass(false)} className="px-4 py-2 sm:px-6 sm:py-3 font-black text-slate-400 uppercase tracking-widest text-[10px] sm:text-xs">İptal</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 sm:px-10 sm:py-3 rounded-xl sm:rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px] sm:text-xs">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTest && (
        <TestCreator 
          teacherId={user.id} 
          editingTest={editingTest.id ? editingTest : undefined}
          onClose={() => setEditingTest(undefined)} 
          onCreated={() => { setEditingTest(undefined); loadData(); }}
          availableClasses={classes}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
