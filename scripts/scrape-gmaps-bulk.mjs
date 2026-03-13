import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
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

function titleCase(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Cities with 10+ GSC impressions and 0 businesses (from find-impression-cities-no-biz.mjs)
const CITIES = [
  { city: 'loxley', state: 'alabama', imp: 244 },
  { city: 'elberta', state: 'alabama', imp: 151 },
  { city: 'fairhope', state: 'alabama', imp: 107 },
  { city: 'orange-beach', state: 'alabama', imp: 106 },
  { city: 'lonoke', state: 'arkansas', imp: 88 },
  { city: 'wabbaseka', state: 'arkansas', imp: 84 },
  { city: 'robertsdale', state: 'alabama', imp: 82 },
  { city: 'magnolia-springs', state: 'alabama', imp: 75 },
  { city: 'holly-grove', state: 'arkansas', imp: 69 },
  { city: 'foley', state: 'alabama', imp: 67 },
  { city: 'scott', state: 'arkansas', imp: 67 },
  { city: 'bradford', state: 'arkansas', imp: 64 },
  { city: 'foothill-farms', state: 'california', imp: 62 },
  { city: 'spanish-fort', state: 'alabama', imp: 60 },
  { city: 'coy', state: 'arkansas', imp: 54 },
  { city: 'marvell', state: 'arkansas', imp: 53 },
  { city: 'daphne', state: 'alabama', imp: 51 },
  { city: 'humphrey', state: 'arkansas', imp: 50 },
  { city: 'vilonia', state: 'arkansas', imp: 48 },
  { city: 'beebe', state: 'arkansas', imp: 44 },
  { city: 'mayflower', state: 'arkansas', imp: 42 },
  { city: 'bryant', state: 'arkansas', imp: 28 },
  { city: 'england', state: 'arkansas', imp: 28 },
  { city: 'camp-verde', state: 'arizona', imp: 27 },
  { city: 'chelsea', state: 'alabama', imp: 26 },
  { city: 'carlisle', state: 'arkansas', imp: 24 },
  { city: 'sherwood', state: 'arkansas', imp: 24 },
  { city: 'gulf-shores', state: 'alabama', imp: 21 },
  { city: 'theodore', state: 'alabama', imp: 21 },
  { city: 'alpine', state: 'california', imp: 21 },
  { city: 'austin', state: 'arkansas', imp: 20 },
  { city: 'los-gatos', state: 'california', imp: 20 },
  { city: 'hoover', state: 'alabama', imp: 19 },
  { city: 'silverhill', state: 'alabama', imp: 17 },
  { city: 'hot-springs', state: 'arkansas', imp: 16 },
  { city: 'center-point', state: 'alabama', imp: 15 },
  { city: 'clanton', state: 'alabama', imp: 15 },
  { city: 'vestavia-hills', state: 'alabama', imp: 15 },
  { city: 'dothan', state: 'alabama', imp: 14 },
  { city: 'sierra-vista', state: 'arizona', imp: 14 },
  { city: 'benton', state: 'arkansas', imp: 14 },
  { city: 'casa-grande', state: 'arizona', imp: 13 },
  { city: 'el-mirage', state: 'arizona', imp: 13 },
  { city: 'dublin', state: 'california', imp: 13 },
  { city: 'milpitas', state: 'california', imp: 12 },
  { city: 'maricopa', state: 'arizona', imp: 12 },
  { city: 'el-centro', state: 'california', imp: 12 },
  { city: 'cadiz', state: 'kentucky', imp: 11 },
  { city: 'de-queen', state: 'arkansas', imp: 11 },
  { city: 'exeter', state: 'california', imp: 11 },
  { city: 'alexander-city', state: 'alabama', imp: 10 },
  { city: 'bay-minette', state: 'alabama', imp: 10 },
  { city: 'pine-level', state: 'alabama', imp: 10 },
  { city: 'ajo', state: 'arizona', imp: 10 },
  { city: 'adelanto', state: 'california', imp: 10 },
  { city: 'capitola', state: 'california', imp: 10 },
]

async function scrapeCity(page, cityName, stateName) {
  const query = `dumpster rental in ${cityName} ${stateName}`
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    // Wait for results feed to appear
    await page.waitForSelector('article', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2000)

    // Extract business data from the results feed
    const businesses = await page.evaluate(() => {
      const results = []
      const articles = document.querySelectorAll('article')
      for (const article of articles) {
        // Skip sponsored
        const sponsored = article.querySelector('[class*="Sponsored"]') ||
          article.textContent.includes('Sponsored')
        if (article.querySelector('h1') && article.querySelector('h1').textContent.trim() === 'Sponsored') continue

        const nameEl = article.querySelector('a')
        if (!nameEl) continue
        const name = nameEl.getAttribute('aria-label') || nameEl.textContent.trim()

        // Get star rating and review count from img alt text
        const ratingImg = article.querySelector('img[alt*="stars"]')
        let rating = null, reviewCount = 0
        if (ratingImg) {
          const alt = ratingImg.getAttribute('alt') || ''
          const ratingMatch = alt.match(/([\d.]+)\s*stars?\s*([\d,]+)\s*Reviews?/i)
          if (ratingMatch) {
            rating = parseFloat(ratingMatch[1])
            reviewCount = parseInt(ratingMatch[2].replace(/,/g, ''))
          }
        }

        // Get phone and address from text
        const textContent = article.textContent
        const phoneMatch = textContent.match(/(\+?1?\s*)?(\(\d{3}\)\s*\d{3}[-.]?\d{4}|\d{3}[-.]?\d{3}[-.]?\d{4})/)
        const phone = phoneMatch ? phoneMatch[0].trim() : null

        // Get address - look for text after service type
        const spans = article.querySelectorAll('span, div')
        let address = null
        for (const span of spans) {
          const text = span.textContent.trim()
          if (text.startsWith('·') && /\d/.test(text) && !text.includes('star') && !text.includes('Opens') && !text.includes('Closes') && !text.includes('Open') && text.length < 80) {
            address = text.replace(/^·\s*/, '').trim()
            break
          }
        }

        // Get website
        const websiteLink = article.querySelector('a[href*="http"]:not([href*="google.com"]):not([href*="/aclk"])')
        let website = null
        if (websiteLink) {
          const href = websiteLink.getAttribute('href')
          if (href && !href.includes('google.com') && !href.includes('/aclk')) {
            website = href
          }
        }

        if (name && rating && rating >= 4.0) {
          results.push({ name, rating, reviewCount, phone, address, website })
        }
      }
      return results
    })

    return businesses.slice(0, 3) // Top 3
  } catch (err) {
    console.error(`  Error scraping ${cityName}, ${stateName}: ${err.message}`)
    return []
  }
}

