import { useCallback, useEffect, useState, type CSSProperties } from 'react'
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

const panelStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  padding: 12,
  borderRadius: 12,
}

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
    <div style={{ maxWidth: 1120 }}>
      <h2>{t('skills.title')}</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>{t('skills.description')}</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ opacity: 0.8 }}>{t('skills.scope')}</span>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {platformOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ opacity: 0.8 }}>{t('skills.category')}</span>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t('skills.optional')} />
        </label>
        <button onClick={() => refresh(selectedSkillName)}>{t('skills.refresh')}</button>
      </div>

      {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1fr 1.2fr', gap: 16, marginTop: 16 }}>
        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>{t('skills.categories')}</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {categories.map((item) => (
              <div key={item} style={{ opacity: 0.85 }}>
                {item}
              </div>
            ))}
            {categories.length === 0 ? <div style={{ opacity: 0.7 }}>{t('skills.noCategories')}</div> : null}
          </div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 12 }}>
            {t('skills.disabledInScope')}: {disabledSkills.length}
          </div>
        </div>

        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>{t('skills.skillsCount')} ({skills.length})</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {skills.map((skill) => (
              <div
                key={skill.name}
                style={{
                  border: skill.name === selectedSkillName ? '1px solid rgba(231, 149, 78, 0.8)' : '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <button
                  onClick={() => loadSkill(skill.name)}
                  style={{ width: '100%', textAlign: 'left', padding: 0, background: 'transparent', border: 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>{skill.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {disabledSkills.includes(skill.name) ? t('skills.disabled') : t('skills.enabled')}
                    </div>
                  </div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>{skill.category ?? ''}</div>
                  <div style={{ opacity: 0.85, marginTop: 6, whiteSpace: 'pre-wrap' }}>{skill.description ?? ''}</div>
                </button>
                <button
                  onClick={() => toggleSkill(skill.name, !disabledSkills.includes(skill.name))}
                  disabled={busySkillName === skill.name}
                  style={{ marginTop: 10 }}
                >
                  {busySkillName === skill.name
                    ? t('skills.saving')
                    : disabledSkills.includes(skill.name)
                      ? t('skills.enableSkill')
                      : t('skills.disableSkill')}
                </button>
              </div>
            ))}
            {skills.length === 0 ? <div style={{ opacity: 0.7 }}>{t('skills.noSkills')}</div> : null}
          </div>
        </div>

        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>{t('skills.detail')}</h3>
          {selectedSkill ? (
            <>
              <div style={{ fontWeight: 700 }}>{selectedSkill.skill?.name ?? selectedSkillName}</div>
              <div style={{ opacity: 0.72, fontSize: 12 }}>{selectedSkill.skill?.category ?? ''}</div>
              <div style={{ opacity: 0.8, marginTop: 8, whiteSpace: 'pre-wrap' }}>
                {selectedSkill.skill?.description ?? ''}
              </div>
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 8 }}>
                {t('skills.path')}: {selectedSkill.skill?.path ?? selectedSkill.path ?? '(unknown)'}
              </div>
              {selectedSkill.error ? <div style={{ color: '#ffb4b4', marginTop: 8 }}>{selectedSkill.error}</div> : null}
              {selectedSkill.skill?.files?.length ? (
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
                  {t('skills.files')}: {selectedSkill.skill.files.join(', ')}
                </div>
              ) : null}
              <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', maxHeight: 480, overflow: 'auto' }}>
                {selectedSkill.skill?.content ?? selectedSkill.content ?? t('skills.noContent')}
              </pre>
            </>
          ) : (
            <div style={{ opacity: 0.7 }}>{t('skills.pickSkill')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
