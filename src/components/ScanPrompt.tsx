'use client';

export default function ScanPrompt() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scan frame animation */}
      <div className="relative w-48 h-48">
        {/* Corners */}
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
          (pos, i) => (
            <div
              key={i}
              className={`absolute w-8 h-8 ${pos}`}
              style={{
                borderColor: '#FFD93D',
                borderStyle: 'solid',
                borderWidth: 0,
                ...(i === 0 && { borderTopWidth: 3, borderLeftWidth: 3, borderRadius: '4px 0 0 0' }),
                ...(i === 1 && { borderTopWidth: 3, borderRightWidth: 3, borderRadius: '0 4px 0 0' }),
                ...(i === 2 && { borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: '0 0 0 4px' }),
                ...(i === 3 && { borderBottomWidth: 3, borderRightWidth: 3, borderRadius: '0 0 4px 0' }),
              }}
            />
          )
        )}

        {/* Center panda icon with pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className="pulse-ring absolute inset-0 rounded-full"
              style={{ background: 'rgba(255, 217, 61, 0.3)' }}
            />
            <div
              className="pulse-ring absolute inset-0 rounded-full"
              style={{
                background: 'rgba(255, 217, 61, 0.15)',
                animationDelay: '0.5s',
              }}
            />
            <span className="text-5xl relative z-10">🐼</span>
          </div>
        </div>
      </div>

      {/* Text prompt */}
      <div className="glass-card px-6 py-3 text-center">
        <p className="text-white font-bold text-base">
          Point at a Pandarin Card!
        </p>
        <p className="text-white/50 text-sm mt-1">
          Hold steady for best results
        </p>
      </div>

      {/* Bouncing arrow pointing down toward camera view */}
      <div className="bounce-y text-2xl">👇</div>
    </div>
  );
}
