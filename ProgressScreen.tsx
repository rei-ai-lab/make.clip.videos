import type { JobStatusResponse, Segment } from '../types/job'

async function handle(res: Response): Promise<JobStatusResponse> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = (data && (data as any).detail) || 'エラーが発生しました'
    throw new Error(detail)
  }
  return data as JobStatusResponse
}

export async function createJob(url: string): Promise<JobStatusResponse> {
  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  return handle(res)
}

export async function uploadJob(file: File): Promise<JobStatusResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/jobs/upload', {
    method: 'POST',
    body: formData,
  })
  return handle(res)
}

export async function getJob(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`/api/jobs/${jobId}`)
  return handle(res)
}

export async function renderJob(
  jobId: string,
  segments: Segment[],
): Promise<JobStatusResponse> {
  const res = await fetch(`/api/jobs/${jobId}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments }),
  })
  return handle(res)
}
