import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env.local','utf8')
const get = k => env.match(new RegExp(`^${k}=(.*)`, 'm'))?.[1]
const db = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'))

// Find all businesses with -2 suffix slugs
const { data: dupes, error } = await db
  .from('businesses')
  .select('id, slug, name, city_id')
  .like('slug', '%-2')
  .order('id')

if (error) { console.error(error); process.exit(1) }

console.log(`Found ${dupes.length} businesses with -2 suffix`)

// For each -2, check if the non-2 version exists
let deleted = 0
for (const dupe of dupes) {
  const baseSlug = dupe.slug.replace(/-2$/, '')
  const { data: original } = await db
    .from('businesses')
    .select('id, slug')
    .eq('city_id', dupe.city_id)
    .eq('slug', baseSlug)
    .single()
  
  if (original) {
    // Duplicate confirmed — delete the -2 version
    const { error: delErr } = await db.from('businesses').delete().eq('id', dupe.id)
    if (!delErr) {
      deleted++
      console.log(`  Deleted: ${dupe.name} (${dupe.slug}) — original exists: ${original.slug}`)
    }
  } else {
    // The -2 is the only version, rename it
    const { error: renameErr } = await db.from('businesses').update({ slug: baseSlug }).eq('id', dupe.id)
    if (!renameErr) {
      console.log(`  Renamed: ${dupe.slug} → ${baseSlug}`)
    }
  }
}

console.log(`\nTotal deleted: ${deleted}`)
