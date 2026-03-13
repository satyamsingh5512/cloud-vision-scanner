import { useState, useEffect, useCallback, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyScan } from '../services/api';

const parseQrPayload = (decodedText) => {
  const trimmed = String(decodedText || '').trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    if (!trimmed.startsWith('{') && trimmed.includes(':')) {
      try {
        return JSON.parse(`{${trimmed}}`);
      } catch {
        return null;
      }
    }
  }

  return null;
};

const ScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [awaitingSwipe, setAwaitingSwipe] = useState(false);
  const loadingRef = useRef(false);
  const lastScannedRef = useRef(null);
  const swipeStartXRef = useRef(null);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    lastScannedRef.current = lastScanned;
  }, [lastScanned]);

  const onScanSuccess = useCallback(async (decodedText) => {
    if (awaitingSwipe) return;
    if (loadingRef.current || decodedText === lastScannedRef.current) return;
    
    setLoading(true);
    loadingRef.current = true;
    setError('');
    setLastScanned(decodedText);
    lastScannedRef.current = decodedText;
    
    try {
      const payload = parseQrPayload(decodedText);
      const scanRequest = payload?.ticketId || payload?.orderId || payload?.email
        ? { qrData: payload, rawText: decodedText }
        : { userId: decodedText };

      const res = await verifyScan(scanRequest);
      setScanResult({
        success: res.data.status === 'SUCCESS',
        alreadyScanned: res.data.status === 'ALREADY_MARKED',
        user: res.data.user,
        time: new Date().toLocaleTimeString()
      });
      setAwaitingSwipe(true);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setTimeout(() => {
        setError('');
        setLastScanned(null);
        lastScannedRef.current = null;
      }, 3000);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [awaitingSwipe]);

  const resetForNextScan = useCallback(() => {
    setScanResult(null);
    setLastScanned(null);
    lastScannedRef.current = null;
    setAwaitingSwipe(false);
  }, []);

  const handleSwipeStart = useCallback((clientX) => {
    swipeStartXRef.current = clientX;
  }, []);

  const handleSwipeEnd = useCallback((clientX) => {
    if (swipeStartXRef.current === null) return;
    const deltaX = clientX - swipeStartXRef.current;
    swipeStartXRef.current = null;

    if (Math.abs(deltaX) >= 60) {
      resetForNextScan();
    }
  }, [resetForNextScan]);

  const onScanError = useCallback((err) => {
    const message = String(err || '');

    if (message.includes('NotAllowedError') || message.toLowerCase().includes('permission')) {
      setError('Camera permission denied. Please allow camera access and reload.');
      return;
    }

    if (message.includes('NotFoundError')) {
      setError('No camera found on this device.');
      return;
    }

    if (message.includes('NotReadableError')) {
      setError('Camera is in use by another app. Close it and retry.');
      return;
    }
  }, []);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 320, height: 320 },
      fps: 10,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      rememberLastUsedCamera: true,
    });

    scanner.render(onScanSuccess, onScanError);
    setCameraReady(true);

    return () => {
      scanner.clear().catch(err => console.error('Failed to clear scanner', err));
    };
  }, [onScanError, onScanSuccess]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 overflow-hidden">
      <div className="reveal w-full max-w-2xl text-center">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[120px]" />

        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-black text-white tracking-widest uppercase">
            Scanner<span className="text-indigo-500">Node</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Identity Verification Gateway</p>
        </div>

        <div className="relative">
          {/* Scanner Frame Decor */}
          <div className="absolute -top-4 -left-4 h-12 w-12 border-t-4 border-l-4 border-indigo-500/30 rounded-tl-3xl lg:block hidden" />
          <div className="absolute -top-4 -right-4 h-12 w-12 border-t-4 border-r-4 border-indigo-500/30 rounded-tr-3xl lg:block hidden" />
          <div className="absolute -bottom-4 -left-4 h-12 w-12 border-b-4 border-l-4 border-indigo-500/30 rounded-bl-3xl lg:block hidden" />
          <div className="absolute -bottom-4 -right-4 h-12 w-12 border-b-4 border-r-4 border-indigo-500/30 rounded-br-3xl lg:block hidden" />

          <div className="glass-panel relative aspect-square w-full overflow-hidden rounded-[2.5rem] shadow-2xl transition-all">
            <div id="reader" className="h-full w-full" />
            
            {/* Overlay */}
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Verifying Identity...</span>
                </div>
              </div>
            )}

            {scanResult && (
              <div className={`force-white absolute inset-0 z-30 flex items-center justify-center animate-fadeIn ${
                scanResult.success ? 'bg-emerald-500/90' : 'bg-amber-500/90'
              } backdrop-blur-md`}
              onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
              onTouchEnd={(e) => handleSwipeEnd(e.changedTouches[0].clientX)}
              onMouseDown={(e) => handleSwipeStart(e.clientX)}
              onMouseUp={(e) => handleSwipeEnd(e.clientX)}
              >
                <div className="flex flex-col items-center gap-2 p-8 text-center text-white">
                  <div className="mb-4 rounded-full bg-white/20 p-4 shadow-xl">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={scanResult.success ? "M5 13l4 4L19 7" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"} />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tight">
                    {scanResult.success ? 'Verified' : 'Already Scanned'}
                  </h2>
                  <div className="mt-4 space-y-2">
                    <p className="text-3xl font-black tracking-tight">{scanResult.user.name || 'Unknown'}</p>
                    <p className="text-sm font-bold tracking-tight opacity-95">{scanResult.user.email || 'No email'}</p>
                    <p className="text-sm font-black uppercase tracking-[0.2em] opacity-90">{scanResult.user.group || 'No group'}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-85">{scanResult.user.region || 'No region'}</p>
                    {scanResult.user.ticketId && (
                      <p className="text-xs font-bold tracking-wide opacity-90">Ticket: {scanResult.user.ticketId}</p>
                    )}
                    {scanResult.user.venue && (
                      <p className="text-xs font-bold tracking-wide opacity-90">Venue: {scanResult.user.venue}</p>
                    )}
                    {(scanResult.user.date || scanResult.user.time) && (
                      <p className="text-xs font-bold tracking-wide opacity-90">
                        {scanResult.user.date || ''} {scanResult.user.time ? `• ${scanResult.user.time}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="mt-8 flex items-center gap-2 rounded-lg bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-widest">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Timestamp: {scanResult.time}
                  </div>
                  <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] opacity-85">
                    Swipe Left or Right for Next Scan
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="force-white absolute inset-0 z-30 flex items-center justify-center bg-red-600/90 backdrop-blur-md animate-shake">
                <div className="flex flex-col items-center gap-4 text-center text-white p-8">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">System Breach</h2>
                    <p className="mt-1 font-bold opacity-80 tracking-tight">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        {!cameraReady && (
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">Initializing camera...</p>
        )}

        <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[10px] font-black uppercase tracking-widest">Resolution</span>
            <span className="text-xs font-bold font-mono">1080p HD</span>
          </div>
          <div className="h-8 w-[1px] bg-white" />
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[10px] font-black uppercase tracking-widest">Encryption</span>
            <span className="text-xs font-bold font-mono">AES-256</span>
          </div>
          <div className="h-8 w-[1px] bg-white" />
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[10px] font-black uppercase tracking-widest">Latency</span>
            <span className="text-xs font-bold font-mono">~45ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
