'use client';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  const isCameraError = message.toLowerCase().includes('camera') ||
    message.toLowerCase().includes('permission') ||
    message.toLowerCase().includes('notallowed');

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 p-6"
      style={{ background: 'linear-gradient(135deg, #1A1A2E, #16213E)' }}
    >
      <div className="text-6xl mb-4">{isCameraError ? '📷' : '😔'}</div>
      <h2 className="text-white font-black text-2xl mb-2">Oops!</h2>
      <p className="text-white/60 text-center text-sm mb-6 max-w-[260px]">
        {isCameraError
          ? 'Camera access is needed for AR! Please allow camera permissions and try again.'
          : message}
      </p>

      {isCameraError && (
        <div className="glass-card p-4 mb-6 max-w-[280px]">
          <p className="text-white/80 text-xs font-semibold mb-2">How to enable camera:</p>
          <ol className="text-white/60 text-xs space-y-1 list-decimal list-inside">
            <li>Tap the lock icon in your browser</li>
            <li>Set Camera to "Allow"</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      )}

      <button
        onClick={onRetry}
        className="py-3 px-8 rounded-2xl font-bold text-base text-white active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #FF4757, #FF6B35)',
          boxShadow: '0 4px 20px rgba(255, 71, 87, 0.4)',
        }}
      >
        Try Again 🔄
      </button>
    </div>
  );
}
