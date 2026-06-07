/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Teacher, Session } from './types';

export const SAMPLE_TEACHERS: Teacher[] = [
  { id: 'gv_1', tt: 1, name: 'Nguyễn Văn An', group: 'Toán', gender: 'Nam', maxShifts: '4', busyShifts: '12/06_Sáng', note: 'Tổ trưởng Toán' },
  { id: 'gv_2', tt: 2, name: 'Trần Thị Bạch', group: 'Toán', gender: 'Nữ', maxShifts: '3', busyShifts: '12/06_Chiều', note: '' },
  { id: 'gv_3', tt: 3, name: 'Lê Hoàng Cường', group: 'Vật lý', gender: 'Nam', maxShifts: '4', busyShifts: '', note: 'Có con nhỏ' },
  { id: 'gv_4', tt: 4, name: 'Phạm Hồng Dung', group: 'Vật lý', gender: 'Nữ', maxShifts: '3', busyShifts: '13/06_Sáng', note: '' },
  { id: 'gv_5', tt: 5, name: 'Hoàng Văn Giang', group: 'Hóa học', gender: 'Nam', maxShifts: '4', busyShifts: '', note: '' },
  { id: 'gv_6', tt: 6, name: 'Đỗ Thừa Hải', group: 'Hóa học', gender: 'Nam', maxShifts: '4', busyShifts: '13/06_Chiều', note: '' },
  { id: 'gv_7', tt: 7, name: 'Bùi Thị Hương', group: 'Sinh học', gender: 'Nữ', maxShifts: '3', busyShifts: '', note: '' },
  { id: 'gv_8', tt: 8, name: 'Phan Văn Hùng', group: 'Ngữ văn', gender: 'Nam', maxShifts: '4', busyShifts: '', note: 'Tổ trưởng Văn' },
  { id: 'gv_9', tt: 9, name: 'Vũ Thị Khánh', group: 'Ngữ văn', gender: 'Nữ', maxShifts: '3', busyShifts: '14/06_Sáng', note: '' },
  { id: 'gv_10', tt: 10, name: 'Ngô Quốc Lâm', group: 'Lịch sử', gender: 'Nam', maxShifts: '4', busyShifts: '', note: '' },
  { id: 'gv_11', tt: 11, name: 'Lý Mỹ Linh', group: 'Địa lý', gender: 'Nữ', maxShifts: '3', busyShifts: '14/06_Sáng', note: '' },
  { id: 'gv_12', tt: 12, name: 'Dương Văn Minh', group: 'Tin học', gender: 'Nam', maxShifts: '4', busyShifts: '', note: '' },
  { id: 'gv_13', tt: 13, name: 'Trương Ngọc Nga', group: 'Tiếng Anh', gender: 'Nữ', maxShifts: '4', busyShifts: '', note: '' },
  { id: 'gv_14', tt: 14, name: 'Võ Minh Phát', group: 'Tiếng Anh', gender: 'Nam', maxShifts: '3', busyShifts: '', note: '' },
  { id: 'gv_15', tt: 15, name: 'Đặng Quốc Quân', group: 'Thể dục', gender: 'Nam', maxShifts: '5', busyShifts: '', note: 'Hỗ trợ kỹ thuật' },
  { id: 'gv_16', tt: 16, name: 'Lương Hoài Sang', group: 'GDCD', gender: 'Nữ', maxShifts: '4', busyShifts: '', note: '' },
  { id: 'gv_17', tt: 17, name: 'Hồ Cao Tiến', group: 'Toán', gender: 'Nam', maxShifts: '4', busyShifts: '', note: '' },
  { id: 'gv_18', tt: 18, name: 'Mai Khánh Uyên', group: 'Ngữ văn', gender: 'Nữ', maxShifts: '4', busyShifts: '12/06_Chiều', note: '' },
  { id: 'gv_19', tt: 19, name: 'Trịnh Đăng Vũ', group: 'Hóa học', gender: 'Nam', maxShifts: '3', busyShifts: '', note: '' },
  { id: 'gv_20', tt: 20, name: 'Tạ Minh Xuân', group: 'Địa lý', gender: 'Nữ', maxShifts: '4', busyShifts: '', note: '' }
];

export const SAMPLE_SESSIONS: Session[] = [
  {
    id: 'ses_1',
    date: '12/06/2026',
    shift: 'Sáng',
    subject: 'Toán học',
    grade: '12',
    rooms: 6,
    teachersPerRoom: 2,
    backupTeachers: 2
  },
  {
    id: 'ses_2',
    date: '12/06/2026',
    shift: 'Chiều',
    subject: 'Ngữ văn',
    grade: '12',
    rooms: 6,
    teachersPerRoom: 2,
    backupTeachers: 2
  },
  {
    id: 'ses_3',
    date: '13/06/2026',
    shift: 'Sáng',
    subject: 'Tiếng Anh',
    grade: '12',
    rooms: 6,
    teachersPerRoom: 2,
    backupTeachers: 1
  },
  {
    id: 'ses_4',
    date: '13/06/2026',
    shift: 'Chiều',
    subject: 'Vật lý - Hóa học',
    grade: '12',
    rooms: 5,
    teachersPerRoom: 2,
    backupTeachers: 2
  },
  {
    id: 'ses_5',
    date: '14/06/2026',
    shift: 'Sáng',
    subject: 'Lịch sử - Địa lý',
    grade: '12',
    rooms: 5,
    teachersPerRoom: 2,
    backupTeachers: 1
  }
];
