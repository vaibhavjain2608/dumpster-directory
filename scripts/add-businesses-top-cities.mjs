import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Parse .env.local for Supabase credentials
const envPath = resolve(process.cwd(), '.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('=').map((s) => s.trim()))
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Real businesses scraped from Google Maps on March 6, 2026
// Only non-sponsored listings with real reviews, 4.0+ rating
const BUSINESSES = [
  // ── Austin, TX ────────────────────────────────────────────────────────────
  { city: 'austin', state: 'texas', name: 'Grime Time Dumpster Rentals - Austin', phone: '(512) 387-5802', website: 'https://www.grimetime.com/service-areas/', address: '4812 N Interstate Hwy 35 Suite B', rating: 4.9, reviews: 480 },
  { city: 'austin', state: 'texas', name: 'Captain Hook Dumpster Rentals', phone: '(512) 719-4172', website: 'https://captainhookaustin.com/', address: '7300 Daffan Ln', rating: 4.9, reviews: 163 },
  { city: 'austin', state: 'texas', name: 'Bin There Dump That Dumpster Rental Austin', phone: '(512) 598-4770', website: 'https://www.bintheredumpthat.com/austin-dumpster-rentals/', address: '9906 FM812', rating: 5.0, reviews: 113 },

  // ── Philadelphia, PA ──────────────────────────────────────────────────────
  { city: 'philadelphia', state: 'pennsylvania', name: 'Tri-State Waste & Recycling, Inc.', phone: '(215) 423-5200', website: 'https://tswaste.com/', address: '8950 State Rd.', rating: 4.9, reviews: 177 },
  { city: 'philadelphia', state: 'pennsylvania', name: 'Bin There Dump That Northeast Philadelphia', phone: '(215) 917-2422', website: 'https://www.bintheredumpthat.com/bucks-county-dumpster-rentals/service-areas/northeast-philadelphia/', address: null, rating: 5.0, reviews: 48 },
  { city: 'philadelphia', state: 'pennsylvania', name: 'Philly Dumpster Rentals Trash Removal & Recycling', phone: '(856) 693-4166', website: 'https://phillydumpsterrental.net/', address: '3268 S 61st St', rating: 4.7, reviews: 43 },

  // ── Jacksonville, FL ──────────────────────────────────────────────────────
  { city: 'jacksonville', state: 'florida', name: 'Bin There Dump That Jacksonville', phone: '(904) 500-2838', website: 'https://www.bintheredumpthat.com/jacksonville-dumpster-rentals/', address: '121 E 8th St Suite 11', rating: 4.9, reviews: 424 },
  { city: 'jacksonville', state: 'florida', name: 'Dumpster Dudez', phone: '(904) 867-0809', website: 'https://dumpsterdudez.com/jacksonville', address: '1010 E Adams St Suite 116', rating: 5.0, reviews: 192 },
  { city: 'jacksonville', state: 'florida', name: 'VaVia Dumpster Rental Jacksonville', phone: '(904) 594-1110', website: 'https://govavia.com/jacksonville-fl-dumpster-rental/', address: '3701 Faye Road', rating: 5.0, reviews: 86 },

  // ── San Antonio, TX ───────────────────────────────────────────────────────
  { city: 'san-antonio', state: 'texas', name: 'Bin There Dump That San Antonio', phone: '(210) 441-2121', website: 'https://www.satxdumpsterrental.com/', address: '838 Sprucewood Ln', rating: 4.8, reviews: 429 },
  { city: 'san-antonio', state: 'texas', name: 'I Need Dumpster', phone: '(210) 904-0404', website: 'https://ineeddumpster.com/', address: '4267 Stahl Rd', rating: 4.9, reviews: 393 },
  { city: 'san-antonio', state: 'texas', name: 'Diamond Dumpster Rentals & Hauling', phone: '(726) 246-0417', website: 'https://diamonddumpsterrentals.blogspot.com/', address: '1753 Grandstand Dr', rating: 4.4, reviews: 156 },

  // ── Detroit, MI ───────────────────────────────────────────────────────────
  { city: 'detroit', state: 'michigan', name: 'Dumpster 4 Less', phone: '(313) 778-6857', website: 'http://dumpster4less.com/', address: null, rating: 4.8, reviews: 808 },
  { city: 'detroit', state: 'michigan', name: 'Detroit Junk Busters - Dumpster Rental', phone: '(313) 505-6611', website: 'https://dumpsterrentals-detroit.com/', address: '15735 Schaefer Hwy', rating: 4.9, reviews: 524 },
  { city: 'detroit', state: 'michigan', name: 'Clean Cut Dumpster Rental LLC', phone: '(313) 933-3288', website: 'http://www.cleancutdumpster.com/', address: '12775 Plymouth Rd #4', rating: 4.9, reviews: 216 },

  // ── San Diego, CA ─────────────────────────────────────────────────────────
  { city: 'san-diego', state: 'california', name: 'JunkMD', phone: '(858) 869-9448', website: 'https://junkmd.com/', address: '4901 Morena Blvd #105', rating: 5.0, reviews: 1363 },
  { city: 'san-diego', state: 'california', name: 'Debris Box', phone: '(619) 209-8726', website: 'https://www.debrisboxonline.com/', address: '10981 San Diego Mission Rd #245', rating: 4.8, reviews: 131 },
  { city: 'san-diego', state: 'california', name: "Haul'n Off Dumpster Rentals", phone: '(619) 720-4511', website: 'https://www.haulnoff.com/san-diego-dumpster-rentals', address: '3468 Citrus St Suite A', rating: 5.0, reviews: 120 },

  // ── Fort Lauderdale, FL ───────────────────────────────────────────────────
  { city: 'fort-lauderdale', state: 'florida', name: '98 Junk Removal & Dumpster Rentals Fort Lauderdale', phone: '(954) 740-8338', website: 'https://98junkremoval.com/', address: '2018 NE 17th Ct', rating: 4.9, reviews: 169 },
  { city: 'fort-lauderdale', state: 'florida', name: 'Bin There Dump That Southeast Florida', phone: '(954) 908-6902', website: 'https://www.bintheredumpthat.com/southeast-florida-dumpster-rentals/', address: '2945 W Cypress Creek Rd', rating: 4.9, reviews: 136 },
  { city: 'fort-lauderdale', state: 'florida', name: 'Priority Dumpsters', phone: '(888) 930-3867', website: 'https://www.prioritydumpsters.com/', address: '826 NW 8th Ave', rating: 4.4, reviews: 81 },

  // ── San Francisco, CA ─────────────────────────────────────────────────────
  { city: 'san-francisco', state: 'california', name: 'Junk King San Francisco', phone: '(415) 852-3303', website: 'https://www.junk-king.com/locations/sanfrancisco', address: '1615 Polk St Unit 6', rating: 4.9, reviews: 1150 },
  { city: 'san-francisco', state: 'california', name: 'City Dumpsters', phone: '(650) 271-6181', website: 'https://citydumpsters.com/', address: '100 El Campo Dr', rating: 5.0, reviews: 12 },
  { city: 'san-francisco', state: 'california', name: 'Same Day Dumpster Rental San Francisco', phone: '(415) 324-6939', website: 'http://www.samedaydumpsterrentalsanfrancisco.com/', address: '1005 Market St', rating: 5.0, reviews: 6 },
]

async function main() {
  let inserted = 0
  let skipped = 0

  for (const biz of BUSINESSES) {
    // Look up city_id
    const { data: city, error: cityErr } = await supabase
      .from('cities')
      .select('id')
      .eq('city_slug', biz.city)
      .eq('state_slug', biz.state)
      .single()

    if (cityErr || !city) {
      console.error(`City not found: ${biz.city}, ${biz.state}`)
      continue
    }

    const slug = slugify(biz.name)

    // Check if already exists
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('city_id', city.id)
      .eq('slug', slug)
      .single()

    if (existing) {
      console.log(`  SKIP (exists): ${biz.name} in ${biz.city}`)
      skipped++
      continue
    }

    const { error: insertErr } = await supabase.from('businesses').insert({
      city_id: city.id,
      name: biz.name,
      slug,
      phone: biz.phone,
      website: biz.website,
      address: biz.address,
      rating: biz.rating,
      review_count: biz.reviews,
      tier: 'free',
      is_active: true,
      service_area_miles: 25,
    })

    if (insertErr) {
      console.error(`  ERROR inserting ${biz.name}: ${insertErr.message}`)
    } else {
      console.log(`  OK: ${biz.name} → ${biz.city}, ${biz.state} (${biz.rating}★, ${biz.reviews} reviews)`)
      inserted++
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`)
}

main().catch(console.error)
