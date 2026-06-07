/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExamInfo {
  examName: string;
  year: string;
  schoolName: string;
  creator: string;
  role: string;
  note: string;
}

export interface Teacher {
  id: string;
  tt: number | string;
  name: string;
  group: string;
  gender: string;
  maxShifts: string | number;
  busyShifts: string; // VD: "10/03_Sáng, 11/03_Chiều"
  note: string;
}

export interface Session {
  id: string;
  date: string; // VD: "2026-06-10" hoặc "10/06/2026"
  shift: "Sáng" | "Chiều" | "Tối";
  subject: string;
  grade: string;
  rooms: number;
  teachersPerRoom: number;
  backupTeachers: number;
}

export interface Rules {
  preventDoubleBooking: boolean;
  fairDistribution: boolean;
  respectBusyShifts: boolean;
  respectMaxShifts: boolean;
  preventSameGroup: boolean;
}

export interface RoomAssignment {
  sessionId: string;
  date: string;
  shift: string;
  subject: string;
  grade: string;
  room: string;
  gt1: Teacher | null;
  gt2: Teacher | null;
  isBackup?: boolean;
}

export interface TeacherStat {
  count: number;
  sessions: string[]; // Danh sách các `${date}_${shift}` đã coi
  roles: {
    GT1: number;
    GT2: number;
    DP: number;
  };
}

export interface StatsMap {
  [teacherId: string]: TeacherStat;
}

export interface SavedExam {
  id: string;
  createdAt: string;
  examInfo: ExamInfo;
  teachers: Teacher[];
  sessions: Session[];
  rules: Rules;
  scheduleData: RoomAssignment[];
  statsData: StatsMap;
}
