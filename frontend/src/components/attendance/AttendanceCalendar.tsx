import React from 'react';

interface AttendanceDay {
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'excused';
}

interface AttendanceCalendarProps {
  year: number;
  month: number;
  days: AttendanceDay[];
}

const statusColor = {
  present: 'bg-green-400',
  absent: 'bg-red-300',
  excused: 'bg-yellow-300',
};

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ year, month, days }) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const calendar: (AttendanceDay | null)[] = Array(startDay).fill(null);
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const found = days.find(day => day.date === dateStr);
    calendar.push(found || { date: dateStr, status: 'absent' });
  }
  while (calendar.length % 7 !== 0) calendar.push(null);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs text-gray-500">
        {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendar.map((day, i) => day ? (
          <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-full ${statusColor[day.status]}`}>{parseInt(day.date.split('-')[2])}</div>
        ) : <div key={i} />)}
      </div>
    </div>
  );
};

export default AttendanceCalendar;
