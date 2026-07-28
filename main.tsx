export function DoneScreen({
  outputUrl,
  onReset,
}: {
  outputUrl: string
  onReset: () => void
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-14 text-center">
      <h2 className="text-2xl font-bold text-slate-100">完成しました</h2>
      <video
        src={outputUrl}
        controls
        className="w-full rounded-lg border border-slate-800 bg-black"
      />
      <div className="flex gap-3">
        <a
          href={outputUrl}
          download
          className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
        >
          動画をダウンロード
        </a>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          別の動画を作成する
        </button>
      </div>
    </div>
  )
}