async function main() {
  console.log(`Scraping ${CITIES.length} cities from Google Maps...\n`)

  const context = await chromium.launchPersistentContext('/tmp/chrome-gmaps-scraper', {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  })
  const page = await context.newPage()

  const allBusinesses = []
  let totalInserted = 0
  let totalSkipped = 0
  let citiesWithResults = 0

  for (let i = 0; i < CITIES.length; i++) {
    const { city, state, imp } = CITIES[i]
    const cityName = titleCase(city)
    const stateName = titleCase(state)
    process.stdout.write(`[${i + 1}/${CITIES.length}] ${cityName}, ${stateName} (${imp} imp)... `)

    const businesses = await scrapeCity(page, cityName, stateName)
    if (businesses.length === 0) {
      console.log('no results')
      continue
    }

    citiesWithResults++
    console.log(`found ${businesses.length} businesses`)

    // Look up city_id
    const { data: cityData } = await supabase
      .from('cities').select('id').eq('city_slug', city).eq('state_slug', state).single()

    if (!cityData) {
      console.log(`  City not in DB: ${city}, ${state}`)
      continue
    }

    for (const biz of businesses) {
      const slug = slugify(biz.name)

      // Check if exists
      const { data: existing } = await supabase
        .from('businesses').select('id')
        .eq('city_id', cityData.id).eq('slug', slug).single()

      if (existing) {
        totalSkipped++
        continue
      }

      const { error } = await supabase.from('businesses').insert({
        city_id: cityData.id,
        name: biz.name,
        slug,
        phone: biz.phone,
        website: biz.website,
        address: biz.address,
        rating: biz.rating,
        review_count: biz.reviewCount,
        tier: 'free',
        is_active: true,
        service_area_miles: 25,
      })

      if (error) {
        console.log(`  ERROR: ${biz.name} - ${error.message}`)
      } else {
        totalInserted++
        allBusinesses.push({ city, state, ...biz })
      }
    }

    // Small delay to avoid rate limiting
    await page.waitForTimeout(1500)
  }

  await context.close()

  console.log(`\n=== DONE ===`)
  console.log(`Cities scraped: ${CITIES.length}`)
  console.log(`Cities with results: ${citiesWithResults}`)
  console.log(`Businesses inserted: ${totalInserted}`)
  console.log(`Businesses skipped (existing): ${totalSkipped}`)

  // Save results to JSON for reference
  writeFileSync(
    resolve(process.cwd(), 'scripts/scraped-businesses.json'),
    JSON.stringify(allBusinesses, null, 2)
  )
  console.log('Results saved to scripts/scraped-businesses.json')
}

main().catch(console.error)
