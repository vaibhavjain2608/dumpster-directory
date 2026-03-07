import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env.local','utf8')
const get = k => env.match(new RegExp(`^${k}=(.*)`, 'm'))?.[1]
const db = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'))

// Find businesses with http:// photos
let offset = 0
let fixed = 0
const PAGE = 500

while (true) {
  const { data, error } = await db
    .from('businesses')
    .select('id, photos')
    .not('photos', 'eq', '{}')
    .range(offset, offset + PAGE - 1)
  
  if (error) { console.error(error); break }
  if (!data || data.length === 0) break

  for (const biz of data) {
    if (!biz.photos || biz.photos.length === 0) continue
    const hasHttp = biz.photos.some(p => p.startsWith('http://'))
    if (hasHttp) {
      const fixedPhotos = biz.photos.map(p => p.replace(/^http:\/\//, 'https://'))
      await db.from('businesses').update({ photos: fixedPhotos }).eq('id', biz.id)
      fixed++
    }
  }
  
  offset += PAGE
  if (data.length < PAGE) break
}

console.log(`Fixed ${fixed} businesses with http:// photos`)
