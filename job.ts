import { useRef, useState } from 'react'
import type { Segment } from '../types/job'

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = (sec % 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

export function EditReviewScreen({
  sourceUrl,
  initialSegments,
  onConfirm,
  isSubmitting,
}: {
  sourceUrl: string
  initialSegments: Segment[]
  onConfirm: (segments: Segment[]) => void
  isSubmitting: boolean
}) {
  const [segments, setSegments] = useState<Segment[]>(initialSegments)
  const videoRef = useRef<HTMLVideoElement>(null)

  const updateText = (id: number, text: string) => {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)))
  }

  const toggleInclude = (id: number) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, include: !s.include } : s)),
    )
  }

  const seekTo = (start: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = start
      videoRef.current.play().catch(() => {})
    }
  }

  const includedCount = segments.filter((s) => s.include).length

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">解析結果の確認・修正</h2>
        <p className="mt-1 text-slate-400">
          各区間の字幕テキストを修正したり、不要な区間はオフにできます。確認後に書き出しを開始してください。
        </p>
      </div>

      <video
        ref={videoRef}
        src={sourceUrl}
        controls
        className="w-full rounded-lg border border-slate-800 bg-black"
      />

      <div className="flex flex-col gap-3">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className={`flex flex-col gap-2 rounded-lg border p-4 transition sm:flex-row sm:items-start ${
              seg.include
                ? 'border-slate-800 bg-slate-900/60'
                : 'border-slate-800 bg-slate-950/40 opacity-50'
            }`}
          >
            <div className="flex shrink-0 flex-row items-center gap-3 sm:w-40 sm:flex-col sm:items-start">
              <button
                type="button"
                onClick={() => seekTo(seg.start)}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
              >
                {formatTime(seg.start)} 〜 {formatTime(seg.end)}
              </button>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={seg.include}
                  onChange={() => toggleInclude(seg.id)}
                  className="h-4 w-4 accent-purple-600"
                />
                採用する
              </label>
            </div>
            <textarea
              value={seg.text}
              onChange={(e) => updateText(seg.id, e.target.value)}
              disabled={!seg.include}
              rows={2}
              className="flex-1 resize-none rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-500 disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur">
        <span className="text-sm text-slate-400">
          採用区間: {includedCount} / {segments.length}
        </span>
        <button
          type="button"
          disabled={isSubmitting || includedCount === 0}
          onClick={() => onConfirm(segments)}
          className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '書き出し開始中...' : 'この内容で書き出す'}
        </button>
      </div>
    </div>
  )
}
