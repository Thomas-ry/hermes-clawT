import { useCallback, useEffect, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ClockIcon } from '../components/icons'
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
  const activeJobCount = jobs.filter((job) => job.state !== 'paused').length
  const cronTemplates = [
    {
      name: t('cron.templateDailyName'),
      schedule: 'every day at 09:00',
      deliver: 'local',
      prompt: t('cron.templateDailyPrompt'),
    },
    {
      name: t('cron.templateWorkspaceName'),
      schedule: 'every 4h',
      deliver: 'local',
      prompt: t('cron.templateWorkspacePrompt'),
    },
    {
      name: t('cron.templateSkillsName'),
      schedule: 'every monday at 10:00',
      deliver: 'local',
      prompt: t('cron.templateSkillsPrompt'),
    },
  ]

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

  function applyTemplate(template: { name: string; schedule: string; deliver: string; prompt: string }) {
    setName(template.name)
    setSchedule(template.schedule)
    setDeliver(template.deliver)
    setPrompt(template.prompt)
    setError(null)
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('cron.title')}</h2>
        <p className="page-description">{t('cron.description')}</p>
      </div>

      {error ? <div className="ui-status-error">{error}</div> : null}

      <section className="ui-card" style={{ marginTop: 18 }}>
        <div className="ui-card-body">
          <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 className="ui-card-title">{t('cron.overviewTitle')}</h3>
              <p className="ui-card-description">{t('cron.overviewDescription')}</p>
            </div>
            <div className="ui-toolbar">
              <span className="ui-pill">{t(`cron.jobCount|${jobs.length}`)}</span>
              <span className="ui-pill">{t(`cron.activeCount|${activeJobCount}`)}</span>
            </div>
          </div>

          <div className="cron-template-grid">
            {cronTemplates.map((template) => (
              <button
                key={template.name}
                type="button"
                className="cron-template-button"
                onClick={() => applyTemplate(template)}
                disabled={busyAction === 'create'}
              >
                <div className="dashboard-quick-title">{template.name}</div>
                <div className="dashboard-quick-description">{template.prompt}</div>
                <div className="ui-meta">{template.schedule}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="ui-grid ui-grid-two" style={{ marginTop: 18 }}>
        <section className="ui-card">
          <div className="ui-card-body">
            <h3 className="ui-card-title">{t('cron.createJob')}</h3>
            <p className="ui-card-description">{t('cron.description')}</p>
            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              <label className="ui-label" style={{ marginBottom: 0 }}>
                <div className="ui-label-text">{t('cron.name')}</div>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="ui-label" style={{ marginBottom: 0 }}>
                <div className="ui-label-text">{t('cron.schedule')}</div>
                <input value={schedule} onChange={(e) => setSchedule(e.target.value)} />
              </label>
              <label className="ui-label" style={{ marginBottom: 0 }}>
                <div className="ui-label-text">{t('cron.deliver')}</div>
                <input value={deliver} onChange={(e) => setDeliver(e.target.value)} />
              </label>
              <label className="ui-label" style={{ marginBottom: 0 }}>
                <div className="ui-label-text">{t('cron.prompt')}</div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ minHeight: 150 }} />
              </label>
              <div className="ui-toolbar">
                <button onClick={createJob} disabled={busyAction === 'create'}>
                  {busyAction === 'create' ? t('cron.creating') : t('cron.create')}
                </button>
              </div>
              <div className="ui-meta">{t('cron.createHint')}</div>
            </div>
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card-body">
            <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 className="ui-card-title">{t('cron.jobs')}</h3>
                <p className="ui-card-description">{jobs.length} jobs</p>
              </div>
              <button onClick={() => refresh(selectedJobId)}>{t('cron.refresh')}</button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {jobs.map((job) => (
                <button
                  key={job.job_id}
                  onClick={() => {
                    setSelectedJobId(job.job_id)
                    setEditName(job.name ?? '')
                    setEditSchedule(job.schedule ?? '')
                    setEditPrompt(job.prompt_preview ?? '')
                    setEditDeliver(Array.isArray(job.deliver) ? job.deliver.join(',') : String(job.deliver ?? 'local'))
                    loadOutputs(job.job_id)
                  }}
                  className={`ui-list-button ${job.job_id === selectedJobId ? 'is-active' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{job.name}</div>
                    <span className="ui-pill">{job.state ?? t('cron.scheduled')}</span>
                  </div>
                  <div className="ui-meta" style={{ marginTop: 6 }}>{job.schedule}</div>
                  <div className="ui-meta" style={{ marginTop: 6 }}>
                    {job.next_run_at ? `${t('cron.next')} ${job.next_run_at}` : t('cron.defaultValue')}
                  </div>
                  <div className="ui-meta" style={{ marginTop: 6 }}>
                    {t('cron.deliver')}: {Array.isArray(job.deliver) ? job.deliver.join(', ') : String(job.deliver ?? 'local')}
                  </div>
                </button>
              ))}
              {jobs.length === 0 ? (
                <EmptyState icon={<ClockIcon width={20} height={20} />} title={t('cron.jobs')} description={t('cron.noJobsDetailed')} />
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <section className="ui-card" style={{ marginTop: 18 }}>
        <div className="ui-card-body">
          <h3 className="ui-card-title">{t('cron.selectedJob')}</h3>
          {selectedJob ? (
            <div className="ui-grid ui-grid-two" style={{ marginTop: 18 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                <label className="ui-label" style={{ marginBottom: 0 }}>
                  <div className="ui-label-text">{t('cron.name')}</div>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </label>
                <label className="ui-label" style={{ marginBottom: 0 }}>
                  <div className="ui-label-text">{t('cron.schedule')}</div>
                  <input value={editSchedule} onChange={(e) => setEditSchedule(e.target.value)} />
                </label>
                <label className="ui-label" style={{ marginBottom: 0 }}>
                  <div className="ui-label-text">{t('cron.deliver')}</div>
                  <input value={editDeliver} onChange={(e) => setEditDeliver(e.target.value)} />
                </label>
                <label className="ui-label" style={{ marginBottom: 0 }}>
                  <div className="ui-label-text">{t('cron.promptPreview')}</div>
                  <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} style={{ minHeight: 180 }} />
                </label>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                <div className="ui-surface">
                  <div className="ui-meta">{t('cron.skills')}: {selectedJob.skills?.length ? selectedJob.skills.join(', ') : t('cron.none')}</div>
                  <div className="ui-meta" style={{ marginTop: 8 }}>{t('cron.script')}: {selectedJob.script ?? t('cron.none')}</div>
                  <div className="ui-meta" style={{ marginTop: 8 }}>{t('cron.repeat')}: {selectedJob.repeat ?? t('cron.defaultValue')}</div>
                  {selectedJob.paused_reason ? (
                    <div className="ui-meta" style={{ marginTop: 8 }}>{t('cron.pausedReason')}: {selectedJob.paused_reason}</div>
                  ) : null}
                </div>

                <div className="ui-toolbar">
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

                <div className="ui-grid ui-grid-two">
                  <div className="ui-card-soft" style={{ padding: 16 }}>
                    <div className="ui-card-title" style={{ fontSize: '0.95rem' }}>{t('cron.savedOutputs')}</div>
                    <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
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
                          className={`ui-list-button ${file.path === selectedOutputPath ? 'is-active' : ''}`}
                        >
                          {file.fileName}
                        </button>
                      ))}
                      {outputs.length === 0 ? (
                        <EmptyState icon={<ClockIcon width={20} height={20} />} title={t('cron.savedOutputs')} description={t('cron.noOutputs')} />
                      ) : null}
                    </div>
                  </div>

                  <div className="ui-card-soft" style={{ padding: 16 }}>
                    <div className="ui-card-title" style={{ fontSize: '0.95rem' }}>{t('cron.outputPreview')}</div>
                    <pre style={{ margin: '12px 0 0', whiteSpace: 'pre-wrap', maxHeight: 360, overflow: 'auto', color: 'var(--text-secondary)' }}>
                      {selectedOutputContent || t('cron.outputHint')}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 18 }}>
              <EmptyState icon={<ClockIcon width={20} height={20} />} title={t('cron.selectedJob')} description={t('cron.pickJob')} />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
