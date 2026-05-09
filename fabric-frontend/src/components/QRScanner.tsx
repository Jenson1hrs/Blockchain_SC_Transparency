import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
}

/** Browser camera requires a “secure context” (HTTPS or localhost); plain http://LAN is not secure → no camera API. */
function canUseInlineCamera(): boolean {
  if (typeof window === 'undefined') return false;
  const hasDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  return !!(hasDevices && window.isSecureContext);
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const liveMountId = `qr-live-${useId().replace(/:/g, '')}`;
  const fileMountId = `qr-file-${useId().replace(/:/g, '')}`;
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const cameraAllowed = useMemo(() => canUseInlineCamera(), []);
  const [camError, setCamError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!cameraAllowed) return;

    let stopped = false;
    const scanner = new Html5Qrcode(liveMountId);

    const qrboxFn = (w: number, h: number) => {
      const size = Math.max(140, Math.min(280, Math.floor(Math.min(w, h) * 0.86)));
      return { width: size, height: size };
    };

    void scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: qrboxFn, aspectRatio: 1 },
        (decodedText) => {
          if (stopped) return;
          stopped = true;
          void scanner
            .stop()
            .catch(() => {})
            .finally(() => onScanRef.current(decodedText));
        },
        () => {},
      )
      .catch((e: unknown) => {
        if (stopped) return;
        const msg = e instanceof Error ? e.message : String(e);
        setCamError(
          `${msg}. If this is desktop, allow camera permission. On phone over http://YOUR-LAN:5173, use “Pick QR image” or paste the scanned URL.`,
        );
      });

    return () => {
      stopped = true;
      if (scanner.isScanning) {
        void scanner.stop().catch(() => {});
      }
    };
  }, [cameraAllowed, liveMountId]);

  const onPickFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileError(null);
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        const reader = new Html5Qrcode(fileMountId);
        const text = await reader.scanFile(file, false);
        onScanRef.current(text);
      } catch {
        setFileError('No QR detected in this image — try sharper lighting or paste the scanned link.');
      }
    },
    [fileMountId],
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {!cameraAllowed && (
        <div className="text-sm rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          <p className="font-medium">Camera unavailable in this browser context</p>
          <p className="mt-1 text-xs leading-relaxed">
            At <strong>http://YOUR-LAN-IP:5173</strong> browsers treat the page as insecure, so{' '}
            <code className="bg-amber-100 px-1">getUserMedia</code> is blocked on most phones (
            same as Chrome on desktop for non-localhost HTTP). External scanner apps still work fine
            if the QR embeds your laptop&apos;s LAN URL (see <strong>FRONTEND_URL</strong> on the API).
            Use <strong>Pick QR image</strong> below or <strong>Paste scanned URL</strong> on this page,
            or use HTTPS (e.g. mkcert + Vite HTTPS) for inline camera everywhere.
          </p>
        </div>
      )}

      {cameraAllowed && (
        <>
          <div id={liveMountId} className="w-full rounded-lg overflow-hidden shadow-lg min-h-[200px]" />
          {camError && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 whitespace-pre-wrap">
              {camError}
            </p>
          )}
        </>
      )}

      <div
        id={fileMountId}
        className="fixed -left-[9999px] top-0 w-48 h-48 opacity-0 pointer-events-none"
        aria-hidden
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Pick QR from photo (gallery or shot)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(ev) => void onPickFile(ev)}
          className="text-sm w-full border border-gray-300 rounded-lg p-2 bg-white"
        />
        {fileError && (
          <p className="text-sm text-red-600">{fileError}</p>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
