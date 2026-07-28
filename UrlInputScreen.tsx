import { useCallback, useEffect, useRef, useState } from 'react'
import { createJob, getJob, renderJob, uploadJob } from './api/client'
import type { JobStatusResponse, Segment } from './types/job'
import { UrlInputScreen } from './components/UrlInputScreen'
import { ProgressScreen } from './components/ProgressScreen'
import { EditReviewScreen } from './components/EditReviewScreen'
import { DoneScreen } from './components/DoneScreen'

function App() {
  const [job, setJob] = useState<JobStatusResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmittingRender, setIsSubmittingRender] = useState(false)
  const pollTimer = useRef<number | null>(null)

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }, [])

  const startPolling = useCallback(
    (jobId: string) => {
      stopPolling()
      pollTimer.current = window.setInterval(async () => {
        try {
          const latest = await getJob(jobId)
          setJob(latest)
          if (latest.status === 'review_ready' || latest.status === 'done' || latest.status === 'failed') {
            stopPolling()
            if (latest.status === 'failed') {
              setErrorMessage(latest.error ?? '処理に失敗しました')
            }
          }
        } catch (e) {
          stopPolling()
          setErrorMessage(e instanceof Error ? e.message : '通信エラーが発生しました')
        }
      }, 2000)
    },
    [stopPolling],
  )

  useEffect(() => stopPolling, [stopPolling])

  const handleUrlSubmit = async (url: string) => {
    setErrorMessage(null)
    try {
      const created = await createJob(url)
      setJob(created)
      startPolling(created.job_id)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'ジョブの作成に失敗しました')
    }
  }

  const handleFileSubmit = async (file: File) => {
    setErrorMessage(null)
    try {
      const created = await uploadJob(file)
      setJob(created)
      startPolling(created.job_id)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'アップロードに失敗しました')
    }
  }

  const handleConfirmRender = async (segments: Segment[]) => {
    if (!job) return
    setIsSubmittingRender(true)
    setErrorMessage(null)
    try {
      const updated = await renderJob(job.job_id, segments)
      setJob(updated)
      startPolling(job.job_id)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '書き出し開始に失敗しました')
    } finally {
      setIsSubmittingRender(false)
    }
  }

  const handleReset = () => {
    stopPolling()
    setJob(null)
    setErrorMessage(null)
  }

  const renderBody = () => {
    if (!job) {
      return (
        <UrlInputScreen
          onSubmitUrl={handleUrlSubmit}
          onSubmitFile={handleFileSubmit}
          errorMessage={errorMessage}
        />
      )
    }

    if (job.status === 'failed') {
      return (
        <UrlInputScreen
          onSubmitUrl={handleUrlSubmit}
          onSubmitFile={handleFileSubmit}
          errorMessage={errorMessage ?? job.error ?? '処理に失敗しました'}
        />
      )
    }

    if (job.status === 'queued' || job.status === 'processing') {
      const title =
        job.step && job.step.startsWith('rendering')
          ? '動画を書き出しています'
          : '動画を解析しています'
      return <ProgressScreen step={job.step} title={title} />
    }

    if (job.status === 'review_ready' && job.segments && job.source_media_url) {
      return (
        <EditReviewScreen
          sourceUrl={job.source_media_url}
          initialSegments={job.segments}
          onConfirm={handleConfirmRender}
          isSubmitting={isSubmittingRender}
        />
      )
    }

    if (job.status === 'done' && job.output_url) {
      return <DoneScreen outputUrl={job.output_url} onReset={handleReset} />
    }

    return <ProgressScreen step={job.step} title="処理しています" />
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4">
      <div className="mx-auto max-w-5xl">{renderBody()}</div>
    </div>
  )
}

export default App
