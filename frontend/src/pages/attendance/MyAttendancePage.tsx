import React, { useEffect, useState } from 'react';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import api from '../api/axios';

interface AttendanceDay {
  date: string;
  status: 'present' | 'absent' | 'excused';
}

interface AttendanceBoardResponse {
  year: number;
  month: number;
  days: AttendanceDay[];
  attendance_rate: number;
}

const MyAttendancePage: React.FC = () => {
  const [data, setData] = useState<AttendanceBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/board/my').then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-10">로딩 중...</div>;
  if (!data) return <div className="text-center py-10">출석 데이터 없음</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">내 출석 현황</h1>
      <div className="mb-4">출석률: <span className="font-bold text-blue-600">{data.attendance_rate}%</span></div>
      <AttendanceCalendar year={data.year} month={data.month} days={data.days} />
    </div>
  );
};

export default MyAttendancePage;
