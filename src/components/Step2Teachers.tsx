/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, Upload, Download, Trash2, Plus, ArrowLeft, ArrowRight, 
  Search, Edit2, Check, X, Filter, UserPlus
} from 'lucide-react';
import { Teacher } from '../types';

interface Step2TeachersProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  onNext: () => void;
  onBack: () => void;
  downloadTemplate: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showNotif: (msg: string, type?: 'success' | 'error') => void;
}

export default function Step2Teachers({
  teachers,
  setTeachers,
  onNext,
  onBack,
  downloadTemplate,
  handleFileUpload,
  showNotif
}: Step2TeachersProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  
  // Custom manual teacher form state
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherGroup, setNewTeacherGroup] = useState('Toán');
  const [newTeacherGender, setNewTeacherGender] = useState('Nữ');
  const [newTeacherMaxShifts, setNewTeacherMaxShifts] = useState('4');
  const [newTeacherBusyShifts, setNewTeacherBusyShifts] = useState('');
  const [newTeacherNote, setNewTeacherNote] = useState('');
  const [isAddingManually, setIsAddingManually] = useState(false);

  // Inline edit state
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [editMaxShifts, setEditMaxShifts] = useState('');
  const [editBusyShifts, setEditBusyShifts] = useState('');
  const [editNote, setEditNote] = useState('');

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Lấy danh sách tổ môn không trùng lập để làm bộ lọc
  const groupsList = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach(t => {
      if (t.group) set.add(t.group);
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Bộ lọc giáo viên
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.group.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGroup = !filterGroup || t.group === filterGroup;
      return matchSearch && matchGroup;
    });
  }, [teachers, searchTerm, filterGroup]);

  // Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fakeEvent = {
        target: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  const handleAddManualTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) {
      showNotif('Vui lòng nhập tên giáo viên', 'error');
      return;
    }

    const newTeac: Teacher = {
      id: `gv_manual_${Date.now()}`,
      tt: teachers.length + 1,
      name: newTeacherName.trim(),
      group: newTeacherGroup.trim(),
      gender: newTeacherGender,
      maxShifts: newTeacherMaxShifts || '4',
      busyShifts: newTeacherBusyShifts,
      note: newTeacherNote.trim()
    };

    setTeachers(prev => [...prev, newTeac]);
    showNotif(`Đã thêm giáo viên ${newTeac.name}`);
    
    // reset form
    setNewTeacherName('');
    setNewTeacherBusyShifts('');
    setNewTeacherNote('');
    setIsAddingManually(false);
  };

  const startEditing = (t: Teacher) => {
    setEditingTeacherId(t.id);
    setEditName(t.name);
    setEditGroup(t.group);
    setEditMaxShifts(t.maxShifts.toString());
    setEditBusyShifts(t.busyShifts);
    setEditNote(t.note);
  };

  const cancelEditing = () => {
    setEditingTeacherId(null);
  };

  const saveEditing = (id: string) => {
    if (!editName.trim()) {
      showNotif('Họ tên không được để trống', 'error');
      return;
    }
    
    setTeachers(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          name: editName.trim(),
          group: editGroup.trim(),
          maxShifts: editMaxShifts,
          busyShifts: editBusyShifts.trim(),
          note: editNote.trim()
        };
      }
      return t;
    }));

    setEditingTeacherId(null);
    showNotif('Đã cập nhật thông tin giáo viên');
  };

  const deleteTeacher = (id: string, name: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    showNotif(`Đã xóa giáo viên ${name}`);
  };

  const clearAllTeachers = () => {
    if (window.confirm('Bạn có chắc muốn xóa sạch toàn bộ danh sách giáo viên hiện tại?')) {
      setTeachers([]);
      showNotif('Đã làm trống danh sách giáo viên');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950 font-sans tracking-tight">
              Danh sách Giáo viên tham gia coi thi
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Nhập danh sách giáo viên của trường hoặc tổ bằng cách tải file Excel hoặc nạp thủ công.
            </p>
          </div>
        </div>

        <button 
          onClick={downloadTemplate} 
          type="button"
          className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-indigo-100 outline-none transition-all cursor-pointer"
        >
          <Download size={14} className="stroke-[2.2]" />
          Bộ file mẫu chuẩn (.xlsx)
        </button>
      </div>

      {/* Excel Upload Area with Drag and Drop */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50/40 scale-[1.005]' 
            : 'border-slate-300 bg-slate-50 hover:bg-slate-50/50'
        }`}
      >
        <Upload className="mx-auto text-slate-400 mb-2.5" size={32} />
        <h3 className="text-sm font-semibold text-slate-950">
          Kéo thả file Excel của bạn vào đây hoặc click để duyệt
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Hỗ trợ các định dạng .xlsx, .xls từ Excel. Chỉ đọc sheet đầu tiên.
        </p>
        
        <label className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-sm">
          <Upload size={14} />
          Chọn tệp tin từ máy tính
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            onChange={handleFileUpload} 
            id="excel-file-upload-input"
          />
        </label>
      </div>

      {/* Manual Input toggle */}
      <div className="mt-6">
        {!isAddingManually ? (
          <button
            onClick={() => setIsAddingManually(true)}
            className="text-xs text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus size={14} />
            Thêm thủ công từng giáo viên
          </button>
        ) : (
          <form onSubmit={handleAddManualTeacher} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 animate-slide-down">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Thêm giáo viên mới
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddingManually(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Lê Thị Lan"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tổ chuyên môn
                </label>
                <input
                  type="text"
                  placeholder="VD: Toán, Ngữ văn, Tiếng Anh"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                  value={newTeacherGroup}
                  onChange={e => setNewTeacherGroup(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Giới tính
                </label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                  value={newTeacherGender}
                  onChange={e => setNewTeacherGender(e.target.value)}
                >
                  <option value="Nữ">Nữ</option>
                  <option value="Nam">Nam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Số buổi thi tối đa
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                  value={newTeacherMaxShifts}
                  onChange={e => setNewTeacherMaxShifts(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Buổi bận không thể coi thi (Cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="VD: 12/06_Sáng, 13/06_Chiều"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                  value={newTeacherBusyShifts}
                  onChange={e => setNewTeacherBusyShifts(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  placeholder="VD: Hỗ trợ kỹ thuật, con nhỏ..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                  value={newTeacherNote}
                  onChange={e => setNewTeacherNote(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingManually(false)}
                className="px-4 py-2 text-xs font-medium bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Thêm giáo viên
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Teacher List Table Section */}
      {teachers.length > 0 && (
        <div className="mt-8 border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">
                Đã nạp {teachers.length} giáo viên
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, tổ..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Group filter dropdown */}
              {groupsList.length > 0 && (
                <div className="relative">
                  <select
                    className="pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    value={filterGroup}
                    onChange={e => setFilterGroup(e.target.value)}
                  >
                    <option value="">-- Tất cả tổ môn --</option>
                    {groupsList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <Filter size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              )}

              {/* Clear List Button */}
              <button
                onClick={clearAllTeachers}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-100/80 text-slate-700 text-xs font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-14 text-center">STT</th>
                  <th className="p-3.5 min-w-[150px]">Họ tên giáo viên</th>
                  <th className="p-3.5 min-w-[120px]">Tổ bộ môn</th>
                  <th className="p-3.5 w-24 text-center">Giới tính</th>
                  <th className="p-3.5 min-w-[150px]">Buổi bận tránh</th>
                  <th className="p-3.5 w-28 text-center">Tối đa ca</th>
                  <th className="p-3.5 min-w-[120px]">Ghi chú</th>
                  <th className="p-3.5 w-20 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                      Không tìm thấy giáo viên nào trùng khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t, idx) => {
                    const isEditing = editingTeacherId === t.id;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center text-xs text-slate-400 select-none">
                          {idx + 1}
                        </td>
                        
                        {/* Name */}
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="text"
                              className="w-full px-2 py-1 text-xs border border-indigo-500 rounded bg-white outline-none"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                            />
                          ) : (
                            <span className="font-semibold text-slate-900">{t.name}</span>
                          )}
                        </td>

                        {/* Group */}
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="text"
                              className="w-full px-2 py-1 text-xs border border-indigo-500 rounded bg-white outline-none"
                              value={editGroup}
                              onChange={e => setEditGroup(e.target.value)}
                            />
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                              {t.group}
                            </span>
                          )}
                        </td>

                        {/* Gender */}
                        <td className="p-3 text-center">
                          <span className={`text-xs ${t.gender === 'Nam' ? 'text-indigo-600' : 'text-rose-500'}`}>
                            {t.gender}
                          </span>
                        </td>

                        {/* Busy Shifts */}
                        <td className="p-3 text-xs font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              placeholder="12/06_Sáng..."
                              className="w-full px-2 py-1 border border-indigo-500 rounded bg-white outline-none"
                              value={editBusyShifts}
                              onChange={e => setEditBusyShifts(e.target.value)}
                            />
                          ) : (
                            t.busyShifts ? (
                              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                {t.busyShifts}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Không có</span>
                            )
                          )}
                        </td>

                        {/* Max Shifts */}
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              className="w-14 mx-auto text-center px-1 py-1 border border-indigo-500 rounded bg-white outline-none"
                              value={editMaxShifts}
                              onChange={e => setEditMaxShifts(e.target.value)}
                            />
                          ) : (
                            <span className="text-slate-900 font-mono font-medium">
                              {t.maxShifts || 'N/A'}
                            </span>
                          )}
                        </td>

                        {/* Note */}
                        <td className="p-3 text-xs text-slate-500">
                          {isEditing ? (
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-indigo-500 rounded bg-white outline-none"
                              value={editNote}
                              onChange={e => setEditNote(e.target.value)}
                            />
                          ) : (
                            t.note || '-'
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEditing(t.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(t)}
                                  className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => deleteTeacher(t.id, t.name)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Navigation Button Controls */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
        <button
          onClick={onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5  py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          Quay lại thông tin
        </button>
        
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:gap-3 transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
        >
          Tiếp tục phần Lịch thi
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
