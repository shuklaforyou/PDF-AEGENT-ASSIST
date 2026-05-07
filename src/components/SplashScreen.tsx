import React, { useEffect, useState } from 'react';

const DURATION = 1800; // ms before fading out

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'leaving'>('entering');
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    // Start fade-in
    const t1 = setTimeout(() => setPhase('visible'), 30);

    // Animate progress bar
    let raf: number;
    const start = performance.now();
    const animate = (now: number) => {
      const pct = Math.min((now - start) / (DURATION * 0.85), 1);
      // Ease out cubic
      setBarWidth(1 - Math.pow(1 - pct, 3));
      if (pct < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // Begin fade-out
    const t2 = setTimeout(() => setPhase('leaving'), DURATION);

    // Unmount after fade
    const t3 = setTimeout(onDone, DURATION + 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      cancelAnimationFrame(raf);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background, #fff)',
        opacity: phase === 'leaving' ? 0 : phase === 'entering' ? 0 : 1,
        transition: phase === 'leaving' ? 'opacity 0.4s ease' : 'opacity 0.25s ease',
        pointerEvents: 'all',
      }}
    >
      {/* Logo mark */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        {/* Outer glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)',
            animation: 'splashPulse 1.8s ease-in-out infinite',
          }}
        />
        {/* Icon box */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 40px rgba(109,40,217,0.35)',
            position: 'relative',
          }}
        >
          {/* PDF icon */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
      </div>

      {/* App name */}
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--foreground, #111)',
          margin: '0 0 6px',
          fontFamily: 'inherit',
        }}
      >
        PDF Agent Assist
      </h1>
      <p style={{
        fontSize: 13,
        color: 'var(--muted-foreground, #888)',
        margin: '0 0 32px',
        letterSpacing: '0.02em',
      }}>
        AI-powered PDF reader
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: 180,
          height: 3,
          borderRadius: 999,
          background: 'var(--muted, #f0f0f0)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${barWidth * 100}%`,
            borderRadius: 999,
            background: 'linear-gradient(90deg, #6d28d9, #7c3aed, #8b5cf6)',
            transition: 'width 0.06s linear',
          }}
        />
      </div>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
