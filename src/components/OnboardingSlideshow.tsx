import React, { useState, useEffect, useCallback } from 'react';
import { Key, FolderOpen, Sparkles, ChevronLeft, ChevronRight, X, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';

interface OnboardingSlideshowProps {
  onDismiss: () => void;
  onKeySaved: (key: string) => void;
}

const SLIDES = [
  {
    step: 1,
    icon: Key,
    iconColor: '#6d28d9',
    iconBg: 'rgba(109, 40, 217, 0.1)',
    title: 'Add Your Google API Key',
    description: 'Enter your Gemini API key below to get started. You can also do this later from the key icon in the header.',
    hint: 'Your key is stored locally only — never sent to our servers.',
    accentColor: '#6d28d9',
    gradientFrom: 'rgba(109, 40, 217, 0.06)',
    gradientTo: 'rgba(139, 92, 246, 0.02)',
    hasApiInput: true,
  },
  {
    step: 2,
    icon: FolderOpen,
    iconColor: '#0284c7',
    iconBg: 'rgba(2, 132, 199, 0.1)',
    title: 'Open a PDF',
    description: 'Open a PDF using the Open button in the toolbar or upload a file using Select File.',
    hint: 'Recent files are remembered so you can quickly switch between documents.',
    accentColor: '#0284c7',
    gradientFrom: 'rgba(2, 132, 199, 0.06)',
    gradientTo: 'rgba(56, 189, 248, 0.02)',
    hasApiInput: false,
  },
  {
    step: 3,
    icon: Sparkles,
    iconColor: '#059669',
    iconBg: 'rgba(5, 150, 105, 0.1)',
    title: 'Add Context & Use AI Actions',
    description: 'Select text from the PDF and add it as context in the chat. Use AI Actions for quick insights.',
    hint: 'Long pastes are automatically captured as context — no need to copy-paste manually!',
    accentColor: '#059669',
    gradientFrom: 'rgba(5, 150, 105, 0.06)',
    gradientTo: 'rgba(52, 211, 153, 0.02)',
    hasApiInput: false,
  },
];

export function OnboardingSlideshow({ onDismiss, onKeySaved }: OnboardingSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [visible, setVisible] = useState(false);

  // Slide 1 API key state
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [keyError, setKeyError] = useState('');

  useEffect(() => {
    // Pre-fill if key already exists
    const existing = localStorage.getItem('GEMINI_CUSTOM_API_KEY');
    if (existing) {
      setApiKey(existing);
      setKeySaved(true);
    }
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback((index: number, dir: 'next' | 'prev') => {
    if (animating) return;
    setAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrentSlide(index);
      setAnimating(false);
    }, 260);
  }, [animating]);

  const next = () => {
    if (currentSlide < SLIDES.length - 1) goTo(currentSlide + 1, 'next');
  };

  const prev = () => {
    if (currentSlide > 0) goTo(currentSlide - 1, 'prev');
  };

  const handleSaveKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setKeyError('Please enter a valid API key.');
      return;
    }
    setKeyError('');
    localStorage.setItem('GEMINI_CUSTOM_API_KEY', trimmed);
    localStorage.setItem('ONBOARDING_DISMISSED', 'true');
    setKeySaved(true);
    onKeySaved(trimmed);
    // Auto-advance to next slide after a moment
    setTimeout(() => next(), 600);
  };

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;
  const isLast = currentSlide === SLIDES.length - 1;
  const isFirst = currentSlide === 0;

  // Shared button style factories
  const primaryBtn = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '0 18px',
    height: 34,
    borderRadius: 10,
    background: color,
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    whiteSpace: 'nowrap' as const,
  });

  const ghostBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: '0 14px',
    height: 34,
    borderRadius: 10,
    background: 'transparent',
    color: 'var(--muted-foreground, #71717a)',
    border: '1px solid var(--border, #e5e7eb)',
    fontWeight: 500,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  };

  const iconNavBtn = (disabled: boolean): React.CSSProperties => ({
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1px solid var(--border, #e5e7eb)',
    background: 'var(--background, #fff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    color: 'var(--foreground, #111)',
    transition: 'all 0.2s',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(6px)',
        transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          margin: '0 16px',
          background: `linear-gradient(145deg, ${slide.gradientFrom}, ${slide.gradientTo}), var(--card, #fff)`,
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: 20,
          boxShadow: `0 24px 60px -12px rgba(0,0,0,0.28), 0 0 0 1px ${slide.accentColor}22`,
          overflow: 'hidden',
          transition: 'box-shadow 0.4s ease',
          position: 'relative',
        }}
      >
        {/* Accent top bar */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${slide.accentColor}, ${slide.accentColor}66)`,
          transition: 'background 0.4s ease',
        }} />

        {/* Dismiss ✕ */}
        <button
          onClick={onDismiss}
          title="Dismiss"
          aria-label="Dismiss onboarding"
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'var(--muted, #f4f4f5)',
            border: 'none', borderRadius: '50%',
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--muted-foreground, #71717a)',
            transition: 'background 0.2s, color 0.2s', zIndex: 2,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--destructive, #ef4444)';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted, #f4f4f5)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground, #71717a)';
          }}
        >
          <X size={13} strokeWidth={2.5} />
        </button>

        {/* Animated slide body */}
        <div
          style={{
            padding: '28px 28px 20px',
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${direction === 'next' ? '-18px' : '18px'})`
              : 'translateX(0)',
            transition: 'opacity 0.26s ease, transform 0.26s ease',
          }}
        >
          {/* Icon + step badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: slide.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid ${slide.accentColor}33`,
              flexShrink: 0, transition: 'background 0.4s, border-color 0.4s',
            }}>
              <Icon size={22} color={slide.iconColor} strokeWidth={1.8} />
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${slide.accentColor}12`,
              border: `1px solid ${slide.accentColor}30`,
              borderRadius: 999, padding: '3px 10px',
              fontSize: 11, fontWeight: 700, color: slide.accentColor,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'all 0.4s',
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                background: slide.accentColor, color: '#fff',
                fontSize: 10, fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{slide.step}</span>
              Step {slide.step} of {SLIDES.length}
            </div>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: 19, fontWeight: 700,
            color: 'var(--foreground, #111)',
            margin: '0 0 8px', lineHeight: 1.3, letterSpacing: '-0.01em',
          }}>
            {slide.title}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: 13.5, color: 'var(--muted-foreground, #71717a)',
            lineHeight: 1.65, margin: '0 0 16px',
          }}>
            {slide.description}
          </p>

          {/* ── Slide 1: Inline API key input ── */}
          {slide.hasApiInput && (
            <div style={{ marginBottom: 16 }}>
              {/* Input row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: `1.5px solid ${keyError ? '#ef4444' : keySaved ? '#059669' : slide.accentColor}55`,
                borderRadius: 10, overflow: 'hidden',
                background: 'var(--background, #fff)',
                transition: 'border-color 0.25s',
              }}>
                <Key size={15} color={slide.accentColor} style={{ marginLeft: 10, flexShrink: 0 }} />
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="Paste your Gemini API key…"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setKeyError(''); setKeySaved(false); }}
                  onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    background: 'transparent', fontSize: 13,
                    color: 'var(--foreground, #111)',
                    padding: '9px 4px', fontFamily: 'inherit',
                  }}
                />
                {/* Show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--muted-foreground, #71717a)',
                    padding: '0 8px', display: 'flex', alignItems: 'center',
                  }}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Error message */}
              {keyError && (
                <p style={{ fontSize: 11, color: '#ef4444', margin: '5px 0 0 4px' }}>{keyError}</p>
              )}

              {/* Success badge */}
              {keySaved && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  marginTop: 6, fontSize: 11, color: '#059669', fontWeight: 600,
                }}>
                  <Check size={12} strokeWidth={3} /> Key saved — you're all set!
                </div>
              )}

              {/* Helper link */}
              <p style={{ fontSize: 11, color: 'var(--muted-foreground, #71717a)', margin: '6px 0 0' }}>
                Get your key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: slide.accentColor, textDecoration: 'underline' }}
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          )}

          {/* Hint pill (hidden on slide 1 when input is visible to save vertical space) */}
          {!slide.hasApiInput && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: `${slide.accentColor}08`,
              border: `1px dashed ${slide.accentColor}30`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
            }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>💡</span>
              <p style={{ fontSize: 12, color: 'var(--muted-foreground, #71717a)', margin: 0, lineHeight: 1.55 }}>
                {slide.hint}
              </p>
            </div>
          )}

          {/* ── Navigation row ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: slide.hasApiInput ? 4 : 0 }}>
            {/* Dot indicators */}
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > currentSlide ? 'next' : 'prev')}
                  aria-label={`Go to step ${i + 1}`}
                  style={{
                    width: i === currentSlide ? 22 : 7,
                    height: 7, borderRadius: 999,
                    background: i === currentSlide ? slide.accentColor : 'var(--border, #e5e7eb)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: i === currentSlide ? 1 : 0.5,
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              {/* Back arrow — always visible, disabled on first slide */}
              <button
                onClick={prev}
                disabled={isFirst}
                title="Previous"
                style={iconNavBtn(isFirst)}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Slide 1: "Save Key" primary + "Next →" ghost */}
              {isFirst && (
                <>
                  <button
                    onClick={handleSaveKey}
                    style={primaryBtn(slide.accentColor)}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <Key size={13} /> Save Key
                  </button>
                  <button
                    onClick={next}
                    style={ghostBtn}
                    title="Skip for now"
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = slide.accentColor + '88';
                      (e.currentTarget as HTMLButtonElement).style.color = slide.accentColor;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border, #e5e7eb)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground, #71717a)';
                    }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </>
              )}

              {/* Middle slides: Next → */}
              {!isFirst && !isLast && (
                <button
                  onClick={next}
                  style={primaryBtn(slide.accentColor)}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Next <ChevronRight size={14} />
                </button>
              )}

              {/* Last slide: Get Started */}
              {isLast && (
                <button
                  onClick={onDismiss}
                  style={primaryBtn(slide.accentColor)}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Get Started <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Skip footer */}
        <div style={{
          paddingBottom: 16, textAlign: 'center',
          borderTop: '1px solid var(--border, #e5e7eb)', paddingTop: 11,
        }}>
          <button
            onClick={onDismiss}
            style={{
              background: 'none', border: 'none', fontSize: 11,
              color: 'var(--muted-foreground, #71717a)', cursor: 'pointer',
              letterSpacing: '0.03em', textDecoration: 'underline',
              textDecorationStyle: 'dotted', textUnderlineOffset: 3,
            }}
          >
            Skip introduction
          </button>
        </div>
      </div>
    </div>
  );
}
