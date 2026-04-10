import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScan: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <Scanner
        onScan={(result) => {
          if (result && result.length > 0) {
            onScan(result[0].rawValue);
          }
        }}
        onError={(error) => console.error(error)}
      />
    </div>
  );
};

export default QRScanner;