
import React from 'react';
import { Classroom } from '../types';

interface ClassCardProps {
  classroom: Classroom;
  studentCount: number;
}

const ClassCard: React.FC<ClassCardProps> = ({ classroom, studentCount }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-xl">
          🏫
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
            Kod: {classroom.code}
          </span>
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{classroom.name}</h3>
      <p className="text-slate-500 text-sm">{studentCount} Kayıtlı Öğrenci</p>
      <div className="mt-4 pt-4 border-t border-slate-50">
        <button className="text-indigo-600 text-sm font-semibold hover:underline">
          Detayları Gör →
        </button>
      </div>
    </div>
  );
};

export default ClassCard;
