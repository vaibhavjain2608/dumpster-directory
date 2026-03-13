// Parse Google Maps snapshots saved as markdown files and extract business data
// Usage: node scripts/parse-gmaps-snapshots.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('=').map((s) => s.trim()))
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Read all snapshot files
const snapshotDir = '/tmp/gmaps-snapshots'
const files = readdirSync(snapshotDir).filter((f) => f.endsWith('.md'))

let totalInserted = 0
let totalSkipped = 0
let totalCities = 0

for (const file of files) {
  const content = readFileSync(resolve(snapshotDir, file), 'utf8')

  // Extract city/state from filename: city--state.md
  const match = file.replace('.md', '').match(/^(.+)--(.+)$/)
  if (!match) continue
  const [, citySlug, stateSlug] = match

  // Look up city_id
  const { data: city } = await supabase
    .from('cities').select('id').eq('city_slug', citySlug).eq('state_slug', stateSlug).single()
  if (!city) {
    console.log(`City not in DB: ${citySlug}, ${stateSlug}`)
    continue
  }

  totalCities++

  // Parse articles from snapshot markdown
  // Each business appears as: article "Business Name" [ref=...]
  const articlePattern = /article "([^"]+)"/g
  const articles = []
  let m
  while ((m = articlePattern.exec(content)) !== null) {
    articles.push({ name: m[1], startIndex: m.index })
  }

  let cityInserted = 0
  for (let i = 0; i < articles.length && cityInserted < 3; i++) {
    const art = articles[i]
    const endIndex = i + 1 < articles.length ? articles[i + 1].startIndex : content.length
    const section = content.slice(art.startIndex, endIndex)

    // Skip sponsored
    if (section.includes('heading "Sponsored"')) continue

    // Extract rating and reviews
    const ratingMatch = section.match(/img "(\d+\.\d+) stars? (\d[\d,]*) Reviews?"/)
    if (!ratingMatch) continue
    const rating = parseFloat(ratingMatch[1])
    const reviews = parseInt(ratingMatch[2].replace(/,/g, ''))
    if (rating < 4.0) continue

    // Extract phone
    const phoneMatch = section.match(/(\(\d{3}\)\s*\d{3}[-]?\d{4}|\+1\s*\d{3}[-]\d{3}[-]\d{4})/)
    const phone = phoneMatch ? phoneMatch[1] : null

    // Extract address (after "· " before a line with Opens/Closes/Open)
    const addrMatch = section.match(/generic: · (.+?)$/m)
    let address = addrMatch ? addrMatch[1].trim() : null
    // Filter out non-address matches
    if (address && (address.includes('Open') || address.includes('Close') || address.includes('star'))) {
      address = null
    }

    // Extract website URL
    const websiteMatch = section.match(/\/url: (https?:\/\/(?!www\.google\.com)[^\s]+)/)
    let website = websiteMatch ? websiteMatch[1] : null
    // Skip ad click URLs
    if (website && website.includes('/aclk')) website = null

    const slug = slugify(art.name)

    // Check if exists
    const { data: existing } = await supabase
      .from('businesses').select('id')
      .eq('city_id', city.id).eq('slug', slug).single()

    if (existing) {
      totalSkipped++
      continue
    }

    const { error } = await supabase.from('businesses').insert({
      city_id: city.id,
      name: art.name,
      slug,
      phone,
      website,
      address,
      rating,
      review_count: reviews,
      tier: 'free',
      is_active: true,
      service_area_miles: 25,
    })

    if (error) {
      console.log(`  ERROR ${art.name}: ${error.message}`)
    } else {
      cityInserted++
      totalInserted++
      console.log(`  OK: ${art.name} → ${citySlug}, ${stateSlug} (${rating}★, ${reviews} reviews)`)
    }
  }
}

console.log(`\n=== DONE ===`)
console.log(`Cities processed: ${totalCities}`)
console.log(`Businesses inserted: ${totalInserted}`)
console.log(`Businesses skipped: ${totalSkipped}`)
