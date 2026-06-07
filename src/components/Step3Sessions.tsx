/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CalendarDays, Plus, Trash2, ArrowLeft, ArrowRight, BookOpen 
} from 'lucide-react';
import { Session } from '../types';

interface Step3SessionsProps {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  onNext: () => void;
  onBack: () => void;
  onLoadSampleSessions: () => void;
}

export default function Step3Sessions({
  sessions,
  setSessions,
  onNext,
  onBack,
  onLoadSampleSessions
}: Step3SessionsProps) {

  // Thêm mới buổi coi thi trống
  const addNewSession = () => {
    // Tự động suy luận ngày tiếp theo hoặc ngày hiện tại kế thừa buổi cuối
    let nextDate = '12/06/2026';
    let nextShift: "Sáng" | "Chiều" | "Tối" = 'Sáng';
    
    if (sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1];
      nextDate = lastSession.date;
      nextShift = lastSession.shift === 'Sáng' ? 'Chiều' : 'Sáng';
    }

    const newSes: Session = {
      id: `ses_custom_${Date.now()}`,
      date: nextDate,
      shift: nextShift,
      subject: '',
      grade: '10',
      rooms: 8,
      teachersPerRoom: 2,
      backupTeachers: 1
    };

    setSessions(prev => [...prev, newSes]);
  };

  const updateSessionField = (index: number, field: keyof Session, value: any) => {
    setSessions(prev => prev.map((s, idx) => {
      if (idx === index) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const removeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const clearAllSessions = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch các buổi thi?')) {
      setSessions([]);
    }
  };

  // Tính tổng số lượng giám thị cần xếp trong toàn bộ kỳ thi
  const totalProctorsRequired = sessions.reduce((acc, s) => {
    const perRoom = s.teachersPerRoom || 0;
    const backup = parseInt(s.backupTeachers.toString()) || 0;
    return acc + (s.rooms * perRoom) + backup;
  }, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarDays size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950 font-sans tracking-tight">
              Khai báo các buổi thi (Lịch thi)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Xây dựng danh sách các buổi thi, số phòng thi, định mức giám thị mỗi phòng và số cán bộ dự trữ.
            </p>
          </div>
        </div>

        {sessions.length === 0 && (
          <button
            onClick={onLoadSampleSessions}
            type="button"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl px-4 py-2.5 border border-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen size={14} />
            Nạp nhanh lịch thi mẫu
          </button>
        )}
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
            <div className="text-xs text-slate-500">
              Tổng số buổi coi thi đã tạo: <span className="font-bold text-slate-800">{sessions.length}</span>
            </div>
            <div className="text-xs text-slate-500 text-right">
              Tổng định suất giám thị cần xếp: <span className="font-bold text-indigo-600 text-sm">{totalProctorsRequired} lượt người</span>
            </div>
          </div>

          <div className="space-y-4">
            {sessions.map((session, index) => {
              const perRoom = session.teachersPerRoom || 0;
              const backup = parseInt(session.backupTeachers.toString()) || 0;
              const totalNeeded = (session.rooms * perRoom) + backup;

              return (
                <div 
                  key={session.id} 
                  className="border border-slate-100 bg-slate-50/40 rounded-2xl p-5 relative hover:shadow-sm transition-shadow border-l-4 border-l-indigo-500"
                >
                  {/* Top corner action bar */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded">
                      Buổi {index + 1}
                    </span>
                    <button 
                      onClick={() => removeSession(session.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa buổi này"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    {/* Ngày thi */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Ngày thi
                      </label>
                      <input 
                        type="text" 
                        placeholder="12/06/2026" 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition-colors"
                        value={session.date} 
                        onChange={e => updateSessionField(index, 'date', e.target.value)} 
                      />
                    </div>

                    {/* Buổi ca */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Ca thi
                      </label>
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none transition-colors appearance-none cursor-pointer"
                        value={session.shift} 
                        onChange={e => updateSessionField(index, 'shift', e.target.value)}
                      >
                        <option value="Sáng">Sáng</option>
                        <option value="Chiều">Chiều</option>
                        <option value="Tối">Tối</option>
                      </select>
                    </div>

                    {/* Môn thi */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Bài kiểm tra / Môn thi
                      </label>
                      <input 
                        type="text" 
                        placeholder="VD: Toán học, Tổ hợp tự nhiên..." 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none transition-colors"
                        value={session.subject} 
                        onChange={e => updateSessionField(index, 'subject', e.target.value)} 
                      />
                    </div>

                    {/* Khối lớp */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Khối/Lớp
                      </label>
                      <input 
                        type="text" 
                        placeholder="VD: 12" 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none transition-colors"
                        value={session.grade} 
                        onChange={e => updateSessionField(index, 'grade', e.target.value)} 
                      />
                    </div>

                    {/* Số phòng thi */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Số lượng phòng thi
                      </label>
                      <input 
                        type="number" 
                        min="1" 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none transition-colors"
                        value={session.rooms} 
                        onChange={e => updateSessionField(index, 'rooms', Math.max(1, parseInt(e.target.value) || 0))} 
                      />
                    </div>

                    {/* Định mức cán bộ phòng */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Số giám thị / Phòng
                      </label>
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none transition-colors cursor-pointer"
                        value={session.teachersPerRoom} 
                        onChange={e => updateSessionField(index, 'teachersPerRoom', parseInt(e.target.value) || 1)}
                      >
                        <option value={1}>1 Giám thị</option>
                        <option value={2}>2 Giám thị</option>
                      </select>
                    </div>

                    {/* Giám thị dự phòng */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Bộ phận Dự phòng
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none transition-colors"
                        value={session.backupTeachers} 
                        onChange={e => updateSessionField(index, 'backupTeachers', Math.max(0, parseInt(e.target.value) || 0))} 
                      />
                    </div>
                  </div>

                  {/* Summary of this session */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                    <div>
                      Công thức tính: ({session.rooms} phòng × {perRoom} GT) + {backup} dự phòng
                    </div>
                    <div>
                      Nhu cầu buổi này: <span className="font-bold text-slate-800">{totalNeeded} cán bộ coi thi</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={addNewSession} 
              type="button"
              className="flex-1 py-3.5 border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-600 hover:text-indigo-700 rounded-2xl bg-white hover:bg-slate-50 transition-all flex justify-center items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <Plus size={16} className="stroke-[2.5]" />
              Thêm mới một buổi thi khác
            </button>

            {sessions.length > 0 && (
              <button 
                onClick={clearAllSessions} 
                type="button"
                className="px-5 py-3 border border-rose-100 hover:border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-2xl transition-colors cursor-pointer"
              >
                Xóa tất cả các buổi
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
          <CalendarDays className="text-slate-400 mb-3" size={36} />
          <h3 className="text-sm font-semibold text-slate-900">Chưa khai báo buổi lịch thi nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">
            Bạn cần thiết lập các ca thi và số lượng phòng để hệ thống xếp cán bộ giám thị.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
            <button
              onClick={addNewSession}
              type="button"
              className="bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> Thêm ca coi thi thủ công
            </button>
            <button
              onClick={onLoadSampleSessions}
              type="button"
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs px-5 py-2.5 rounded-xl border border-indigo-100/60 cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen size={13} /> Khởi tạo bộ lịch mẫu
            </button>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
        <button
          onClick={onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          Quay lại Giáo viên
        </button>
        
        <button
          onClick={onNext}
          disabled={sessions.length === 0}
          className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:gap-3 transition-all cursor-pointer ${
            sessions.length === 0 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/10'
          }`}
        >
          Tiếp tục phần Quy tắc
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
