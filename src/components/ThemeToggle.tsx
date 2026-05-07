import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/src/lib/theme';

type Option = { value: 'light' | 'dark' | 'system'; label: string; Icon: React.FC<any> };

const OPTIONS: Option[] = [
  { value: 'light',  label: 'Light',  Icon: Sun },
  { value: 'dark',   label: 'Dark',   Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = OPTIONS.find(o => o.value === theme) || OPTIONS[2];
  const { Icon: CurrentIcon } = current;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={`Theme: ${current.label}`}
        aria-label="Toggle theme"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: '1px solid var(--border, #e5e7eb)',
          background: open ? 'var(--muted, #f4f4f5)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--muted-foreground, #71717a)',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted, #f4f4f5)')}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <CurrentIcon size={15} strokeWidth={2} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 130,
            background: 'var(--popover, #fff)',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 200,
            padding: '4px',
            animation: 'themeDropIn 0.15s ease',
          }}
        >
          {OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '7px 10px',
                borderRadius: 7,
                border: 'none',
                background: theme === value ? 'var(--accent, #f4f4f5)' : 'transparent',
                color: theme === value ? 'var(--foreground, #111)' : 'var(--muted-foreground, #71717a)',
                fontSize: 13,
                fontWeight: theme === value ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.12s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                if (theme !== value) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent, #f4f4f5)';
              }}
              onMouseLeave={e => {
                if (theme !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
              {theme === value && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--primary, #6d28d9)' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes themeDropIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
