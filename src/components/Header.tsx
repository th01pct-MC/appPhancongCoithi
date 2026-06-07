/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, RefreshCw, Trash2 } from 'lucide-react';
import SchoolLogo from './SchoolLogo';

interface HeaderProps {
  onLoadSample: () => void;
  onClearAll: () => void;
  hasData: boolean;
}

export default function Header({ onLoadSample, onClearAll, hasData }: HeaderProps) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <SchoolLogo size={48} className="shadow-md shadow-sky-500/10" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Hệ thống Phân lịch Coi thi
            </h1>
            <p className="text-xs text-indigo-300 font-medium tracking-wide">
              Trường THPT Phan Châu Trinh • Đà Nẵng
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3.5">
          <button
            onClick={onLoadSample}
            type="button"
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            Nạp dữ liệu mẫu
          </button>
          
          {hasData && (
            <button
              onClick={onClearAll}
              type="button"
              className="px-4 py-2 text-xs font-semibold bg-rose-950/40 hover:bg-rose-950/80 active:bg-rose-950/40 text-rose-300 hover:text-rose-200 rounded-lg border border-rose-900/50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13.5} />
              Xóa toàn bộ dữ liệu
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
