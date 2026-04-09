import { useCallback, useEffect, useMemo, useState } from 'react'

type SkillRow = { name: string; description?: string; category?: string }

export function SkillsPage() {
  const [categoriesRaw, setCategoriesRaw] = useState<unknown>(null)
  const [skillsRaw, setSkillsRaw] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>('')

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const cats = await window.hermes.skills.categories()
      setCategoriesRaw(cats)
      const list = await window.hermes.skills.list(category ? { category } : {})
      setSkillsRaw(list)
    } catch (e) {
      setError(String(e))
    }
  }, [category])

  useEffect(() => {
    refresh()
  }, [refresh])

  const skills = useMemo(() => {
    const parsed = skillsRaw as { skills?: SkillRow[] } | null
    return parsed?.skills ?? []
  }, [skillsRaw])

  return (
    <div style={{ maxWidth: 980 }}>
      <h2>Skills</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>Browse installed skills in Hermes.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ opacity: 0.8 }}>Category</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="(optional)"
          />
        </label>
        <button onClick={refresh}>Refresh</button>
      </div>

      {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Categories</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{categoriesRaw ? JSON.stringify(categoriesRaw, null, 2) : 'Loading...'}</pre>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Skills ({skills.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {skills.map((s) => (
              <div key={s.name} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 10 }}>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>{s.category ?? ''}</div>
                <div style={{ opacity: 0.85, marginTop: 6, whiteSpace: 'pre-wrap' }}>{s.description ?? ''}</div>
              </div>
            ))}
          </div>
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', opacity: 0.85 }}>Raw JSON</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{skillsRaw ? JSON.stringify(skillsRaw, null, 2) : 'Loading...'}</pre>
          </details>
        </div>
      </div>
    </div>
  )
}
