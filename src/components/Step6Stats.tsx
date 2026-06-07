/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { 
  BarChart3, Download, ArrowLeft, Users, Calendar, Award, AlertCircle, Sparkles, Scale, Search
} from 'lucide-react';
import { Teacher, StatsMap, Session } from '../types';

interface Step6StatsProps {
  teachers: Teacher[];
  statsData: StatsMap;
  sessions: Session[];
  onBack: () => void;
  exportExcel: () => void;
}

export default function Step6Stats({
  teachers,
  statsData,
  sessions,
  onBack,
  exportExcel
}: Step6StatsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Phân tích các chỉ số cơ bản
  const statsList = useMemo(() => {
    return Object.keys(statsData).map(id => {
      const teacher = teachers.find(t => t.id === id);
      return {
        id,
        name: teacher ? teacher.name : 'Giáo viên ẩn danh',
        group: teacher ? teacher.group : 'Không rõ',
        count: statsData[id]?.count || 0,
        roles: statsData[id]?.roles || { GT1: 0, GT2: 0, DP: 0 }
      };
    }).sort((a, b) => b.count - a.count); // Xếp từ cao xuống thấp
  }, [teachers, statsData]);

  const statsListFiltered = useMemo(() => {
    if (!searchTerm.trim()) return statsList;
    return statsList.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.group.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [statsList, searchTerm]);

  // Các KPI
  const kpis = useMemo(() => {
    const totalTeachers = teachers.length;
    const totalAssignments = statsList.reduce((acc, curr) => acc + curr.count, 0);
    const average = totalTeachers > 0 ? totalAssignments / totalTeachers : 0;
    
    const counts = statsList.map(s => s.count);
    const max = counts.length > 0 ? Math.max(...counts) : 0;
    const min = counts.length > 0 ? Math.min(...counts) : 0;

    // Tìm những giáo viên gánh nhiều nhất và ít nhất
    const topLoadTeachers = statsList.filter(s => s.count === max).map(s => s.name).slice(0, 2).join(', ');
    const bottomLoadTeachers = statsList.filter(s => s.count === min).map(s => s.name).slice(0, 2).join(', ');

    return {
      totalTeachers,
      average: average.toFixed(1),
      max,
      min,
      diff: max - min,
      topNames: topLoadTeachers || 'Không có',
      bottomNames: bottomLoadTeachers || 'Không có'
    };
  }, [teachers, statsList]);

  // 2. Thống kê theo Tổ bộ môn (Group by Department)
  const departmentStats = useMemo(() => {
    const deptMap: { [group: string]: { totalCount: number; teachersCount: number } } = {};
    
    statsList.forEach(s => {
      if (!deptMap[s.group]) {
        deptMap[s.group] = { totalCount: 0, teachersCount: 0 };
      }
      deptMap[s.group].totalCount += s.count;
      deptMap[s.group].teachersCount += 1;
    });

    return Object.keys(deptMap).map(group => {
      const info = deptMap[group];
      const avg = info.teachersCount > 0 ? info.totalCount / info.teachersCount : 0;
      return {
        group,
        totalCount: info.totalCount,
        teachersCount: info.teachersCount,
        avg: avg.toFixed(1)
      };
    }).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));
  }, [statsList]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Scale size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950 font-sans tracking-tight">
              Báo cáo & Thống kê độ công bằng gánh tải
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Phân tích biểu đồ phân bổ tải ca coi thi của từng cán bộ và xem xét chênh lệch nhiệm vụ giữa các tổ bộ môn.
            </p>
          </div>
        </div>

        <button 
          onClick={exportExcel} 
          type="button"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Download size={14} className="stroke-[2.5]" />
          Xuất toàn bộ bảng biểu (.xlsx)
        </button>
      </div>

      {/* KPI Panel Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1 */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nhân lực</span>
            <Users size={16} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{kpis.totalTeachers}</div>
            <div className="text-[10px] text-slate-400 mt-1">Tổng giáo viên tham gia coi thi</div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hệ số tải</span>
            <Calendar size={16} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{kpis.average}</div>
            <div className="text-[10px] text-slate-400 mt-1">Số ca coi thi bình quân / Người</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Giới hạn tải</span>
            <Award size={16} className="text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{kpis.max} ca</div>
            <div className="text-[10px] text-slate-400 mt-1 truncate" title={kpis.topNames}>
              Cao nhất: {kpis.topNames}
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chênh lệch tải</span>
            <Scale size={16} className="text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">± {kpis.diff} ca</div>
            <div className="text-[10px] text-slate-400 mt-1 truncate" title={kpis.bottomNames}>
              Thấp nhất: {kpis.bottomNames}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Bento-style split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Cột Trái & Giữa: Biểu đồ phân bổ tải theo giáo viên */}
        <div className="lg:col-span-2 border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h3 className="font-semibold text-slate-950 text-sm">
                Biểu đồ xấp xỉ phân phối ca coi thi
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Các thanh tiến trình Indigo biểu diễn trực quan tải làm việc. Màu đỏ thể hiện tải tối đa, xanh thể hiện tải mỏng.
              </p>
            </div>

            <div className="relative w-full sm:w-48">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm cán bộ..."
                className="w-full pl-7.5 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin flex-1">
            {statsListFiltered.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-10">Không tìm thấy cán bộ tương ứng với từ khóa.</div>
            ) : (
              statsListFiltered.map((s, idx) => {
                const maxAllowed = kpis.max > 0 ? kpis.max : 1;
                const percentage = Math.min(100, (s.count / maxAllowed) * 100);
                
                // Quyết định màu sắc dựa trên số ca thi
                let barColor = 'bg-indigo-600';
                if (s.count === kpis.max) {
                  barColor = 'bg-rose-500'; // Đỏ thể hiện bận nhiều nhất
                } else if (s.count === kpis.min) {
                  barColor = 'bg-emerald-500'; // Xanh mát cho ai coi ít nhất
                } else if (s.count > parseFloat(kpis.average)) {
                  barColor = 'bg-indigo-600';
                } else {
                  barColor = 'bg-indigo-400';
                }

                return (
                  <div key={s.id} className="flex items-center gap-4 text-xs">
                    <div className="w-6 text-slate-400 font-mono text-right select-none">{idx + 1}</div>
                    
                    <div className="w-1/4 min-w-[120px]">
                      <span className="font-semibold text-slate-900 block truncate">{s.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">Tổ: {s.group}</span>
                    </div>

                    <div className="flex-1 bg-slate-100 rounded-full h-3 relative overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <div className="w-16 text-right font-bold text-slate-800 font-mono whitespace-nowrap">
                      {s.count} ca
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cột Phải: Thống kê Gánh tải theo Tổ bộ môn */}
        <div className="border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-950 text-sm mb-1">
              Phân tích theo Tổ chuyên môn
            </h3>
            <p className="text-[10px] text-slate-500 mb-5">
              So sánh chỉ số bình quân số ca gánh vác của từng bộ môn trong trường để có phương án điều hòa phòng ban.
            </p>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {departmentStats.map((d, index) => {
                const ratioVal = Math.min(100, (parseFloat(d.avg) / 5) * 100);
                return (
                  <div key={d.group} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-800">{d.group}</span>
                      <span className="text-slate-400 text-[10px]">{d.teachersCount} GV — TB <span className="font-bold text-slate-700">{d.avg} ca</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600/70 h-full rounded-full"
                        style={{ width: `${ratioVal}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex items-start gap-2 text-[10px] text-slate-400 bg-indigo-50/20 p-2.5 rounded-xl">
            <Sparkles size={14} className="text-indigo-500 shrink-0 mt-0.5" />
            <span>
              <strong>Kinh nghiệm học đường:</strong> Thống kê giúp đảm bảo giáo viên tổ xã hội hoặc kỹ thuật không bị dồn gánh nặng coi quá nhiều ca hơn tổ Tự nhiên chính.
            </span>
          </div>
        </div>

      </div>

      {/* Navigation Controls */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-start">
        <button
          onClick={onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          Quay lại xem dánh sách Lịch coi
        </button>
      </div>

    </div>
  );
}
