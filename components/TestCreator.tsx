
import React, { useState, useEffect } from 'react';
import { Classroom, Question, Test } from '../types';
import { db } from '../services/database';

interface TestCreatorProps {
  teacherId: string;
  editingTest?: Test;
  onClose: () => void;
  onCreated: () => void;
  availableClasses: Classroom[];
}

const TestCreator: React.FC<TestCreatorProps> = ({ teacherId, editingTest, onClose, onCreated, availableClasses }) => {
  const [title, setTitle] = useState(editingTest?.title || '');
  const [description, setDescription] = useState(editingTest?.description || '');
  const [questions, setQuestions] = useState<Question[]>(editingTest?.questions || []);
  const [isPublic, setIsPublic] = useState(editingTest?.isPublic || false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(editingTest?.allowedClassIds || []);
  const [allowMultiple, setAllowMultiple] = useState(editingTest?.allowMultipleAttempts ?? true);
  const [showFeedback, setShowFeedback] = useState(editingTest?.showFeedbackImmediately ?? false);
  const [randomizeQ, setRandomizeQ] = useState(editingTest?.randomizeQuestions ?? false);
  const [randomizeO, setRandomizeO] = useState(editingTest?.randomizeOptions ?? false);
  
  const [isImportMode, setIsImportMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Manual Question State
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  const handleAddQuestion = () => {
    if (!qText || qOptions.some(o => !o)) return alert("Eksik alan var.");
    const newQ: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: qText,
      options: [...qOptions],
      correctAnswer: qCorrect
    };
    setQuestions([...questions, newQ]);
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        const formatted = parsed.map(q => ({
          id: Math.random().toString(36).substr(2, 9),
          text: q.text || 'Metin yok',
          options: q.options || ['A', 'B', 'C', 'D'],
          correctAnswer: q.correctAnswer ?? 0
        }));
        setQuestions([...questions, ...formatted]);
        setJsonInput('');
        setIsImportMode(false);
      }
    } catch (e) { alert("JSON Hatası."); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) return alert("Soru ekleyin.");
    db.syncTest({
      teacherId, title, description, questions, isPublic,
      allowedClassIds: isPublic ? [] : selectedClasses,
      allowMultipleAttempts: allowMultiple,
      showFeedbackImmediately: showFeedback,
      randomizeQuestions: randomizeQ,
      randomizeOptions: randomizeO,
      isActive: editingTest?.isActive ?? false 
    }, editingTest?.id);
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] overflow-y-auto p-0 sm:p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white sm:rounded-[2.5rem] rounded-t-[2rem] shadow-2xl h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto mt-4 sm:mt-0 animate-in slide-in-from-bottom duration-300">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-20">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{editingTest?.id ? 'Testi Güncelle' : 'Yeni Sınav Tasarımı'}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Zorluk ve Kuralları Belirleyin</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">✕</button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sınav Başlığı</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-5 py-3 sm:py-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold bg-white text-slate-900 text-sm sm:text-base"
                  placeholder="Matematik-101 Vize" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kısa Açıklama</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full px-5 py-3 sm:py-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 h-20 text-xs sm:text-sm bg-white text-slate-900"
                  placeholder="Sınav kapsamı hakkında bilgi..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => setIsImportMode(false)}
                  className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${!isImportMode ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border-slate-200'}`}>
                  Manuel
                </button>
                <button onClick={() => setIsImportMode(true)}
                  className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${isImportMode ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border-slate-200'}`}>
                  JSON
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl space-y-3 border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Güvenlik ve Kurallar</h4>
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm font-bold text-slate-700 select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                  <span>Global Yayın (Herkese Açık)</span>
                </label>
                {!isPublic && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {availableClasses.map(c => (
                      <button key={c.id} type="button" onClick={() => setSelectedClasses(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-wider transition-all ${selectedClasses.includes(c.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                        {c.name}
                      </button>
                    ))}
                    {availableClasses.length === 0 && <p className="text-[9px] text-slate-400 italic font-bold">Lütfen önce bir sınıf oluşturun.</p>}
                  </div>
                )}
                <hr className="my-2 border-slate-200" />
                <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm font-bold text-slate-700 select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" checked={allowMultiple} onChange={e => setAllowMultiple(e.target.checked)} />
                  <span>Sınırsız Giriş Hakkı</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm font-black text-indigo-600 select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-indigo-300 text-indigo-600" checked={showFeedback} onChange={e => setShowFeedback(e.target.checked)} />
                  <span>Doğru Cevabı Anında Göster</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm font-bold text-slate-700 select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" checked={randomizeQ} onChange={e => setRandomizeQ(e.target.checked)} />
                  <span>Soruları Karıştır (Shuffle)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            {isImportMode ? (
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Soru Veri Aktarımı</h3>
                <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)}
                  className="w-full h-48 p-5 font-mono text-[10px] border border-slate-200 rounded-2xl bg-white text-slate-900 outline-none focus:border-indigo-500"
                  placeholder='[{"text": "Soru?", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]' />
                <button onClick={handleJsonImport} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Import Veriyi İşle</button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-4 shadow-inner border-dashed">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Soru Editörü</h3>
                <input type="text" value={qText} onChange={e => setQText(e.target.value)} className="w-full px-5 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 font-bold outline-none focus:border-indigo-500" placeholder="Soru metnini yazın..." />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {qOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3 p-1.5 border border-slate-100 rounded-xl focus-within:border-indigo-300 transition-all">
                      <input type="radio" checked={qCorrect === i} onChange={() => setQCorrect(i)} name="correct" className="w-4 h-4 text-indigo-600" />
                      <input type="text" value={opt} onChange={e => { const newO = [...qOptions]; newO[i] = e.target.value; setQOptions(newO); }}
                        className="flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none" placeholder={`${String.fromCharCode(65+i)} Seçeneği`} />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleAddQuestion} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all">Soru Listesine Ekle</button>
              </div>
            )}
          </div>

          <div className="space-y-4 pb-12">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Hazırlanan Sorular ({questions.length})</h3>
            <div className="grid gap-3 sm:gap-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group flex items-start gap-4">
                  <span className="bg-white w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-xs font-black shadow-sm text-slate-700 border border-slate-100">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold mb-2 text-slate-800 leading-snug">{q.text}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {q.options.map((opt, oi) => (
                        <p key={oi} className={`text-[9px] sm:text-[10px] truncate ${q.correctAnswer === oi ? 'text-green-600 font-black' : 'text-slate-400 font-bold'}`}>
                          {String.fromCharCode(65+oi)}) {opt}
                        </p>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => setQuestions(questions.filter(item => item.id !== q.id))}
                    className="text-red-500 font-black text-[10px] uppercase sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1">Sil</button>
                </div>
              ))}
              {questions.length === 0 && <p className="text-center py-10 text-slate-300 font-bold text-xs uppercase tracking-widest italic border-2 border-dashed rounded-3xl">Henüz soru eklenmedi.</p>}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t bg-white sticky bottom-0 z-20 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Kapat</button>
          <button onClick={handleSubmit} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
            Sınavı Sisteme Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCreator;
