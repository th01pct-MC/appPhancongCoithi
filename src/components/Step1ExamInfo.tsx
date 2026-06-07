/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Info, ArrowRight, BookOpen } from 'lucide-react';
import { ExamInfo } from '../types';
import SchoolLogo from './SchoolLogo';

interface Step1ExamInfoProps {
  examInfo: ExamInfo;
  setExamInfo: (info: ExamInfo) => void;
  onNext: () => void;
  onLoadSample: () => void;
}

export default function Step1ExamInfo({
  examInfo,
  setExamInfo,
  onNext,
  onLoadSample
}: Step1ExamInfoProps) {
  const yearsList = ["2025-2026", "2026-2027", "2027-2028"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 mb-8 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hidden sm:block">
            <Info size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight">
              Thông tin Kỳ thi / Kiểm tra
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Khai báo các thông số cơ bản phục vụ hiển thị trên tiêu đề lịch coi thi và trích xuất file Excel.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-250/50 self-stretch md:self-auto justify-center sm:justify-start shadow-sm shadow-slate-100">
          <SchoolLogo size={42} className="shrink-0" />
          <div className="text-left">
            <p className="text-[9px] uppercase font-bold tracking-wider text-indigo-650">Logo Nhà Trường</p>
            <p className="text-xs font-semibold text-slate-700">THPT Phan Châu Trinh</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Tên kỳ thi / kiểm tra <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="VD: Kiểm tra cuối học kỳ II"
            value={examInfo.examName}
            onChange={e => setExamInfo({ ...examInfo, examName: e.target.value })}
            id="exam-name-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Năm học
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            value={examInfo.year}
            onChange={e => setExamInfo({ ...examInfo, year: e.target.value })}
            id="exam-year-select"
          >
            {yearsList.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Tên Trường / Đơn vị
          </label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="VD: Trường THPT Chu Văn An"
            value={examInfo.schoolName}
            onChange={e => setExamInfo({ ...examInfo, schoolName: e.target.value })}
            id="exam-school-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Người lập biểu
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="VD: Nguyễn Văn A"
              value={examInfo.creator}
              onChange={e => setExamInfo({ ...examInfo, creator: e.target.value })}
              id="exam-creator-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Chức vụ / Chức danh
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="VD: Phó Hiệu Trưởng"
              value={examInfo.role}
              onChange={e => setExamInfo({ ...examInfo, role: e.target.value })}
              id="exam-role-input"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Ghi chú chung cho kỳ thi (Hiển thị đầu trang kết quả)
          </label>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-24 resize-none placeholder:text-slate-400"
            placeholder="VD: Giám thị có mặt trước ca thi 15 phút để bốc thăm phòng thi..."
            value={examInfo.note}
            onChange={e => setExamInfo({ ...examInfo, note: e.target.value })}
            id="exam-note-textarea"
          ></textarea>
        </div>
      </div>

      {/* Suggestion Card */}
      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen size={16} />
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Bạn chưa chuẩn bị sẵn danh sách giáo viên hoặc lịch thi? Bạn có thể nạp nhanh dữ liệu mẫu chuẩn để trải nghiệm lập tức.
          </p>
        </div>
        <button
          onClick={onLoadSample}
          type="button"
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100/80 active:bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          Trải nghiệm nhanh với dữ liệu mẫu
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:gap-3 transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
          id="btn-next-step-1"
        >
          Tiếp tục phần Giáo viên
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
