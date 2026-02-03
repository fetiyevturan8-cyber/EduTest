
import React, { useState, useEffect, useMemo } from 'react';
import { User, Test, TestAttempt, Question } from '../types';
import { db } from '../services/database';

interface TestTakerProps {
  user: User;
  test: Test;
  onComplete: () => void;
  onCancel: () => void;
}

const TestTaker: React.FC<TestTakerProps> = ({ user, test, onComplete, onCancel }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<TestAttempt | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const randomizedQuestions = useMemo(() => {
    let qs = [...test.questions];
    if (test.randomizeQuestions) {
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
    }
    if (test.randomizeOptions) {
      qs = qs.map(q => {
        const indices = q.options.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const newOptions = indices.map(idx => q.options[idx]);
        const newCorrect = indices.indexOf(q.correctAnswer);
        return { ...q, options: newOptions, correctAnswer: newCorrect };
      });
    }
    return qs;
  }, [test]);

  useEffect(() => {
    setAnswers(new Array(randomizedQuestions.length).fill(-1));
  }, [randomizedQuestions]);

  const handleSelectOption = (optionIndex: number) => {
    if (showFeedback) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
    if (test.showFeedbackImmediately) setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < randomizedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    setShowFeedback(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    let score = 0;
    randomizedQuestions.forEach((q, idx) => { if (answers[idx] === q.correctAnswer) score++; });
    const attempt = db.recordAttempt({
      testId: test.id, studentId: user.id, score, totalQuestions: randomizedQuestions.length, answers
    });
    setResult(attempt);
    setIsFinished(true);
  };

  if (isFinished && result) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-full max-w-sm">
          <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl shadow-indigo-200 animate-bounce">🏆</div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Tebrikler!</h2>
          <p className="text-slate-500 font-bold mb-10 text-sm sm:text-base">Sınavı başarıyla tamamladın.</p>
          
          <div className="flex justify-center gap-6 mb-12">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex-1">
              <p className="text-4xl font-black text-indigo-600 leading-none mb-2">{result.score}<span className="text-xs text-slate-300 ml-1">/{result.totalQuestions}</span></p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Doğru Sayısı</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex-1">
              <p className="text-4xl font-black text-emerald-600 leading-none mb-2">%{Math.round((result.score/result.totalQuestions)*100)}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Başarı Oranı</p>
            </div>
          </div>
          <button onClick={onComplete} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">Panele Dön</button>
        </div>
      </div>
    );
  }

  const currentQuestion = randomizedQuestions[currentQuestionIndex];
  if (!currentQuestion || answers.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-slate-50 z-[90] flex flex-col h-full overflow-hidden">
      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-200 sticky top-0">
        <button onClick={onCancel} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">✕ Terket</button>
        <div className="flex flex-col items-center">
           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-0.5">{test.title}</span>
           <span className="text-sm font-black text-slate-900 leading-none">{currentQuestionIndex + 1} / {randomizedQuestions.length}</span>
        </div>
        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden absolute bottom-0 left-0">
           <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / randomizedQuestions.length) * 100}%` }}></div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 border-b-4 border-b-indigo-500">
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">{currentQuestion.text}</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {currentQuestion.options.map((opt, idx) => {
              let style = "border-white bg-white shadow-sm hover:shadow-md";
              if (answers[currentQuestionIndex] === idx) style = "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-indigo-100 ring-4 ring-indigo-500/5";
              if (showFeedback) {
                if (idx === currentQuestion.correctAnswer) style = "border-green-500 bg-green-50 text-green-700 font-bold scale-[1.02] shadow-green-100";
                else if (answers[currentQuestionIndex] === idx) style = "border-red-500 bg-red-50 text-red-700 shadow-red-100";
                else style = "opacity-40 border-slate-100 grayscale";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all flex items-center gap-4 sm:gap-6 group active:scale-[0.98] ${style}`}
                >
                  <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-base sm:text-lg shrink-0 transition-colors ${answers[currentQuestionIndex] === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-lg font-bold">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 p-6 flex items-center justify-between sticky bottom-0">
        <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className={`px-6 py-3 font-black text-xs uppercase tracking-widest transition-all ${currentQuestionIndex === 0 ? 'opacity-0' : 'text-slate-400 hover:text-slate-900'}`}>Geri</button>
        {currentQuestionIndex === randomizedQuestions.length - 1 ? (
          <button onClick={handleSubmit} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">Sınavı Bitir</button>
        ) : (
          <button onClick={handleNext} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">İleri</button>
        )}
      </div>
    </div>
  );
};

export default TestTaker;
