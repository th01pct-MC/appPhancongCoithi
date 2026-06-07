/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, Download, RefreshCw, AlertCircle, ArrowLeft, ArrowRight, Search, Check, AlertTriangle, User, HelpCircle
} from 'lucide-react';
import { RoomAssignment, Teacher, Session } from '../types';
import SchoolLogo from './SchoolLogo';

interface Step5ResultProps {
  scheduleData: RoomAssignment[];
  teachers: Teacher[];
  sessions: Session[];
  logs: string[];
  onBack: () => void;
  onNext: () => void;
  exportExcel: () => void;
  onReassignTeacher: (sessionId: string, room: string, role: 'gt1' | 'gt2', newTeacherId: string | null) => void;
  showNotif: (msg: string, type?: 'success' | 'error') => void;
}

export default function Step5Result({
  scheduleData,
  teachers,
  sessions,
  logs,
  onBack,
  onNext,
  exportExcel,
  onReassignTeacher,
  showNotif
}: Step5ResultProps) {
  const [highlightTeacherId, setHighlightTeacherId] = useState('');
  
  // State phục vụ việc dán nhãn biên tập thủ công
  const [editingCell, setEditingCell] = useState<{ sessionId: string; room: string; role: 'gt1' | 'gt2' } | null>(null);

  // Nhóm kết quả theo Sessions
  const groupedSchedule = useMemo(() => {
    const groups: { [sessionId: string]: RoomAssignment[] } = {};
    scheduleData.forEach(row => {
      if (!groups[row.sessionId]) {
        groups[row.sessionId] = [];
      }
      groups[row.sessionId].push(row);
    });
    return groups;
  }, [scheduleData]);

  // Bộ lọc tìm kiếm & highlight
  const filteredSessionsIds = useMemo(() => {
    if (!highlightTeacherId) return null;
    
    // Tìm các Sessions mà giáo viên được highlight tham gia
    const uppercaseId = highlightTeacherId.toLowerCase();
    const activeSesIds = new Set<string>();
    
    scheduleData.forEach(row => {
      const g1 = row.gt1?.name.toLowerCase() || '';
      const g2 = row.gt2?.name.toLowerCase() || '';
      const g1Org = row.gt1?.group.toLowerCase() || '';
      const g2Org = row.gt2?.group.toLowerCase() || '';
      
      if (g1.includes(uppercaseId) || g2.includes(uppercaseId) || g1Org.includes(uppercaseId) || g2Org.includes(uppercaseId)) {
        activeSesIds.add(row.sessionId);
      }
    });
    
    return activeSesIds;
  }, [scheduleData, highlightTeacherId]);

  // Hàm tính trạng thái bận để đề xuất giáo viên rảnh cho một ca thi nhất định
  const getAvailableTeachersForSession = (sessionId: string, date: string, shift: string, currentTeacherIdToIgnore: string | null) => {
    // 1. Phân tích xem ai bận báo trước
    const cleanSessionDateShift = `${date}_${shift}`.toLowerCase().trim();
    
    // 2. Phân tích ai ĐÃ ĐƯỢC PHÂN trong ca thi này ở bất kỳ phòng nào
    const alreadyAssignedIds = scheduleData
      .filter(row => row.sessionId === sessionId && row.gt1?.id !== currentTeacherIdToIgnore && row.gt2?.id !== currentTeacherIdToIgnore)
      .map(row => [row.gt1?.id, row.gt2?.id])
      .flat()
      .filter((id): id is string => typeof id === 'string');

    return teachers.filter(t => {
      // Bỏ qua nếu đã coi phòng khác trong buổi thi này
      if (alreadyAssignedIds.includes(t.id)) return false;
      
      // Bỏ qua nếu giáo viên báo bận buổi này
      if (t.busyShifts) {
        const busyList = t.busyShifts.split(',').map(s => s.toLowerCase().trim());
        const isBusy = busyList.some(busy => {
          if (!busy) return false;
          if (busy === cleanSessionDateShift) return true;
          if (cleanSessionDateShift.includes(busy) || busy.includes(cleanSessionDateShift)) return true;
          return false;
        });
        if (isBusy) return false;
      }

      return true;
    }).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 animate-fade-in flex flex-col" style={{ minHeight: '70vh' }}>
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <SchoolLogo size={48} className="shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight">
              Biểu lịch coi thi hoàn chỉnh
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tra cứu lịch coi thi của từng phòng, can thiệp điều chỉnh nhân sự rảnh thủ công, và tải file Excel báo cáo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 self-stretch md:self-auto justify-end">
          <button 
            onClick={exportExcel} 
            type="button"
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download size={14} className="stroke-[2.5]" />
            Xuất hóa đơn Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Warning Logs Notification If Any */}
      {logs.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl text-xs">
          <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
            <AlertCircle size={15} className="text-amber-600" />
            Kiểm tra ràng buộc hệ thống ({logs.length} khuyến nghị):
          </h4>
          <ul className="list-disc pl-5 text-slate-600 space-y-1 max-h-24 overflow-y-auto font-mono text-[10px]">
            {logs.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Highlight Tool */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Góc tra cứu nhanh: Nhập Tên giáo viên hoặc Tổ môn để xem lịch riêng..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-indigo-500"
            value={highlightTeacherId}
            onChange={e => setHighlightTeacherId(e.target.value)}
          />
        </div>
        {highlightTeacherId && (
          <button
            onClick={() => setHighlightTeacherId('')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            Xóa bộ chọn lọc
          </button>
        )}
      </div>

      {/* Main Schedule Visual Output Table */}
      <div className="flex-1 overflow-x-auto border border-slate-200/80 rounded-2xl shadow-inner scrollbar-thin">
        <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="p-3.5 border-r border-slate-800 w-[180px]">Ca thi / Buổi</th>
              <th className="p-3.5 border-r border-slate-800 w-[100px] text-center">Phòng thi</th>
              <th className="p-3.5 border-r border-slate-800 w-[150px]">Khối / Lớp / Bài thi</th>
              <th className="p-3.5 border-r border-slate-800 w-[220px]">Giám thị 1 / Cán bộ 1</th>
              <th className="p-3.5 border-r border-slate-800 w-[220px]">Giám thị 2 / Cán bộ 2</th>
              <th className="p-3.5">Ghi chú nghiệp vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sessions.map(session => {
              const sessionRows = groupedSchedule[session.id] || [];
              
              // Nếu đang highlight và buổi thi này không chứa giáo viên nào được highlight thì xếp gọn hoặc làm mờ đi
              const isFilteredOut = filteredSessionsIds !== null && !filteredSessionsIds.has(session.id);
              
              if (sessionRows.length === 0) return null;

              return (
                <React.Fragment key={session.id}>
                  {/* Session Header row */}
                  <tr className={`bg-indigo-50/80 transition-opacity duration-200 ${isFilteredOut ? 'opacity-30' : ''}`}>
                    <td colSpan={6} className="px-4 py-2.5 font-bold text-slate-950 align-middle border-y border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-3.5 bg-indigo-600 rounded"></span>
                        {session.date} — Ca {session.shift} — Môn {session.subject} {session.grade ? `(Khối ${session.grade})` : ''}
                      </div>
                    </td>
                  </tr>

                  {/* Room rows for this session */}
                  {sessionRows.map((row, idx) => {
                    const isGt1Match = highlightTeacherId && row.gt1?.name.toLowerCase().includes(highlightTeacherId.toLowerCase());
                    const isGt2Match = highlightTeacherId && row.gt2?.name.toLowerCase().includes(highlightTeacherId.toLowerCase());
                    const isGt1OrgMatch = highlightTeacherId && row.gt1?.group.toLowerCase().includes(highlightTeacherId.toLowerCase());
                    const isGt2OrgMatch = highlightTeacherId && row.gt2?.group.toLowerCase().includes(highlightTeacherId.toLowerCase());

                    const highlightG1 = isGt1Match || isGt1OrgMatch;
                    const highlightG2 = isGt2Match || isGt2OrgMatch;
                    
                    const rowBlurClass = isFilteredOut ? 'opacity-30' : '';

                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-50/50 transition-all ${rowBlurClass}`}
                      >
                        {/* Session Date/Shift cell (Only span first) */}
                        {idx === 0 ? (
                          <td 
                            rowSpan={sessionRows.length} 
                            className="p-3.5 border-r border-slate-200 bg-slate-50/50 text-slate-500 font-mono text-[11px] align-top select-none"
                          >
                            <span className="block font-bold text-slate-800">{session.date}</span>
                            <span className="block text-[10px] mt-0.5">Ca thi {session.shift}</span>
                          </td>
                        ) : null}

                        {/* Room Name */}
                        <td className="p-3.5 border-r border-slate-200 text-center font-bold text-slate-800 bg-slate-50/20">
                          {row.room}
                        </td>

                        {/* Subject info */}
                        <td className="p-3.5 border-r border-slate-200 text-slate-600 text-[11px]">
                          <span className="block font-medium truncate max-w-[140px]">{session.subject}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">Khối {session.grade}</span>
                        </td>

                        {/* Giám thị 1 cell (cho phép hoán đổi thủ công ngay lập tức) */}
                        <td 
                          className={`p-3 border-r border-slate-200 transition-colors relative cursor-pointer group/cell ${
                            highlightG1 ? 'bg-amber-100/90 font-semibold' : ''
                          } ${row.isBackup ? 'bg-amber-50/20' : ''}`}
                        >
                          {editingCell?.sessionId === row.sessionId && editingCell?.room === row.room && editingCell?.role === 'gt1' ? (
                            <div className="flex items-center gap-1">
                              <select
                                className="w-full bg-white border border-indigo-500 outline-none p-1 rounded font-sans text-xs"
                                value={row.gt1?.id || ''}
                                autoFocus
                                onBlur={() => setTimeout(() => setEditingCell(null), 150)}
                                onChange={e => {
                                  const val = e.target.value;
                                  onReassignTeacher(row.sessionId, row.room, 'gt1', val === '' ? null : val);
                                  setEditingCell(null);
                                }}
                              >
                                <option value="">-- Trống / Thiếu người --</option>
                                {getAvailableTeachersForSession(row.sessionId, row.date, row.shift, row.gt1?.id || null).map(t => (
                                  <option key={t.id} value={t.id}>{t.name} (Tổ {t.group})</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div 
                              onClick={() => setEditingCell({ sessionId: row.sessionId, room: row.room, role: 'gt1' })}
                              className="flex items-center justify-between"
                              title="Click để đổi nhanh giáo viên khác"
                            >
                              {row.gt1 ? (
                                <div>
                                  <span className="font-semibold text-slate-950 block">{row.gt1.name}</span>
                                  <span className="text-[10px] text-slate-400 block font-normal">Tổ {row.gt1.group}</span>
                                </div>
                              ) : (
                                <span className="text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded inline-block">
                                  {row.isBackup ? 'Không có dự trữ' : '⚠️ Thiếu người'}
                                </span>
                              )}
                              
                              <span className="text-[9px] text-indigo-500 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-indigo-50 px-1.5 py-0.5 rounded font-bold font-sans">
                                ĐỔI GV
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Giám thị 2 cell (cho phép hoán đổi thủ công ngay lập tức) */}
                        <td 
                          className={`p-3 border-r border-slate-200 transition-colors relative cursor-pointer group/cell ${
                            highlightG2 ? 'bg-amber-100/90 font-semibold' : ''
                          } ${row.isBackup ? 'bg-slate-100/30' : ''}`}
                        >
                          {row.isBackup ? (
                            <span className="text-slate-400 italic font-mono">-</span>
                          ) : editingCell?.sessionId === row.sessionId && editingCell?.room === row.room && editingCell?.role === 'gt2' ? (
                            <div className="flex items-center gap-1">
                              <select
                                className="w-full bg-white border border-indigo-500 outline-none p-1 rounded font-sans text-xs"
                                value={row.gt2?.id || ''}
                                autoFocus
                                onBlur={() => setTimeout(() => setEditingCell(null), 150)}
                                onChange={e => {
                                  const val = e.target.value;
                                  onReassignTeacher(row.sessionId, row.room, 'gt2', val === '' ? null : val);
                                  setEditingCell(null);
                                }}
                              >
                                <option value="">-- Trống / Thiếu người --</option>
                                {getAvailableTeachersForSession(row.sessionId, row.date, row.shift, row.gt2?.id || null).map(t => (
                                  <option key={t.id} value={t.id}>{t.name} (Tổ {t.group})</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div 
                              onClick={() => session.teachersPerRoom >= 2 && setEditingCell({ sessionId: row.sessionId, room: row.room, role: 'gt2' })}
                              className="flex items-center justify-between"
                              title={session.teachersPerRoom >= 2 ? "Click để đổi nhanh giáo viên khác" : ""}
                            >
                              {row.gt2 ? (
                                <div>
                                  <span className="font-semibold text-slate-950 block">{row.gt2.name}</span>
                                  <span className="text-[10px] text-slate-400 block font-normal">Tổ {row.gt2.group}</span>
                                </div>
                              ) : (
                                session.teachersPerRoom >= 2 ? (
                                  <span className="text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded inline-block">
                                    ⚠️ Thiếu người
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">-</span>
                                )
                              )}

                              {session.teachersPerRoom >= 2 && (
                                <span className="text-[9px] text-indigo-500 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-indigo-50 px-1.5 py-0.5 rounded font-bold font-sans">
                                  ĐỔI GV
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Ghi chú */}
                        <td className="p-3.5 text-xs text-slate-400">
                          {row.isBackup && (
                            <span className="inline-block bg-amber-50 text-amber-700 px-2 py-0.5 border border-amber-100 rounded text-[10px] font-bold uppercase tracking-wider">
                              Giám thị Dự phòng
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mt-0.5">
            i
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>Mẹo biên tập nhanh:</strong> Bạn có thể bổ nhiệm giáo viên rảnh vào các phòng trống, hoặc hoán chuyển cán bồ trực tiếp bằng việc **click thẳng vào ô tên giám thị** trên bảng biểu lịch coi thi này. Thống kê độ công bằng sẽ tự động cập nhật ngay lập tức.
          </p>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
        <button
          onClick={onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          Chỉnh sửa Quy tắc
        </button>
        
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:gap-3 transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
        >
          Đến phần Thống kê Công bằng
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
