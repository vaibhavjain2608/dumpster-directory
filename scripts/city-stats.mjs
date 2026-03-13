import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env.local','utf8')
const get = k => env.match(new RegExp(`^${k}=(.*)`, 'm'))?.[1]
const db = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'))
const [t, w, b] = await Promise.all([
  db.from('cities').select('id', { count: 'exact', head: true }),
  db.from('cities').select('id', { count: 'exact', head: true }).not('intro', 'is', null).neq('intro', ''),
  db.from('businesses').select('id', { count: 'exact', head: true }).eq('is_active', true),
])
console.log('Total cities:', t.count)
console.log('With intro:', w.count)
console.log('Without intro:', t.count - w.count)
console.log('Active businesses:', b.count)
