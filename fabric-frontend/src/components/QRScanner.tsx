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
  disabled?: boolean;
}

function canUseInlineCamera(): boolean {
  if (typeof window === 'undefined') return false;
  const hasDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  return !!(hasDevices && window.isSecureContext);
}

function InlineCameraScanner({ onScan }: { onScan: (text: string) => void }) {
  const liveMountId = `qr-live-${useId().replace(/:/g, '')}`;
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [camError, setCamError] = useState<string | null>(null);

  useEffect(() => {
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
        setCamError(`${msg}. Allow camera permission, or use your phone’s QR scanner app instead.`);
      });

    return () => {
      stopped = true;
      if (scanner.isScanning) {
        void scanner.stop().catch(() => {});
      }
    };
  }, [liveMountId]);

  return (
    <div className="space-y-2">
      <div id={liveMountId} className="w-full min-h-[200px] rounded-lg overflow-hidden shadow-inner bg-neutral-900/5 dark:bg-neutral-950/40" />
      {camError && (
        <p className="text-sm text-red-700 dark:text-red-200 bg-red-50 dark:bg-red-950/35 border border-red-200 dark:border-red-900/60 rounded-lg px-3 py-2">
          {camError}
        </p>
      )}
    </div>
  );
}

/** QR assist: external app (recommended), image upload, optional in-browser camera on HTTPS/localhost. */
const QRScanner: React.FC<QRScannerProps> = ({ onScan, disabled = false }) => {
  const fileRegionId = `qr-file-${useId().replace(/:/g, '')}`;
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const cameraAllowed = useMemo(() => canUseInlineCamera(), []);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showInlineCamera, setShowInlineCamera] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const decodeImageFile = useCallback(
    async (file: File) => {
      setFileError(null);
      setFileBusy(true);
      const scanner = new Html5Qrcode(fileRegionId);
      try {
        const text = await scanner.scanFile(file, false);
        onScanRef.current(text);
      } catch {
        setFileError(
          'No QR code found in this image. Use a clear photo of the full QR, paste the verification link above, or scan with your phone’s camera app.',
        );
      } finally {
        try {
          await scanner.clear();
        } catch {
          /* ignore */
        }
        setFileBusy(false);
      }
    },
    [fileRegionId],
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || disabled || fileBusy) return;
      void decodeImageFile(file);
    },
    [decodeImageFile, disabled, fileBusy],
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      <div className="rounded-xl border border-primary-200/70 bg-primary-50/50 p-4 dark:border-primary-800/50 dark:bg-primary-950/25">
        <p className="text-sm font-semibold text-page-heading">Recommended: your phone’s QR scanner</p>
        <ol className="mt-2 list-decimal list-inside space-y-1.5 text-sm text-page-body leading-relaxed">
          <li>Open your <strong>Camera</strong>, <strong>Google Lens</strong>, or any QR scanner app.</li>
          <li>Point it at the product QR code on the label.</li>
          <li>
            If a browser link opens, verification continues automatically. Otherwise copy the link and
            paste it in <strong>Paste verification link</strong> above, then tap <strong>Use Link</strong>.
          </li>
        </ol>
      </div>

      <div
        id={fileRegionId}
        className="w-[min(100%,320px)] h-[240px] overflow-hidden rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 mx-auto"
        aria-hidden={!fileBusy}
      >
        {fileBusy ? (
          <p className="flex h-full items-center justify-center text-sm text-page-muted px-4 text-center">
            Reading QR from image…
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-page-label">Or upload a photo of the QR</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || fileBusy}
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-page-body hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            Choose from gallery
          </button>
          <button
            type="button"
            disabled={disabled || fileBusy}
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-page-body hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            Take photo
          </button>
        </div>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onFileInput}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={onFileInput}
        />
        {fileError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {fileError}
          </p>
        )}
      </div>

      {cameraAllowed ? (
        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-600">
          <button
            type="button"
            disabled={disabled || fileBusy}
            onClick={() => setShowInlineCamera((s) => !s)}
            className="text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            {showInlineCamera ? '▲ Hide in-browser camera' : '▼ Try in-browser camera (optional)'}
          </button>
          {showInlineCamera && (
            <div className="mt-3">
              <InlineCameraScanner onScan={(t) => onScanRef.current(t)} />
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-page-muted leading-relaxed border-t border-neutral-200 pt-3 dark:border-neutral-600">
          In-browser camera needs HTTPS or <code className="text-[11px]">localhost</code>. On{' '}
          <code className="text-[11px]">http://LAN-IP:5173</code>, use your phone’s built-in scanner or
          upload a photo instead.
        </p>
      )}
    </div>
  );
};

export default QRScanner;
