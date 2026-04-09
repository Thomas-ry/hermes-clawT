import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]
    if (!current.startsWith('--')) {
      continue
    }
    const key = current.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) {
      result[key] = 'true'
      continue
    }
    result[key] = next
    index += 1
  }
  return result
}

function git(args, allowFailure = false) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch (error) {
    if (allowFailure) {
      return ''
    }
    throw error
  }
}

function getVersionInfo(versionArg) {
  const fallbackTag = git(['describe', '--tags', '--abbrev=0'], true)
  const version = versionArg || fallbackTag.replace(/^v/, '') || '0.1.0'
  const tag = `v${version}`
  const tagExists = git(['rev-parse', '-q', '--verify', `refs/tags/${tag}`], true).length > 0
  const tags = git(['tag', '--sort=-creatordate'], true)
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
  const previousTag = tagExists ? tags.find((value) => value !== tag) ?? null : tags[0] ?? null
  const range = tagExists ? (previousTag ? `${previousTag}..${tag}` : tag) : (previousTag ? `${previousTag}..HEAD` : 'HEAD')
  return { version, tag, previousTag, range }
}

function categorizeCommit(subject) {
  if (/^feat(\(.+\))?:/i.test(subject)) return 'Features'
  if (/^fix(\(.+\))?:/i.test(subject)) return 'Fixes'
  if (/^(perf|refactor)(\(.+\))?:/i.test(subject)) return 'Improvements'
  if (/^(docs|test)(\(.+\))?:/i.test(subject)) return 'Documentation & QA'
  if (/^(build|ci|chore)(\(.+\))?:/i.test(subject)) return 'Maintenance'
  return 'Other'
}

function formatCommitSubject(subject) {
  return subject.replace(/^[a-z]+(\(.+\))?:\s*/i, '').trim()
}

function collectCommits(range) {
  const raw = git(['log', range, '--pretty=format:%H%x09%s%x09%an%x09%aI'], true)
  if (!raw) {
    return []
  }
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, subject, author, authoredAt] = line.split('\t')
      return {
        hash,
        shortHash: hash.slice(0, 7),
        subject,
        cleanSubject: formatCommitSubject(subject),
        category: categorizeCommit(subject),
        author,
        authoredAt,
      }
    })
}

function buildReleaseNotes({ version, tag, previousTag, repoUrl, commits }) {
  const cleanRepoUrl = repoUrl.replace(/\.git$/, '')
  const compareUrl = previousTag ? `${cleanRepoUrl}/compare/${previousTag}...${tag}` : null
  const grouped = new Map()
  for (const commit of commits) {
    const existing = grouped.get(commit.category) ?? []
    existing.push(commit)
    grouped.set(commit.category, existing)
  }

  const orderedCategories = ['Features', 'Fixes', 'Improvements', 'Documentation & QA', 'Maintenance', 'Other']
  const sections = orderedCategories
    .map((category) => {
      const items = grouped.get(category) ?? []
      if (items.length === 0) {
        return null
      }
      return {
        category,
        items: items.map((commit) => ({
          summary: commit.cleanSubject,
          hash: commit.shortHash,
          author: commit.author,
          authoredAt: commit.authoredAt,
        })),
      }
    })
    .filter(Boolean)

  const markdownLines = [`# clawT ${version}`, '', `Tag: \`${tag}\``]
  if (previousTag) {
    markdownLines.push(`Previous tag: \`${previousTag}\``)
  }
  if (compareUrl) {
    markdownLines.push(`Compare: ${compareUrl}`)
  }
  markdownLines.push('', '## Highlights', '')

  if (sections.length === 0) {
    markdownLines.push('- No code changes were detected for this release range.')
  } else {
    for (const section of sections) {
      markdownLines.push(`### ${section.category}`, '')
      for (const item of section.items) {
        markdownLines.push(`- ${item.summary} (\`${item.hash}\`, ${item.author})`)
      }
      markdownLines.push('')
    }
  }

  return {
    version,
    tag,
    previousTag,
    compareUrl,
    publishedAt: new Date().toISOString(),
    sections,
    markdown: `${markdownLines.join('\n').trim()}\n`,
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const outputDir = args['output-dir']
  const repoUrl = args['repo-url'] || 'https://github.com/Thomas-ry/hermes-clawT'
  if (!outputDir) {
    throw new Error('Missing required argument: --output-dir')
  }

  const { version, tag, previousTag, range } = getVersionInfo(args.version)
  const commits = collectCommits(range)
  const releaseNotes = buildReleaseNotes({ version, tag, previousTag, repoUrl, commits })

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(join(outputDir, 'release-notes.md'), releaseNotes.markdown)
  writeFileSync(join(outputDir, 'release-notes.json'), `${JSON.stringify(releaseNotes, null, 2)}\n`)
  writeFileSync(
    join(outputDir, 'latest.json'),
    `${JSON.stringify(
      {
        version: releaseNotes.version,
        tag: releaseNotes.tag,
        previousTag: releaseNotes.previousTag,
        compareUrl: releaseNotes.compareUrl,
        publishedAt: releaseNotes.publishedAt,
        sections: releaseNotes.sections,
      },
      null,
      2,
    )}\n`,
  )
}

main()
