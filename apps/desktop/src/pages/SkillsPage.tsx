import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '../i18n'

type SkillRow = { name: string; description?: string; category?: string }
type SkillViewResult = {
  success?: boolean
  skill?: {
    name?: string
    description?: string
    category?: string
    content?: string
    files?: string[]
    path?: string
  }
  content?: string
  path?: string
  error?: string
}
type DisabledSkillsResult = { success?: boolean; disabled?: string[] }

export function SkillsPage() {
  const { t } = useI18n()
  const [disabledSkills, setDisabledSkills] = useState<string[]>([])
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillViewResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>('')
  const [platform, setPlatform] = useState<string>('global')
  const [busySkillName, setBusySkillName] = useState<string | null>(null)

  const platformOptions = [
    { value: 'global', label: t('skills.global') },
    { value: 'cli', label: t('skills.cli') },
    { value: 'telegram', label: t('skills.telegram') },
    { value: 'discord', label: t('skills.discord') },
    { value: 'slack', label: t('skills.slack') },
    { value: 'signal', label: t('skills.signal') },
    { value: 'whatsapp', label: t('skills.whatsapp') },
    { value: 'email', label: t('skills.email') },
    { value: 'matrix', label: t('skills.matrix') },
  ]

  async function loadSkill(name: string) {
    try {
      setError(null)
      setSelectedSkillName(name)
      const details = (await window.hermes.skills.viewRaw({ name })) as SkillViewResult
      setSelectedSkill(details)
    } catch (e) {
      setError(String(e))
    }
  }

  const refresh = useCallback(async (preferredSkillName?: string | null) => {
    try {
      setError(null)
      const [allSkills, disabledResult] = await Promise.all([
        window.hermes.skills.all(),
        window.hermes.skills.disabled.get({ platform: platform === 'global' ? null : platform }),
      ])
      const nextDisabledSkills = ((disabledResult as DisabledSkillsResult).disabled ?? []).slice().sort((left, right) =>
        left.localeCompare(right),
      )
      setDisabledSkills(nextDisabledSkills)

      const nextSkills = ((allSkills as SkillRow[]) ?? []).filter((skill) =>
        category ? (skill.category ?? '').toLowerCase().includes(category.toLowerCase()) : true,
      )
      setSkills(nextSkills)

      const nextSelectedName =
        preferredSkillName && nextSkills.some((skill) => skill.name === preferredSkillName)
          ? preferredSkillName
          : nextSkills[0]?.name ?? null

      if (nextSelectedName) {
        await loadSkill(nextSelectedName)
      } else {
        setSelectedSkillName(null)
        setSelectedSkill(null)
      }
    } catch (e) {
      setError(String(e))
    }
  }, [category, platform])

  useEffect(() => {
    refresh(selectedSkillName)
  }, [refresh, selectedSkillName])

  const categories = [...new Set(skills.map((skill) => skill.category ?? 'uncategorized'))].sort((left, right) =>
    left.localeCompare(right),
  )

  async function toggleSkill(name: string, shouldDisable: boolean) {
    try {
      setBusySkillName(name)
      setError(null)
      const nextDisabled = shouldDisable
        ? [...new Set([...disabledSkills, name])].sort((left, right) => left.localeCompare(right))
        : disabledSkills.filter((item) => item !== name)

      await window.hermes.skills.disabled.save({
        platform: platform === 'global' ? null : platform,
        disabled: nextDisabled,
      })
      await refresh(selectedSkillName ?? name)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusySkillName(null)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('skills.title')}</h2>
        <p className="page-description">{t('skills.description')}</p>
      </div>

      <div className="ui-card">
        <div className="ui-card-body">
          <div className="ui-toolbar" style={{ marginBottom: 18 }}>
            <label className="ui-label" style={{ minWidth: 200, marginBottom: 0 }}>
              <div className="ui-label-text">{t('skills.scope')}</div>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {platformOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="ui-label" style={{ minWidth: 220, marginBottom: 0 }}>
              <div className="ui-label-text">{t('skills.category')}</div>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t('skills.optional')} />
            </label>
            <button onClick={() => refresh(selectedSkillName)}>{t('skills.refresh')}</button>
          </div>

          {error ? <div className="ui-status-error" style={{ marginBottom: 18 }}>{error}</div> : null}

          <div className="ui-grid" style={{ gridTemplateColumns: '0.75fr 1fr 1.2fr' }}>
            <section className="ui-card-soft" style={{ padding: 16 }}>
              <h3 className="ui-card-title">{t('skills.categories')}</h3>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                {categories.map((item) => (
                  <div key={item} className="ui-pill">{item}</div>
                ))}
                {categories.length === 0 ? <div className="ui-meta">{t('skills.noCategories')}</div> : null}
              </div>
              <div className="ui-meta" style={{ marginTop: 14 }}>
                {t('skills.disabledInScope')}: {disabledSkills.length}
              </div>
            </section>

            <section className="ui-card-soft" style={{ padding: 16 }}>
              <h3 className="ui-card-title">{t('skills.skillsCount')} ({skills.length})</h3>
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                {skills.map((skill) => (
                  <div key={skill.name} className={`ui-list-button ${skill.name === selectedSkillName ? 'is-active' : ''}`}>
                    <button
                      onClick={() => loadSkill(skill.name)}
                      style={{ width: '100%', textAlign: 'left', padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontWeight: 700 }}>{skill.name}</div>
                        <span className="ui-pill">
                          {disabledSkills.includes(skill.name) ? t('skills.disabled') : t('skills.enabled')}
                        </span>
                      </div>
                      <div className="ui-meta" style={{ marginTop: 6 }}>{skill.category ?? ''}</div>
                      <div style={{ marginTop: 10, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{skill.description ?? ''}</div>
                    </button>
                    <div style={{ marginTop: 12 }}>
                      <button onClick={() => toggleSkill(skill.name, !disabledSkills.includes(skill.name))} disabled={busySkillName === skill.name}>
                        {busySkillName === skill.name
                          ? t('skills.saving')
                          : disabledSkills.includes(skill.name)
                            ? t('skills.enableSkill')
                            : t('skills.disableSkill')}
                      </button>
                    </div>
                  </div>
                ))}
                {skills.length === 0 ? <div className="ui-meta">{t('skills.noSkills')}</div> : null}
              </div>
            </section>

            <section className="ui-card-soft" style={{ padding: 16 }}>
              <h3 className="ui-card-title">{t('skills.detail')}</h3>
              {selectedSkill ? (
                <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedSkill.skill?.name ?? selectedSkillName}</div>
                  <div className="ui-meta">{selectedSkill.skill?.category ?? ''}</div>
                  <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {selectedSkill.skill?.description ?? ''}
                  </div>
                  <div className="ui-meta">
                    {t('skills.path')}: <span className="ui-code">{selectedSkill.skill?.path ?? selectedSkill.path ?? '(unknown)'}</span>
                  </div>
                  {selectedSkill.error ? <div className="ui-status-error">{selectedSkill.error}</div> : null}
                  {selectedSkill.skill?.files?.length ? (
                    <div className="ui-meta">{t('skills.files')}: {selectedSkill.skill.files.join(', ')}</div>
                  ) : null}
                  <pre className="ui-surface" style={{ margin: 0, maxHeight: 520, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    {selectedSkill.skill?.content ?? selectedSkill.content ?? t('skills.noContent')}
                  </pre>
                </div>
              ) : (
                <div className="ui-meta" style={{ marginTop: 12 }}>{t('skills.pickSkill')}</div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
