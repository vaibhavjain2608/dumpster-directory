import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('=').map((s) => s.trim()))
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const auth = new google.auth.GoogleAuth({
  keyFile: '/Users/arjav/Downloads/gsc-dumpster-48af5ab27bae.json',
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
})
const sc = google.searchconsole({ version: 'v1', auth })

// Get top pages by impressions (city pages only)
const res = await sc.searchanalytics.query({
  siteUrl: 'sc-domain:dumpsterlisting.com',
  requestBody: {
    startDate: '2026-02-24',
    endDate: '2026-03-03',
    dimensions: ['page'],
    rowLimit: 1000,
    dimensionFilterGroups: [{
      filters: [{ dimension: 'page', expression: '/dumpster-rental/', operator: 'contains' }]
    }]
  },
})

const rows = res.data.rows || []
const cityPagePattern = /dumpsterlisting\.com\/dumpster-rental\/([a-z-]+)\/([a-z-]+)$/
const cityPages = rows
  .filter((r) => cityPagePattern.test(r.keys[0]) && r.impressions >= 3)
  .sort((a, b) => b.impressions - a.impressions)

const results = []
for (const row of cityPages) {
  const match = row.keys[0].match(cityPagePattern)
  if (!match) continue
  const [, stateSlug, citySlug] = match

  const { data: city } = await supabase
    .from('cities').select('id').eq('state_slug', stateSlug).eq('city_slug', citySlug).single()
  if (!city) continue

  const { count } = await supabase
    .from('businesses').select('id', { count: 'exact', head: true })
    .eq('city_id', city.id).eq('is_active', true)

  results.push({
    state: stateSlug, city: citySlug,
    impressions: row.impressions, clicks: row.clicks,
    position: row.position.toFixed(1),
    businesses: count || 0
  })
}

const noBiz = results.filter((r) => r.businesses === 0)
console.log('Cities with impressions but NO businesses (' + noBiz.length + '):')
console.log('city\tstate\timp\tclicks\tpos')
for (const r of noBiz) {
  console.log(r.city + '\t' + r.state + '\t' + r.impressions + '\t' + r.clicks + '\t' + r.position)
}

console.log('\nCities WITH businesses (' + results.filter((r) => r.businesses > 0).length + '):')
for (const r of results.filter((r) => r.businesses > 0).slice(0, 10)) {
  console.log(r.city + '\t' + r.state + '\t' + r.impressions + '\t' + r.clicks + '\t' + r.position + '\tbiz=' + r.businesses)
}
