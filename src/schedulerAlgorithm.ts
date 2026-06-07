/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Teacher, Session, Rules, RoomAssignment, StatsMap } from './types';

export function runSchedulingAlgorithm(
  sessions: Session[],
  teachers: Teacher[],
  rules: Rules
): { schedule: RoomAssignment[]; stats: StatsMap; logs: string[] } {
  const schedule: RoomAssignment[] = [];
  const logs: string[] = [];
  const stats: StatsMap = {};

  // Khởi tạo stats cho từng giáo viên
  teachers.forEach(t => {
    stats[t.id] = {
      count: 0,
      sessions: [],
      roles: { GT1: 0, GT2: 0, DP: 0 }
    };
  });

  // Sắp xếp các buổi thi theo thời gian thực tế để phân chia tuần tự
  // Parse ngày đơn giản để xếp buổi thi theo thứ tự thời gian nếu được
  const parseSessionDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
    }
    return Date.parse(dateStr) || 0;
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    const timeA = parseSessionDate(a.date);
    const timeB = parseSessionDate(b.date);
    if (timeA !== timeB) return timeA - timeB;
    
    // Xếp ca: Sáng -> Chiều -> Tối
    const shiftOrder = { "Sáng": 1, "Chiều": 2, "Tối": 3 };
    return (shiftOrder[a.shift] || 0) - (shiftOrder[b.shift] || 0);
  });

  // Duyệt qua từng buổi thi
  sortedSessions.forEach(session => {
    const sessionDateShift = `${session.date}_${session.shift}`;
    const cleanSessionDateShift = sessionDateShift.toLowerCase().trim();
    
    // 1. Phân loại giáo viên sẵn sàng cho ca thi hiện tại
    // Chạy qua từng vị trí cần thiết trong buổi ban đầu
    const assignedThisSession: string[] = []; // Chứa IDs giáo viên đã xếp trong buổi hiện tại (Chống trùng lịch)

    // Hàm kiểm tra bận của giáo viên
    const isTeacherBusyInSession = (t: Teacher): boolean => {
      if (!t.busyShifts) return false;
      
      const busyList = t.busyShifts.split(',').map(s => s.toLowerCase().trim());
      // Kiểm tra xem buổi thi hiện tại (như "12/06_sáng" hoặc "12/06/2026_sáng") có trùng khớp một phần nào trong danh sách bận không
      return busyList.some(busy => {
        if (!busy) return false;
        // Kiểm tra khớp trực tiếp
        if (busy === cleanSessionDateShift) return true;
        // Kiểm tra khớp bộ phận (VD: "12/06" bận cả ngày, hoặc "sáng" vướng bận gì đó)
        if (cleanSessionDateShift.includes(busy) || busy.includes(cleanSessionDateShift)) return true;
        
        // Thử bóc tách ngày bận
        const datePart = session.date.toLowerCase().trim();
        const shiftPart = session.shift.toLowerCase().trim();
        if (busy.includes(datePart) && busy.includes(shiftPart)) return true;

        return false;
      });
    };

    // Hàm chọn giáo viên tối ưu cho một vị trí nhất định
    // targetGroup: dùng khi xếp GT2 để tránh trùng tổ với GT1
    const selectBestTeacher = (role: 'GT1' | 'GT2' | 'DP', targetGroupToAvoid?: string): Teacher | null => {
      // Tìm danh sách giáo viên có thể xếp
      const candidates = teachers.filter(t => {
        // AI. Chống trùng lịch trong CÙNG môt ca thi
        if (assignedThisSession.includes(t.id)) return false;

        // BII. Tôn trọng "Buổi bận" của giáo viên
        if (rules.respectBusyShifts && isTeacherBusyInSession(t)) return false;

        // BIII. Tôn trọng "Số buổi tối đa"
        if (rules.respectMaxShifts && t.maxShifts) {
          const max = parseInt(t.maxShifts.toString()) || 999;
          if (stats[t.id].count >= max) return false;
        }

        return true;
      });

      if (candidates.length === 0) return null;

      // Sắp xếp ứng viên để chọn người tối ưu nhất
      candidates.sort((a, b) => {
        // Quy tắc A: Tránh cùng tổ bộ môn (Nếu đang xếp GT2 và cần tránh targetGroupToAvoid)
        if (rules.preventSameGroup && targetGroupToAvoid) {
          const aSame = a.group === targetGroupToAvoid;
          const bSame = b.group === targetGroupToAvoid;
          if (aSame !== bSame) {
            return aSame ? 1 : -1; // Đưa người KHÁC tổ bộ môn lên trước
          }
        }

        // Quy tắc B: Ưu tiên Giáo viên có số lần coi thi hiện tại ít hơn (Công bằng)
        if (rules.fairDistribution) {
          const countA = stats[a.id].count;
          const countB = stats[b.id].count;
          if (countA !== countB) return countA - countB;
        }

        // Quy tắc C: Ổn định lịch biểu (Giúp kết quả đồng bộ khi bấm lại), xếp theo TT nguyên gốc
        const ttA = typeof a.tt === 'number' ? a.tt : parseInt(a.tt) || 999;
        const ttB = typeof b.tt === 'number' ? b.tt : parseInt(b.tt) || 999;
        return ttA - ttB;
      });

      // Lấy ứng viên hàng đầu
      const chosen = candidates[0];
      
      // Đánh dấu đã xếp trong ca này
      assignedThisSession.push(chosen.id);
      stats[chosen.id].count += 1;
      stats[chosen.id].sessions.push(sessionDateShift);
      stats[chosen.id].roles[role] += 1;

      return chosen;
    };

    // 2. Lần lượt phân vào từng phòng thi của buổi này
    for (let r = 1; r <= session.rooms; r++) {
      const roomName = `Phòng ${r}`;
      let gt1: Teacher | null = null;
      let gt2: Teacher | null = null;

      // Xếp Giám thị 1
      if (session.teachersPerRoom >= 1) {
        gt1 = selectBestTeacher('GT1');
        if (!gt1) {
          logs.push(`Không thể xếp Giám thị 1 cho Phòng ${r} - Ca ${session.shift} ngày ${session.date} do thiếu giáo viên khả dụng.`);
        }
      }

      // Xếp Giám thị 2
      if (session.teachersPerRoom >= 2) {
        // GT2 cần tránh có cùng Tổ với GT1 nếu có bật quy tắc
        gt2 = selectBestTeacher('GT2', gt1?.group);
        if (!gt2) {
          logs.push(`Không thể xếp Giám thị 2 cho Phòng ${r} - Ca ${session.shift} ngày ${session.date} do thiếu giáo viên khả dụng.`);
        } else if (gt1 && gt2 && gt1.group === gt2.group && rules.preventSameGroup) {
          // Ghi lại cảnh báo nếu vẫn cố phải xếp cùng tổ do thiếu người
          logs.push(`⚠️ Phòng ${r} (ca ${session.shift} ${session.date}): Xếp trùng tổ bộ môn "${gt1.group}" cho cả 2 giám thị (${gt1.name} & ${gt2.name}) vì không có giáo viên tổ khác rảnh.`);
        }
      }

      schedule.push({
        sessionId: session.id,
        date: session.date,
        shift: session.shift,
        subject: session.subject,
        grade: session.grade,
        room: roomName,
        gt1,
        gt2,
        isBackup: false
      });
    }

    // 3. Xếp Giám thị Dự phòng
    const backupsNeeded = parseInt(session.backupTeachers.toString()) || 0;
    for (let b = 1; b <= backupsNeeded; b++) {
      const dp = selectBestTeacher('DP');
      if (dp) {
        schedule.push({
          sessionId: session.id,
          date: session.date,
          shift: session.shift,
          subject: session.subject,
          grade: session.grade,
          room: `Dự phòng ${b}`,
          gt1: dp, // Giám thị dự phòng được đặt vào cột gt1
          gt2: null,
          isBackup: true
        });
      } else {
        logs.push(`Không đủ giáo viên dự phòng cho vị trí Dự phòng ${b} - Ca ${session.shift} ngày ${session.date}.`);
      }
    }
  });

  return { schedule, stats, logs };
}
