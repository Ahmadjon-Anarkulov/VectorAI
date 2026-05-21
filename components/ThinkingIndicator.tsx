'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Cpu, Sparkles } from 'lucide-react'

const clsx = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(' ')


export type ThinkingIndicatorMode = 'thinking' | 'searching' | 'generating'

export interface ThinkingIndicatorProps {
  /** default: "Thinking about your request..." */
  text?: string
  /** Shows seconds like "3s" */
  initialSeconds?: number
  /** After 10s we slightly change text unless customTextAfter10 is provided */
  customTextAfter10?: string
  /** After 20s we slightly change text unless customTextAfter20 is provided */
  customTextAfter20?: string
  /** Opacity/size tuning */
  className?: string
  /** Optional mode for easy future extension */
  mode?: ThinkingIndicatorMode
}

type OrbitalDot = { id: number; delayMs: number; radius: number; speed: number; size: number }

const DEFAULT_TEXT = 'Thinking about your request...'
const DEFAULT_AFTER_10 = 'Still thinking...'
const DEFAULT_AFTER_20 = 'Taking a bit longer...'

export default function ThinkingIndicator({
  text = DEFAULT_TEXT,
  initialSeconds = 0,
  customTextAfter10 = DEFAULT_AFTER_10,
  customTextAfter20 = DEFAULT_AFTER_20,
  className,
  mode = 'thinking'
}: ThinkingIndicatorProps) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    setSeconds(initialSeconds)
    const interval = window.setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [initialSeconds])

  const displayText = useMemo(() => {
    if (seconds >= 20) return customTextAfter20
    if (seconds >= 10) return customTextAfter10
    return text
  }, [seconds, text, customTextAfter10, customTextAfter20])

  const dots: OrbitalDot[] = useMemo(() => {
    // stable per mount
    return [
      { id: 1, delayMs: 0, radius: 10, speed: 1, size: 6 },
      { id: 2, delayMs: 120, radius: 14, speed: -1, size: 5 },
      { id: 3, delayMs: 240, radius: 18, speed: 1, size: 4 },
      { id: 4, delayMs: 360, radius: 14, speed: -1, size: 5 }
    ]
  }, [])

  return (
    <div
      className={clsx(
        'group flex items-center justify-center px-4 py-3',
        'relative'
      )}
    >
      {/* Background glow */}
      <div
        aria-hidden
        className={clsx(
          'pointer-events-none absolute inset-0 rounded-2xl',
          'bg-[radial-gradient(80%_60%_at_50%_0%,rgba(59,130,246,0.20),transparent_60%)]',
          'dark:bg-[radial-gradient(80%_60%_at_50%_0%,rgba(56,189,248,0.18),transparent_60%)]',
          'opacity-100 transition-opacity duration-500'
        )}
      />

      <div
        className={clsx(
          'relative z-10 w-full max-w-2xl',
          'rounded-2xl',
          'border border-zinc-200/60 dark:border-zinc-800/60',
          'bg-white/60 dark:bg-zinc-900/40',
          'backdrop-blur-md'
        )}
      >
        <div className={clsx('flex items-center gap-4 px-5 py-3.5', className)}>
          {/* Orbiting dots */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div
              className={clsx(
                'absolute inset-0 rounded-full',
                'bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35),transparent_60%)]',
                'animate-[pulse_2.2s_ease-in-out_infinite]'
              )}
            />

            {/* Orbit animation (pure CSS, no next <style jsx>) */}
            <style>{`
              @keyframes orbitDot {
                from { transform: rotate(0deg) translateX(var(--r)); opacity: 0.55; }
                50% { opacity: 1; }
                to { transform: rotate(360deg) translateX(var(--r)); opacity: 0.55; }
              }
            `}</style>

            <div className="absolute inset-0 rounded-full opacity-80">
              {dots.map((d) => (
                <span
                  key={d.id}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: d.size,
                    height: d.size,
                    marginLeft: -d.size / 2,
                    marginTop: -d.size / 2,
                    ['--r' as any]: `${d.radius}px`
                  }}
                >
                  <span
                    className={clsx(
                      'absolute inset-0 rounded-full',
                      'bg-cyan-300/90 dark:bg-cyan-300',
                      'shadow-[0_0_18px_rgba(34,211,238,0.65)]'
                    )}
                    style={{
                      animation: 'orbitDot 1.65s linear infinite',
                      animationDelay: `${d.delayMs}ms`,
                      animationDirection: d.speed === 1 ? 'normal' : 'reverse'
                    }}
                  />
                </span>
              ))}
            </div>

            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400/90 dark:text-cyan-300" />
              </div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                <Sparkles className="w-4 h-4 text-cyan-200/70 dark:text-cyan-200" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-sm sm:text-[15px] text-zinc-800 dark:text-zinc-100 font-medium">
                {displayText}
              </p>
              <span className="text-sm sm:text-[15px] tabular-nums font-semibold text-cyan-600 dark:text-cyan-300">
                {seconds}s
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 w-24 sm:w-28 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 overflow-hidden">
                <div
                  className={clsx(
                    'h-full w-full rounded-full',
                    'bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500',
                    'animate-[thinkingbar_1.6s_ease-in-out_infinite]'
                  )}
                />
              </div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                AroxAI
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

