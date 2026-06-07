/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Step1ExamInfo from './components/Step1ExamInfo';
import Step2Teachers from './components/Step2Teachers';
import Step3Sessions from './components/Step3Sessions';
import Step4Rules from './components/Step4Rules';
import Step5Result from './components/Step5Result';
import Step6Stats from './components/Step6Stats';

import { ExamInfo, Teacher, Session, Rules, RoomAssignment, StatsMap } from './types';
import { SAMPLE_TEACHERS, SAMPLE_SESSIONS } from './dataSample';
import { runSchedulingAlgorithm } from './schedulerAlgorithm';

// ==========================================
// THIẾT LẬP GIÁ TRỊ KHỞI TẠO MẶC ĐỊNH
// ==========================================
const DEFAULT_EXAM_INFO: ExamInfo = {
  examName: '',
  year: '2025-2026',
  schoolName: 'THPT Phan Châu Trinh',
  creator: '',
  role: '',
  note: ''
};

const DEFAULT_RULES: Rules = {
  preventDoubleBooking: true,
  fairDistribution: true,
  respectBusyShifts: true,
  respectMaxShifts: true,
  preventSameGroup: true
};

export default function App() {
  const [step, setStep] = useState(1);
  const [examInfo, setExamInfo] = useState<ExamInfo>(DEFAULT_EXAM_INFO);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);
  const [scheduleData, setScheduleData] = useState<RoomAssignment[]>([]);
  const [statsData, setStatsData] = useState<StatsMap>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Khởi tạo thư viện XLSX (SheetJS) bằng CDN
  useEffect(() => {
    const hasXLSX = (window as any).XLSX;
    if (!hasXLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Khôi phục dữ liệu đã lưu từ LocalStorage khi khởi động
  useEffect(() => {
    const saved = localStorage.getItem('coithi_v2_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.examInfo) setExamInfo(parsed.examInfo);
        if (parsed.teachers) setTeachers(parsed.teachers);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.rules) setRules(parsed.rules);
        if (parsed.scheduleData) setScheduleData(parsed.scheduleData);
        if (parsed.statsData) setStatsData(parsed.statsData);
        if (parsed.logs) setLogs(parsed.logs);
      } catch (err) {
        console.error('Lỗi khôi phục cơ sở dữ liệu đệm LocalStorage:', err);
      }
    }
  }, []);

  // Đăng ký lưu đệm LocalStorage mỗi khi dữ liệu thay đổi
  useEffect(() => {
    localStorage.setItem('coithi_v2_data', JSON.stringify({
      examInfo, teachers, sessions, rules, scheduleData, statsData, logs
    }));
  }, [examInfo, teachers, sessions, rules, scheduleData, statsData, logs]);

  // Bộ điều hợp hiện thông báo
  const showNotif = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Đồng trị nạp mẫu thử nghiệm cấp tốc
  const handleLoadSampleData = () => {
    const sampleInfo: ExamInfo = {
      examName: 'Kỳ thi Khảo sát Chất lượng Học kỳ II',
      year: '2025-2026',
      schoolName: 'THPT Phan Châu Trinh',
      creator: 'Nguyễn Văn Đạt',
      role: 'Phó Hiệu trưởng',
      note: 'Yêu cầu cán bộ có mặt trước ca thi 20 phút để bốc thăm vị trí phòng thi và chuẩn bị tập trung bàn giao đề thi.'
    };

    setExamInfo(sampleInfo);
    setTeachers(SAMPLE_TEACHERS);
    setSessions(SAMPLE_SESSIONS);
    setRules(DEFAULT_RULES);

    // Tự động giải thuật luôn để người dùng ngắm kết quả lập tức
    const { schedule, stats, logs: algoLogs } = runSchedulingAlgorithm(SAMPLE_SESSIONS, SAMPLE_TEACHERS, DEFAULT_RULES);
    setScheduleData(schedule);
    setStatsData(stats);
    setLogs(algoLogs);

    setStep(5); // Chuyển thẳng sang trang hiển thị kế hoạch kết quả
    showNotif('Đã nạp toàn bộ cấu hình kỳ thi mẫu và tự động tạo biểu lịch xuất sắc!');
  };

  // Nạp riêng lịch thi mẫu
  const handleLoadSampleSessionsOnly = () => {
    setSessions(SAMPLE_SESSIONS);
    showNotif('Đã phục dựng nhanh 5 ca thi mẫu chất lượng cao.');
  };

  // Đồng trị xóa rỗng sạch bóng
  const handleClearAllData = () => {
    if (window.confirm('Xác nhận thao tác: Bạn muốn xóa sạch toàn bộ cấu liệu và reset cài đặt về trạng thái ban đầu?')) {
      setExamInfo(DEFAULT_EXAM_INFO);
      setTeachers([]);
      setSessions([]);
      setRules(DEFAULT_RULES);
      setScheduleData([]);
      setStatsData({});
      setLogs([]);
      setStep(1);
      localStorage.removeItem('coithi_v2_data');
      showNotif('Hệ thống đã reset sạch sẽ.', 'success');
    }
  };

  // Giải thuật tự động xếp lịch
  const handleRunAlgorithm = () => {
    if (teachers.length === 0) {
      showNotif('Danh sách giáo viên đang trống! Vui lòng thêm giáo viên ở Bước 2.', 'error');
      setStep(2);
      return;
    }
    if (sessions.length === 0) {
      showNotif('Lịch các ca thi chưa được khởi tạo! Vui lòng khai báo ở Bước 3.', 'error');
      setStep(3);
      return;
    }

    const { schedule, stats, logs: algoLogs } = runSchedulingAlgorithm(sessions, teachers, rules);
    setScheduleData(schedule);
    setStatsData(stats);
    setLogs(algoLogs);

    setStep(5); // Nhảy bước lên XEM KẾT QUẢ
    showNotif('Quy trình bố trí cán bộ đã hoàn tất tối ưu!');
  };

  // Tải file mẫu danh sách giáo viên
  const downloadTemplate = () => {
    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      showNotif('Thư viện tạo file đang tải, vui lòng thử lại sau 2 giây!', 'error');
      return;
    }

    const headers = [
      "TT", 
      "HỌ TÊN GV", 
      "GV TỔ", 
      "GIỚI TÍNH", 
      "SỐ BUỔI TỐI ĐA", 
      "BUỔI KHÔNG THỂ COI THI (VD: 12/06_Sáng)", 
      "GHI CHÚ"
    ];

    const sampleRows = [
      [1, "Nguyễn Văn An", "Toán", "Nam", 4, "12/06_Sáng", "Tổ phó"],
      [2, "Trần Thị Bạch", "Toán", "Nữ", 3, "12/06_Chiều", ""],
      [3, "Lê Hoàng Cường", "Vật lý", "Nam", 4, "", "Có con nhỏ"],
      [4, "Phạm Hồng Dung", "Vật lý", "Nữ", 3, "13/06_Sáng", ""],
      [5, "Hoàng Văn Giang", "Hóa học", "Nam", 4, "", ""]
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachGiaoVien");
    
    XLSX.writeFile(wb, "Danh_Sach_Giao_Vien_Mau.xlsx");
    showNotif('Đã tải xuống biểu mẫu chuẩn!');
  };

  // Phân tích tệp tin tải lên
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const XLSX = (window as any).XLSX;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!XLSX) {
      showNotif('Bộ lọc import Excel chưa tải xong, xin vui lòng đợi giây lát!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        
        // Chuyển sang mảng 2 chiều để định vị cột linh hoạt
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rows.length < 2) {
          showNotif('Tệp định dạng rỗng hoặc chỉ có hàng tiêu đề.', 'error');
          return;
        }

        const headers = rows[0].map(h => h ? h.toString().trim().toUpperCase() : '');
        
        // Khớp chỉ mục cột
        const colNameIdx = headers.indexOf('HỌ TÊN GV');
        const colGroupIdx = headers.indexOf('GV TỔ');
        const colGenderIdx = headers.indexOf('GIỚI TÍNH');
        const colMaxIdx = headers.indexOf('SỐ BUỔI TỐI ĐA');
        const colBusyIdx = headers.indexOf('BUỔI KHÔNG THỂ COI THI (VD: 12/06_SÁNG)');
        // Hỗ trợ thêm phương án gõ ngắn gọn cho cột bận
        const colBusyAltIdx = headers.findIndex(h => h.includes('BUỔI') && h.includes('BẬN'));
        const finalBusyIdx = colBusyIdx !== -1 ? colBusyIdx : colBusyAltIdx;

        const colNoteIdx = headers.indexOf('GHI CHÚ');
        const colTTIdx = headers.indexOf('TT');

        if (colNameIdx === -1 || colGroupIdx === -1) {
          showNotif('Tệp sai cấu trúc! Cột "HỌ TÊN GV" và "GV TỔ" là bắt buộc.', 'error');
          return;
        }

        const parsedTeachers: Teacher[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[colNameIdx]) continue; // Bỏ hàng trống

          const rawBusy = finalBusyIdx !== -1 ? row[finalBusyIdx] : '';
          const rawMax = colMaxIdx !== -1 ? row[colMaxIdx] : '4';

          parsedTeachers.push({
            id: `gv_excel_${Date.now()}_${i}`,
            tt: colTTIdx !== -1 && row[colTTIdx] ? row[colTTIdx] : i,
            name: row[colNameIdx].toString().trim(),
            group: row[colGroupIdx].toString().trim(),
            gender: colGenderIdx !== -1 && row[colGenderIdx] ? row[colGenderIdx].toString().trim() : 'Nữ',
            maxShifts: rawMax ? rawMax.toString().trim() : '4',
            busyShifts: rawBusy ? rawBusy.toString().trim() : '',
            note: colNoteIdx !== -1 && row[colNoteIdx] ? row[colNoteIdx].toString().trim() : ''
          });
        }

        setTeachers(parsedTeachers);
        showNotif(`Import thành công ${parsedTeachers.length} hồ sơ giáo viên!`);
      } catch (err) {
        showNotif('Lỗi cấu trúc xử lý tệp. Vui lòng sử dụng file mẫu chuẩn.', 'error');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Làm sạch input cho lượt nạp sau
  };

  // Can thiệp thủ công: Đổi giáo viên cho 1 phòng cụ thể
  const handleReassignTeacher = (
    sessionId: string, 
    room: string, 
    role: 'gt1' | 'gt2', 
    newTeacherId: string | null
  ) => {
    // Thay thế giáo viên trong scheduleData
    const updatedSchedule = scheduleData.map(row => {
      if (row.sessionId === sessionId && row.room === room) {
        const newTeacher = newTeacherId ? teachers.find(t => t.id === newTeacherId) || null : null;
        return {
          ...row,
          [role]: newTeacher
        };
      }
      return row;
    });

    // Tính toán lại statsData dựa trên schedule mới này!
    const newStats: StatsMap = {};
    teachers.forEach(t => {
      newStats[t.id] = {
        count: 0,
        sessions: [],
        roles: { GT1: 0, GT2: 0, DP: 0 }
      };
    });

    updatedSchedule.forEach(row => {
      const sessionDateShift = `${row.date}_${row.shift}`;
      if (row.gt1) {
        newStats[row.gt1.id].count += 1;
        newStats[row.gt1.id].sessions.push(sessionDateShift);
        if (row.isBackup) {
          newStats[row.gt1.id].roles.DP += 1;
        } else {
          newStats[row.gt1.id].roles.GT1 += 1;
        }
      }
      if (row.gt2) {
        newStats[row.gt2.id].count += 1;
        newStats[row.gt2.id].sessions.push(sessionDateShift);
        newStats[row.gt2.id].roles.GT2 += 1;
      }
    });

    // Tìm kiếm xem có trùng tổ chuyên môn không để cập nhật log cảnh báo
    const newLogs: string[] = [];
    sessions.forEach(session => {
      const sessionRows = updatedSchedule.filter(row => row.sessionId === session.id);
      sessionRows.forEach(row => {
        if (!row.isBackup && row.gt1 && row.gt2 && row.gt1.group === row.gt2.group && rules.preventSameGroup) {
          newLogs.push(`⚠️ Phòng ${row.room} (ca ${session.shift} ${session.date}): Xếp trùng tổ bộ môn "${row.gt1.group}" cho cả 2 giám thị (${row.gt1.name} & ${row.gt2.name}).`);
        }
      });
    });

    setScheduleData(updatedSchedule);
    setStatsData(newStats);
    setLogs(newLogs);
    showNotif('Đã điều chuyển nhân sự thủ công và tính toán lại tham số gánh tải.');
  };

  // Trích xuất biểu Excel hoàn chỉnh
  const exportExcel = () => {
    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      showNotif('Trình trích xuất tệp đang tải, vui lòng bấm cấu hình mẫu lại sau!', 'error');
      return;
    }
    if (scheduleData.length === 0) {
      showNotif('Không tìm thấy dữ liệu xếp lịch khả dụng để xuất tệp!', 'error');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng Thống Kì Thi
    const infoRows = [
      ["THÔNG TIN PHÂN CÔNG LỊCH COI THI"],
      [],
      ["Tên Đơn vị:", examInfo.schoolName || 'Chưa khai báo'],
      ["Tên Kỳ thi:", examInfo.examName || 'Chưa khai báo'],
      ["Năm học:", examInfo.year || '2025-2026'],
      ["Người phê duyệt/lập:", `${examInfo.creator || 'Chưa rõ'} — ${examInfo.role || 'Cán bộ quản lý'}`],
      ["Tổng số cán bộ tham gia:", `${teachers.length} giáo viên`],
      ["Lược nhu cầu phân công:", `${scheduleData.length} vị trí phòng`],
      ["Thời gian xuất bản:", new Date().toLocaleDateString('vi-VN')],
      [],
      ["Ghi chú chỉ dẫn:", examInfo.note || 'Không có ghi chú thêm.']
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(infoRows);
    XLSX.utils.book_append_sheet(wb, wsInfo, "TongQuan");

    // Sheet 2: Biểu lịch chi tiết theo phòng
    const listHeaders = [
      "STT", 
      "Ngày kiểm tra", 
      "Ca thi", 
      "Môn kiểm tra", 
      "Phòng thi", 
      "Giám thị thứ nhất", 
      "Tổ GT1", 
      "Giám thị thứ hai", 
      "Tổ GT2", 
      "Nhiệm vụ bàn giao"
    ];
    const scheduleRows = scheduleData.map((row, idx) => [
      idx + 1,
      row.date,
      row.shift,
      `${row.subject} ${row.grade ? `(K${row.grade})` : ''}`,
      row.room,
      row.gt1?.name || (row.isBackup ? '[Hỗ trợ dự trữ]' : 'Chờ bổ sung'),
      row.gt1?.group || '',
      row.gt2?.name || (row.isBackup ? '-' : 'Chờ bổ sung'),
      row.gt2?.group || '',
      row.isBackup ? 'Giám thị Dự phòng' : 'Giám thị phòng'
    ]);
    const wsSchedule = XLSX.utils.aoa_to_sheet([listHeaders, ...scheduleRows]);
    XLSX.utils.book_append_sheet(wb, wsSchedule, "BieuLichTheoPhongPhanPhoi");

    // Sheet 3: Thống kê ngày công coi thi
    const statsHeaders = [
      "TT", 
      "Họ tên Giáo viên", 
      "Bộ môn/Tổ", 
      "Tổng số buổi coi", 
      "Số lần làm GT1", 
      "Số lần làm GT2", 
      "Số lần Dự phòng"
    ];
    const teacherStatsRows = teachers.map((t, idx) => {
      const st = statsData[t.id] || { count: 0, roles: { GT1: 0, GT2: 0, DP: 0 } };
      return [
        idx + 1,
        t.name,
        t.group,
        st.count,
        st.roles.GT1,
        st.roles.GT2,
        st.roles.DP
      ];
    }).sort((a, b) => (b[3] as number) - (a[3] as number)); // Sắp xếp giảm dần số ca
    const wsStats = XLSX.utils.aoa_to_sheet([statsHeaders, ...teacherStatsRows]);
    XLSX.utils.book_append_sheet(wb, wsStats, "ThongKeGanhTaiCaNhan");

    const cleanName = (examInfo.examName || 'Kế_hoạch_Coi_thi').replace(/\s+/g, '_');
    XLSX.writeFile(wb, `Lich_Coi_Thi_${cleanName}.xlsx`);
    showNotif('Xuất tệp tin Excel chất lượng cao thành công!');
  };

  // Cấu trúc bước chuyển trang
  const steps = [
    { id: 1, title: 'Thông tin' },
    { id: 2, title: 'Giáo viên' },
    { id: 3, title: 'Lịch thi' },
    { id: 4, title: 'Quy tắc' },
    { id: 5, title: 'Kết quả' },
    { id: 6, title: 'Thống kê' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans leading-normal selection:bg-indigo-100 antialiased flex flex-col justify-between">
      
      {/* Header Panel component widget */}
      <Header 
        onLoadSample={handleLoadSampleData} 
        onClearAll={handleClearAllData}
        hasData={teachers.length > 0 || sessions.length > 0} 
      />

      {/* Global Notifications popup */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 px-4 py-3.5 rounded-xl shadow-lg z-50 flex items-center gap-2.5 text-xs font-semibold text-white transition-transform scale-100 animate-slide-up ${
            notification.type === 'error' ? 'bg-rose-600' : 'bg-slate-950'
          }`}
        >
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Primary Workflow Layout Container */}
      <main className="max-w-7xl mx-auto px-6 py-6 flex-1 w-full flex flex-col">
        
        {/* Step Navigation Bar (Stepper Indicator) */}
        <div className="grid grid-cols-6 mb-8 border border-slate-200/60 bg-white p-2 rounded-2xl shadow-sm overflow-hidden text-center">
          {steps.map((s, idx) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            let themeClass = 'text-slate-400 font-medium';
            if (isActive) {
              themeClass = 'bg-slate-950 text-white font-semibold rounded-xl shadow-sm shadow-slate-950/10';
            } else if (isCompleted) {
              themeClass = 'text-slate-900 hover:text-indigo-600 font-semibold cursor-pointer';
            }

            return (
              <button
                key={s.id}
                onClick={() => {
                  // Chỉ cho phép nhảy sang bước đã gán sẵn cấu dữ liệu phục vụ
                  if (s.id <= 4 || scheduleData.length > 0) {
                    setStep(s.id);
                  } else {
                    showNotif('Bạn cần thực hiện chạy Xếp lịch tự động tại Bước 4 trước!', 'error');
                  }
                }}
                className={`py-2 text-[10px] uppercase tracking-wider font-sans transition-all flex items-center justify-center gap-1.5 outline-none border-none ${themeClass}`}
              >
                <span className="hidden sm:inline-block w-4 h-4 rounded-full bg-slate-200/50 text-[9px] items-center justify-center inline-flex font-mono">
                  {s.id}
                </span>
                <span className="text-[10px]">{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic component routing panels block */}
        <div className="flex-1">
          {step === 1 && (
            <Step1ExamInfo 
              examInfo={examInfo} 
              setExamInfo={setExamInfo} 
              onNext={() => {
                if (!examInfo.examName.trim()) {
                  showNotif('Bạn chưa điền Tên kỳ thi / kiểm tra', 'error');
                  return;
                }
                setStep(2);
              }}
              onLoadSample={handleLoadSampleData}
            />
          )}

          {step === 2 && (
            <Step2Teachers 
              teachers={teachers} 
              setTeachers={setTeachers} 
              onNext={() => {
                if (teachers.length === 0) {
                  showNotif('Hãy nạp danh sách giáo viên trước khi đi tiếp!', 'error');
                  return;
                }
                setStep(3);
              }}
              onBack={() => setStep(1)}
              downloadTemplate={downloadTemplate}
              handleFileUpload={handleFileUpload}
              showNotif={showNotif}
            />
          )}

          {step === 3 && (
            <Step3Sessions 
              sessions={sessions} 
              setSessions={setSessions} 
              onNext={() => {
                if (sessions.length === 0) {
                  showNotif('Hãy khai báo ít nhất một buổi ca coi thi!', 'error');
                  return;
                }
                setStep(4);
              }}
              onBack={() => setStep(2)}
              onLoadSampleSessions={handleLoadSampleSessionsOnly}
            />
          )}

          {step === 4 && (
            <Step4Rules 
              rules={rules} 
              setRules={setRules} 
              teachers={teachers} 
              sessions={sessions} 
              onBack={() => setStep(3)}
              onRunAlgorithm={handleRunAlgorithm}
              hasSchedule={scheduleData.length > 0}
              onNext={() => setStep(5)}
            />
          )}

          {step === 5 && (
            <Step5Result 
              scheduleData={scheduleData}
              teachers={teachers}
              sessions={sessions}
              logs={logs}
              onBack={() => setStep(4)}
              onNext={() => setStep(6)}
              exportExcel={exportExcel}
              onReassignTeacher={handleReassignTeacher}
              showNotif={showNotif}
            />
          )}

          {step === 6 && (
            <Step6Stats 
              teachers={teachers}
              statsData={statsData}
              sessions={sessions}
              onBack={() => setStep(5)}
              exportExcel={exportExcel}
            />
          )}
        </div>
      </main>

      {/* Humble craft Footer indicator */}
      <footer className="py-6 text-center text-[10px] text-slate-400/80 tracking-wide border-t border-slate-200/50 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          Phần mềm Phân lịch Coi thi Giảng viên Học đường &copy; {new Date().getFullYear()} — Thiết kế thông minh, tối ưu công bằng
        </div>
      </footer>
    </div>
  );
}
