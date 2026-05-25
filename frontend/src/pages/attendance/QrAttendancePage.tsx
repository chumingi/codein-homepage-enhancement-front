import React, { useState } from 'react';
// QR 코드 생성 라이브러리와 스캐너 라이브러리 필요 (예: qrcode.react, react-qr-reader)
// 실제 프로젝트에서는 npm install 필요: qrcode.react, react-qr-reader
import QRCode from 'qrcode.react';
import { QrReader } from 'react-qr-reader';

const QrAttendancePage: React.FC = () => {
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [qrValue, setQrValue] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [message, setMessage] = useState('');

  // 출석용 QR 생성 (예: 서버에서 토큰 발급 받아야 함)
  const handleGenerate = () => {
    // 실제로는 API에서 출석용 토큰을 받아야 함
    const fakeToken = 'attendance-token-20260525';
    setQrValue(fakeToken);
    setMessage('이 QR을 현장에 보여주세요.');
  };

  // QR 스캔 결과 처리
  const handleScan = (result: any) => {
    if (result?.text) {
      setScanResult(result.text);
      setMessage('출석이 정상적으로 처리되었습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">출석 QR</h1>
      <div className="mb-4 flex gap-4">
        <button className={`px-4 py-2 rounded ${mode === 'generate' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setMode('generate')}>QR 생성</button>
        <button className={`px-4 py-2 rounded ${mode === 'scan' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setMode('scan')}>QR 스캔</button>
      </div>
      {mode === 'generate' && (
        <div className="flex flex-col items-center gap-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleGenerate}>출석용 QR 생성</button>
          {qrValue && <QRCode value={qrValue} size={200} />}
        </div>
      )}
      {mode === 'scan' && (
        <div className="flex flex-col items-center gap-4">
          <QrReader
            onResult={handleScan}
            constraints={{ facingMode: 'environment' }}
            style={{ width: 240 }}
          />
          {scanResult && <div className="mt-2 text-green-600">스캔 결과: {scanResult}</div>}
        </div>
      )}
      {message && <div className="mt-6 text-blue-700 font-semibold">{message}</div>}
    </div>
  );
};

export default QrAttendancePage;
