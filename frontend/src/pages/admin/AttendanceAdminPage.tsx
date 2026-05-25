import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

interface AttendanceUser {
  id: number;
  name: string;
  email: string;
  status: 'present' | 'absent' | 'excused';
  checked_at?: string;
}

const AttendanceAdminPage: React.FC = () => {
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);

  useEffect(() => {
    api.get('/attendance/admin/list').then(res => {
      setUsers(res.data.users);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = (id: number, status: AttendanceUser['status']) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    api.post('/attendance/admin/update', { id, status });
  };

  const handleDownloadCsv = () => {
    api.get('/attendance/admin/export', { responseType: 'blob' }).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      setCsvUrl(url);
    });
  };

  if (loading) return <div className="text-center py-10">로딩 중...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">출석 명단 관리</h1>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleDownloadCsv}>CSV 다운로드</button>
      {csvUrl && <a href={csvUrl} download="attendance.csv" className="ml-4 text-blue-700 underline">다운로드 링크</a>}
      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">이름</th>
            <th className="p-2">이메일</th>
            <th className="p-2">상태</th>
            <th className="p-2">체크 시간</th>
            <th className="p-2">수정</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.status}</td>
              <td className="p-2">{user.checked_at ? new Date(user.checked_at).toLocaleString() : '-'}</td>
              <td className="p-2">
                <select value={user.status} onChange={e => handleStatusChange(user.id, e.target.value as AttendanceUser['status'])} className="border rounded px-2 py-1">
                  <option value="present">출석</option>
                  <option value="absent">결석</option>
                  <option value="excused">공결</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceAdminPage;
