/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, RefreshCw, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import { Rules, Teacher, Session } from '../types';

interface Step4RulesProps {
  rules: Rules;
  setRules: React.Dispatch<React.SetStateAction<Rules>>;
  teachers: Teacher[];
  sessions: Session[];
  onBack: () => void;
  onRunAlgorithm: () => void;
  hasSchedule: boolean;
  onNext: () => void;
}

export default function Step4Rules({
  rules,
  setRules,
  teachers,
  sessions,
  onBack,
  onRunAlgorithm,
  hasSchedule,
  onNext
}: Step4RulesProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Tính toán nhu cầu xếp cán bộ thi
  const totalDemand = sessions.reduce((acc, s) => {
    return acc + (s.rooms * s.teachersPerRoom) + (parseInt(s.backupTeachers.toString()) || 0);
  }, 0);

  // Tính toán năng lực thực tế tối đa của đội ngũ cán bộ thi hiện có
  const totalCapacity = teachers.reduce((acc, t) => {
    const max = parseInt(t.maxShifts.toString()) || 4;
    return acc + max;
  }, 0);

  // Điểm đánh giá mức độ đáp ứng (tỷ lệ Supply / Demand)
  const ratio = totalDemand > 0 ? totalCapacity / totalDemand : 0;
  const averageShiftsPerTeacher = teachers.length > 0 ? totalDemand / teachers.length : 0;

  let assessment = {
    status: 'good',
    message: 'Nguồn nhân lực dồi dào, xếp lịch thoải mái.',
    colorBg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    colorText: 'text-emerald-600',
    icon: <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-50" />
  };

  if (ratio < 1.0) {
    assessment = {
      status: 'danger',
      message: 'Nguy cơ THIẾU GIÁO VIÊN trầm trọng! Tổng số buổi coi thi yêu cầu vượt quá định mức tối đa của cả đoàn giáo viên.',
      colorBg: 'bg-rose-50 text-rose-800 border-rose-100',
      colorText: 'text-rose-500',
      icon: <AlertTriangle size={18} className="text-rose-500 fill-rose-50" />
    };
  } else if (ratio < 1.3 || averageShiftsPerTeacher > 3.8) {
    assessment = {
      status: 'warning',
      message: 'Lực lượng xếp sát sàn sạt! Nhiều cán bộ bận coi thi có thể gây vướng lịch khó gỡ hoặc khó phân bổ hoàn hảo.',
      colorBg: 'bg-amber-50 text-amber-800 border-amber-100',
      colorText: 'text-amber-500',
      icon: <AlertTriangle size={18} className="text-amber-500 fill-amber-50" />
    };
  }

  // Tinh chỉnh quy tắc
  const toggleRule = (key: keyof Rules) => {
    setRules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleStartAlgorithm = () => {
    setIsRunning(true);
    const textSequence = [
      'Đang nạp hồ sơ của ' + teachers.length + ' giáo viên...',
      'Đang kiểm tra lịch trùng và buổi báo bận...',
      'Đang áp dụng bộ ràng buộc môn học trùng chéo...',
      'Đang tối ưu hóa phân phối công bằng cho từng cán bộ...',
      'Đang đồng bộ hóa dữ liệu xuất biểu lịch...',
      'Đã hoàn tất phân chia!'
    ];

    let stepIdx = 0;
    setLoadingText(textSequence[stepIdx]);

    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < textSequence.length) {
        setLoadingText(textSequence[stepIdx]);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        onRunAlgorithm();
      }
    }, 380);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 animate-fade-in">
      <div className="flex items-start gap-4 mb-8">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl animate-pulse">
          <Settings size={24} className="stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950 font-sans tracking-tight">
            Chỉ số Khả thi & Thiết lập Quy tắc phân công
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Điều chỉnh các biến số nghiệp vụ và chạy thuật toán xếp giáo viên rảnh vào các phòng thi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Cột 1: Đánh giá khả thi */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-1">
              Thống kê lượng tải & Năng lực
            </h3>

            <div className="space-y-4">
              {/* Lượt cần xếp */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                <span className="text-xs text-slate-500">Tổng nhu cầu định suất coi thi:</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{totalDemand} lượt</span>
              </div>

              {/* Lọc sức chứa */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                <span className="text-xs text-slate-500">Tổng khả năng cung ứng tốt đa:</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{totalCapacity} lượt</span>
              </div>

              {/* Bình quân */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                <span className="text-xs text-slate-500">Số buổi bình quân / Giáo viên:</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {averageShiftsPerTeacher.toFixed(1)} buổi / người
                </span>
              </div>
            </div>
          </div>

          {/* Sức chứa và độ khả thi */}
          <div className={`mt-6 border p-4 rounded-xl flex items-start gap-3 ${assessment.colorBg}`}>
            <div className="mt-0.5 whitespace-nowrap">
              {assessment.icon}
            </div>
            <div>
              <p className="font-semibold text-xs text-slate-900">
                Đánh giá mức độ khả thi
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {assessment.message}
              </p>
            </div>
          </div>
        </div>

        {/* Cột 2: Cài đặt quy tắc */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
              Cấu hình các quy tắc phần mềm
            </h3>

            <div className="space-y-3">
              {/* Công bằng */}
              <div 
                onClick={() => toggleRule('fairDistribution')}
                className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-colors"
                id="rule-fair-dist"
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    checked={rules.fairDistribution}
                    readOnly
                  />
                </div>
                <div>
                  <span className="block font-semibold text-xs text-slate-950">Ưu tiên chia đều, tuyệt đối công bằng</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Giáo viên đã coi thi ít buổi hơn luôn được chọn vào phòng trước để cân bằng lịch.</span>
                </div>
              </div>

              {/* Chống trùng ca */}
              <div 
                className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-xl select-none"
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    checked={true}
                    disabled
                  />
                </div>
                <div>
                  <span className="block font-semibold text-xs text-slate-950 flex items-center gap-1">
                    Ngăn chặn trùng lặp lịch coi <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded uppercase">Bắt buộc</span>
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Một cán bộ không thể cùng lúc coi thi ở hai phòng thi khác nhau hay vừa coi vừa dự phòng.</span>
                </div>
              </div>

              {/* Tôn trọng buổi bận */}
              <div 
                onClick={() => toggleRule('respectBusyShifts')}
                className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-colors"
                id="rule-respect-busy"
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    checked={rules.respectBusyShifts}
                    readOnly
                  />
                </div>
                <div>
                  <span className="block font-semibold text-xs text-slate-950">Tôn trọng khai báo "Buổi báo bận"</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Triệt để loại trừ giáo viên khỏi danh sách bố trí ở ca thi nằm trong buổi nghỉ phép hoặc báo bận.</span>
                </div>
              </div>

              {/* Tránh trùng môn */}
              <div 
                onClick={() => toggleRule('preventSameGroup')}
                className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-colors"
                id="rule-prevent-same"
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    checked={rules.preventSameGroup}
                    readOnly
                  />
                </div>
                <div>
                  <span className="block font-semibold text-xs text-slate-950">Tránh ghép 2 giáo viên cùng tổ bộ môn</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Phối hợp ưu tiên 2 GT ở mỗi phòng phải là người ở 2 tổ bộ môn khác nhau (giảm thiểu rủi ro gian lận).</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Algorithm Trigger Core Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {isRunning ? (
          <div className="relative z-10 flex flex-col items-center py-6">
            <RefreshCw className="animate-spin text-indigo-400 mb-4" size={32} />
            <h3 className="text-sm font-semibold tracking-wide">Thuật toán đang vận hành tối ưu...</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1 min-h-[16px]">
              {loadingText}
            </p>
          </div>
        ) : (
          <div className="relative z-10">
            <h3 className="text-base font-semibold tracking-tight">Sẵn sàng phân chia lịch tự động</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1 mb-6">
              Thuật toán thông minh sẽ thực hiện quét chéo hàng vạn lựa chọn, bám sát bộ quy tắc để tạo bảng biểu lịch lý tưởng nhất chỉ trong nháy mắt.
            </p>
            
            <button
              onClick={handleStartAlgorithm}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-medium px-8 py-3.5 rounded-xl cursor-pointer inline-flex items-center gap-2.5 transition-all shadow-lg hover:shadow-indigo-500/20 stroke-[2.3]"
              id="btn-run-algo"
            >
              <RefreshCw size={15} />
              BẮT ĐẦU XẾP LỊCH TỰ ĐỘNG
            </button>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
        <button
          onClick={onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          Quay lại Lịch thi
        </button>
        
        <button
          onClick={onNext}
          disabled={!hasSchedule}
          className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:gap-3 transition-all cursor-pointer ${
            !hasSchedule
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/10'
          }`}
        >
          Xem kết quả phân công
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
