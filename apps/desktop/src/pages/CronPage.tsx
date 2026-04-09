import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { useI18n } from '../i18n'

type CronJob = {
  job_id: string
  name: string
  schedule: string
  repeat?: string
  prompt_preview?: string
  next_run_at?: string
  deliver?: string | string[]
  enabled?: boolean
  state?: string
  paused_reason?: string
  script?: string
  skills?: string[]
}

type CronListResult = {
  success?: boolean
  jobs?: CronJob[]
}

type CronOutputSummary = {
  fileName: string
  path: string
}

type CronOutputListResult = {
  success?: boolean
  files?: CronOutputSummary[]
}

type CronOutputReadResult = {
  success?: boolean
  file?: CronOutputSummary & { content?: string }
}

const panelStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  padding: 12,
  borderRadius: 12,
}

export function CronPage() {
  const { t } = useI18n()
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [outputs, setOutputs] = useState<CronOutputSummary[]>([])
  const [selectedOutputPath, setSelectedOutputPath] = useState<string | null>(null)
  const [selectedOutputContent, setSelectedOutputContent] = useState<string>('')

  const [schedule, setSchedule] = useState('every 1h')
  const [prompt, setPrompt] = useState('Write a short daily status note.')
  const [name, setName] = useState('Status Note')
  const [deliver, setDeliver] = useState('local')

  const [editName, setEditName] = useState('')
  const [editSchedule, setEditSchedule] = useState('')
  const [editPrompt, setEditPrompt] = useState('')
  const [editDeliver, setEditDeliver] = useState('local')

  const selectedJob = jobs.find((job) => job.job_id === selectedJobId) ?? null

  const loadOutputs = useCallback(async (jobId: string | null, preferredPath?: string | null) => {
    if (!jobId) {
      setOutputs([])
      setSelectedOutputPath(null)
      setSelectedOutputContent('')
      return
    }

    const result = (await window.hermes.cron.outputs.list({ job_id: jobId })) as CronOutputListResult
    const nextFiles = result.files ?? []
    setOutputs(nextFiles)

    const nextPath =
      preferredPath && nextFiles.some((file) => file.path === preferredPath)
        ? preferredPath
        : nextFiles[0]?.path ?? null

    setSelectedOutputPath(nextPath)

    if (!nextPath) {
      setSelectedOutputContent('')
      return
    }

    const loaded = (await window.hermes.cron.outputs.read({ job_id: jobId, path: nextPath })) as CronOutputReadResult
    setSelectedOutputContent(loaded.file?.content ?? '')
  }, [])

  const refresh = useCallback(async (preferredJobId?: string | null) => {
    try {
      setError(null)
      const result = (await window.hermes.cron.list({ include_disabled: true })) as CronListResult
      const nextJobs = result.jobs ?? []
      setJobs(nextJobs)

      const nextSelectedId =
        preferredJobId && nextJobs.some((job) => job.job_id === preferredJobId)
          ? preferredJobId
          : nextJobs[0]?.job_id ?? null
      setSelectedJobId(nextSelectedId)

      const nextSelected = nextJobs.find((job) => job.job_id === nextSelectedId)
      if (nextSelected) {
        setEditName(nextSelected.name ?? '')
        setEditSchedule(nextSelected.schedule ?? '')
        setEditPrompt(nextSelected.prompt_preview ?? '')
        setEditDeliver(Array.isArray(nextSelected.deliver) ? nextSelected.deliver.join(',') : String(nextSelected.deliver ?? 'local'))
        await loadOutputs(nextSelected.job_id)
      } else {
        setEditName('')
        setEditSchedule('')
        setEditPrompt('')
        setEditDeliver('local')
        await loadOutputs(null)
      }
    } catch (e) {
      setError(String(e))
    }
  }, [loadOutputs])

  async function createJob() {
    try {
      setBusyAction('create')
      setError(null)
      const created = await window.hermes.cron.create({
        schedule,
        prompt,
        name,
        deliver: [deliver],
      })
      const nextJobId = (created as { job_id?: string }).job_id ?? null
      await refresh(nextJobId)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusyAction(null)
    }
  }

  async function runJobAction(action: 'pause' | 'resume' | 'run' | 'remove', jobId: string) {
    try {
      setBusyAction(`${action}:${jobId}`)
      setError(null)
      await window.hermes.cron[action]({ job_id: jobId })
      await refresh(action === 'remove' ? null : jobId)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusyAction(null)
    }
  }

  async function saveJobEdits() {
    if (!selectedJob) return
    try {
      setBusyAction(`update:${selectedJob.job_id}`)
      setError(null)
      await window.hermes.cron.update({
        job_id: selectedJob.job_id,
        name: editName,
        schedule: editSchedule,
        prompt: editPrompt,
        deliver: editDeliver,
      })
      await refresh(selectedJob.job_id)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusyAction(null)
    }
  }

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div style={{ maxWidth: 1120 }}>
      <h2>{t('cron.title')}</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>{t('cron.description')}</p>

      {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 16, marginTop: 16 }}>
        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>{t('cron.createJob')}</h3>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('cron.name')}</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('cron.schedule')}</div>
            <input value={schedule} onChange={(e) => setSchedule(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('cron.deliver')}</div>
            <input value={deliver} onChange={(e) => setDeliver(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('cron.prompt')}</div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ width: '100%', minHeight: 120 }} />
          </label>
          <button onClick={createJob} disabled={busyAction === 'create'}>
            {busyAction === 'create' ? t('cron.creating') : t('cron.create')}
          </button>
        </div>

        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginTop: 0 }}>{t('cron.jobs')}</h3>
            <button onClick={() => refresh(selectedJobId)}>{t('cron.refresh')}</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {jobs.map((job) => (
              <button
                key={job.job_id}
                onClick={() => {
                  setSelectedJobId(job.job_id)
                  setEditName(job.name ?? '')
                  setEditSchedule(job.schedule ?? '')
                  setEditPrompt(job.prompt_preview ?? '')
                  setEditDeliver(Array.isArray(job.deliver) ? job.deliver.join(',') : String(job.deliver ?? 'local'))
                }}
                style={{
                  textAlign: 'left',
                  border: job.job_id === selectedJobId ? '1px solid rgba(231, 149, 78, 0.8)' : '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ fontWeight: 600 }}>{job.name}</div>
                <div style={{ fontSize: 12, opacity: 0.72 }}>{job.schedule}</div>
                <div style={{ fontSize: 12, opacity: 0.72 }}>
                  {job.state ?? t('cron.scheduled')} {job.next_run_at ? `· ${t('cron.next')} ${job.next_run_at}` : ''}
                </div>
              </button>
            ))}
            {jobs.length === 0 ? <div style={{ opacity: 0.7 }}>{t('cron.noJobs')}</div> : null}
          </div>
        </div>
      </div>

      <div style={{ ...panelStyle, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t('cron.selectedJob')}</h3>
        {selectedJob ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{t('cron.name')}</div>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{t('cron.schedule')}</div>
                  <input value={editSchedule} onChange={(e) => setEditSchedule(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{t('cron.deliver')}</div>
                  <input value={editDeliver} onChange={(e) => setEditDeliver(e.target.value)} style={{ width: '100%' }} />
                </label>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>{t('cron.promptPreview')}</div>
                <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} style={{ width: '100%', minHeight: 130 }} />
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
                  {t('cron.skills')}: {selectedJob.skills?.length ? selectedJob.skills.join(', ') : t('cron.none')}
                </div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>
                  {t('cron.script')}: {selectedJob.script ?? t('cron.none')}
                </div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>
                  {t('cron.repeat')}: {selectedJob.repeat ?? t('cron.defaultValue')}
                </div>
                {selectedJob.paused_reason ? (
                  <div style={{ fontSize: 12, opacity: 0.65 }}>{t('cron.pausedReason')}: {selectedJob.paused_reason}</div>
                ) : null}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <button onClick={saveJobEdits} disabled={busyAction === `update:${selectedJob.job_id}`}>
                {busyAction === `update:${selectedJob.job_id}` ? t('cron.saving') : t('cron.saveChanges')}
              </button>
              <button onClick={() => runJobAction('run', selectedJob.job_id)} disabled={busyAction === `run:${selectedJob.job_id}`}>
                {t('cron.runNow')}
              </button>
              {selectedJob.state === 'paused' ? (
                <button onClick={() => runJobAction('resume', selectedJob.job_id)} disabled={busyAction === `resume:${selectedJob.job_id}`}>
                  {t('cron.resume')}
                </button>
              ) : (
                <button onClick={() => runJobAction('pause', selectedJob.job_id)} disabled={busyAction === `pause:${selectedJob.job_id}`}>
                  {t('cron.pause')}
                </button>
              )}
              <button onClick={() => runJobAction('remove', selectedJob.job_id)} disabled={busyAction === `remove:${selectedJob.job_id}`}>
                {t('cron.delete')}
              </button>
              <button onClick={() => loadOutputs(selectedJob.job_id, selectedOutputPath)} disabled={busyAction !== null}>
                {t('cron.refreshOutputs')}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 16, marginTop: 16 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>{t('cron.savedOutputs')}</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {outputs.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => {
                        setSelectedOutputPath(file.path)
                        window.hermes.cron.outputs
                          .read({ job_id: selectedJob.job_id, path: file.path })
                          .then((result) => setSelectedOutputContent(((result as CronOutputReadResult).file?.content ?? '')))
                          .catch((e) => setError(String(e)))
                      }}
                      style={{
                        textAlign: 'left',
                        border: file.path === selectedOutputPath ? '1px solid rgba(231, 149, 78, 0.8)' : '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      {file.fileName}
                    </button>
                  ))}
                  {outputs.length === 0 ? <div style={{ opacity: 0.7 }}>{t('cron.noOutputs')}</div> : null}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>{t('cron.outputPreview')}</div>
                <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 360, overflow: 'auto', margin: 0 }}>
                  {selectedOutputContent || t('cron.outputHint')}
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div style={{ opacity: 0.7 }}>{t('cron.pickJob')}</div>
        )}
      </div>
    </div>
  )
}
