import { google } from 'googleapis'

const KEY_PATH = '/Users/arjav/Downloads/gsc-dumpster-48af5ab27bae.json'
const SITE_URL = 'sc-domain:dumpsterlisting.com'

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
})

const sc = google.searchconsole({ version: 'v1', auth })

// GSC has ~3 day lag, so Mar 8 data won't be available yet. Let's try up to today
const { data } = await sc.searchanalytics.query({
  siteUrl: SITE_URL,
  requestBody: {
    startDate: '2026-03-01',
    endDate: '2026-03-08',
    dimensions: ['date'],
    rowLimit: 10,
  },
})

console.log('Date           | Impressions | Clicks | CTR    | Position')
console.log('---------------|-------------|--------|--------|--------')
for (const row of data.rows || []) {
  const d = row.keys[0]
  console.log(`${d} | ${String(row.impressions).padStart(11)} | ${String(row.clicks).padStart(6)} | ${(row.ctr * 100).toFixed(1).padStart(5)}% | ${row.position.toFixed(1).padStart(6)}`)
}

// Compare top queries Mar 1-4 vs Mar 5-8
console.log('\n--- Top Queries: Mar 1-4 vs Mar 5-7 ---')
const q1 = await sc.searchanalytics.query({
  siteUrl: SITE_URL,
  requestBody: { startDate: '2026-03-01', endDate: '2026-03-04', dimensions: ['query'], rowLimit: 30 },
})
const q2 = await sc.searchanalytics.query({
  siteUrl: SITE_URL,
  requestBody: { startDate: '2026-03-05', endDate: '2026-03-08', dimensions: ['query'], rowLimit: 30 },
})

const q1Map = {}
for (const r of (q1.data.rows || [])) q1Map[r.keys[0]] = r.impressions

const changes = (q2.data.rows || []).map(r => ({
  query: r.keys[0],
  now: r.impressions,
  before: q1Map[r.keys[0]] || 0,
  diff: r.impressions - (q1Map[r.keys[0]] || 0),
  pos: r.position.toFixed(1),
}))

// Show queries that dropped
const drops = [...changes].sort((a, b) => a.diff - b.diff).slice(0, 15)
console.log('\nBiggest query drops:')
for (const c of drops) {
  console.log(`  ${c.diff >= 0 ? '+' : ''}${c.diff} | now: ${c.now} | was: ${c.before} | pos: ${c.pos} | "${c.query}"`)
}

// Also check top pages
console.log('\n--- Top Pages: Mar 1-4 vs Mar 5-7 ---')
const p1 = await sc.searchanalytics.query({
  siteUrl: SITE_URL,
  requestBody: { startDate: '2026-03-01', endDate: '2026-03-04', dimensions: ['page'], rowLimit: 30 },
})
const p2 = await sc.searchanalytics.query({
  siteUrl: SITE_URL,
  requestBody: { startDate: '2026-03-05', endDate: '2026-03-08', dimensions: ['page'], rowLimit: 30 },
})

const p1Map = {}
for (const r of (p1.data.rows || [])) p1Map[r.keys[0]] = { imp: r.impressions, pos: r.position }

const pageChanges = (p2.data.rows || []).map(r => ({
  page: r.keys[0].replace('https://dumpsterlisting.com', ''),
  now: r.impressions,
  before: (p1Map[r.keys[0]] || {}).imp || 0,
  diff: r.impressions - ((p1Map[r.keys[0]] || {}).imp || 0),
  posNow: r.position.toFixed(1),
  posBefore: ((p1Map[r.keys[0]] || {}).pos || 0).toFixed ? ((p1Map[r.keys[0]] || {}).pos || 0).toFixed(1) : '—',
}))

const pageDrops = [...pageChanges].sort((a, b) => a.diff - b.diff).slice(0, 15)
console.log('\nBiggest page drops:')
for (const c of pageDrops) {
  console.log(`  ${c.diff >= 0 ? '+' : ''}${c.diff} | now: ${c.now} | was: ${c.before} | pos: ${c.posNow} (was ${c.posBefore}) | ${c.page}`)
}
