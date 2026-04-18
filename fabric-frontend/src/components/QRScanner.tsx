import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scanner.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        onScan(decodedText);
        scanner.stop();
      },
      (errorMessage) => {
        // Silent fail - keep scanning
      }
    ).catch(err => {
      console.error('Failed to start scanner:', err);
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="w-full rounded-lg overflow-hidden shadow-lg" />
    </div>
  );
};

export default QRScanner;