import { useEffect, useState } from 'react'

export function CronPage() {
  const [jobs, setJobs] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [schedule, setSchedule] = useState('every 1h')
  const [prompt, setPrompt] = useState('Write a short daily status note.')
  const [name, setName] = useState('Status Note')

  async function refresh() {
    try {
      setError(null)
      setJobs(await window.hermes.cron.list({ include_disabled: true }))
    } catch (e) {
      setError(String(e))
    }
  }

  async function createJob() {
    try {
      setError(null)
      const created = await window.hermes.cron.create({
        schedule,
        prompt,
        name,
        deliver: ['local'],
      })
      await refresh()
      return created
    } catch (e) {
      setError(String(e))
      return null
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div style={{ maxWidth: 980 }}>
      <h2>Cron</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>Manage scheduled jobs (stored in Hermes home).</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Create Job</h3>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Schedule</div>
            <input value={schedule} onChange={(e) => setSchedule(e.target.value)} style={{ width: '100%' }} />
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Examples: <code>every 30m</code>, <code>0 9 * * *</code>, <code>2026-04-10T09:00</code>
            </div>
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Prompt</div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ width: '100%', minHeight: 120 }} />
          </label>
          <button onClick={createJob}>Create</button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Jobs</h3>
            <button onClick={refresh}>Refresh</button>
          </div>
          {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}
          <pre style={{ whiteSpace: 'pre-wrap' }}>{jobs ? JSON.stringify(jobs, null, 2) : 'Loading...'}</pre>
        </div>
      </div>
    </div>
  )
}
