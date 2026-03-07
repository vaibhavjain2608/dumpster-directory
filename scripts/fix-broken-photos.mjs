#!/usr/bin/env node
// Remove broken external image URLs from businesses in Supabase
// Usage: node scripts/fix-broken-photos.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Parse .env.local manually
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

// Broken image URLs from SEMrush audit
const BROKEN_URLS = [
  'http://containerrentalchamp.com/images/generated/hero-homeowner-cro.jpg',
  'http://hagalwastemanagement.com/images/741-7953-664-Small Dumpsters.jpg',
  'http://hagalwastemanagement.com/images/741-7953-674-Orange Dumpsters for Rental.jpg',
  'http://lrdumpsters.digidev.solutions/wp-content/themes/Avada/assets/images/logo.png',
  'http://www.arentabin.com/uploads/1/2/0/8/120851565/published/rolloff2_4.png',
  'http://www.arentabin.com/uploads/1/2/0/8/120851565/published/rolloff3_4.png',
  'http://www.kongsjunkremoval.com/assets/img/slider-img-1.jpg',
  'http://www.kongsjunkremoval.com/assets/img/slider-img-2.jpg',
  'http://www.kongsjunkremoval.com/assets/img/slider-img-3.jpg',
  'http://www.smartbinsduluth.com/custom/images/slider1.jpg',
  'https://abcdisposalsystems.com/wp-content/uploads/2023/04/ABC-Disposal-Logo-web.png',
  'https://alliancedumpsterrentals.com/home/wp-content/themes/Avada/assets/images/logo.png',
  'https://austin-dumpsters.com/wp-content/uploads/2024/08/canali_const_transp_w.png',
  'https://bigdumpsterco.com/wp-content/uploads/2023/04/call.png',
  'https://bigdumpsterco.com/wp-content/uploads/2023/04/house-1.png',
  'https://buildforceatx.com/wp-content/uploads/2026/02/buildforce-atx-dumpster-delivery-truck-austin-tx-residential-driveway_blue-overlay_optimized.webp',
  'https://buildforceatx.com/wp-content/uploads/2026/02/buildforce-atx-dumpster-delivery-truck-austin-tx-residential-driveway_mobile_blue-overlay_optimized_2.webp',
  'https://buildforceatx.com/wp-content/uploads/2026/02/buildforce-austin-dumpster-in-driveway-residential_optimized_@.webp',
  'https://cdn-bphhm.nitrocdn.com/vqmJyoRCSLhUJvZHlBbGjvGTRgAaJzMU/assets/images/optimized/rev-0304fd7/heartlandrecyclingservices.com/wp-content/uploads/2024/12/6-Yard-Dumpster-in-Wichita-KS-353x228.webp',
  'https://cdn-ecenf.nitrocdn.com/gmuIpbPuHNnQKjjDFKwySSRLkHXazSJf/assets/images/optimized/rev-a22ff8f/trashdaddydumpsters.com/wp-content/uploads/2020/11/trash-daddy-1.png',
  'https://cdn-ecenf.nitrocdn.com/gmuIpbPuHNnQKjjDFKwySSRLkHXazSJf/assets/images/optimized/rev-a22ff8f/trashdaddydumpsters.com/wp-content/uploads/2024/11/40-yard-dumpster-in-the-street.jpg',
  'https://cdn-ecenf.nitrocdn.com/gmuIpbPuHNnQKjjDFKwySSRLkHXazSJf/assets/images/optimized/rev-a22ff8f/trashdaddydumpsters.com/wp-content/uploads/2024/12/20-yard-dumpster.jpg',
  'https://cdn-ecenf.nitrocdn.com/gmuIpbPuHNnQKjjDFKwySSRLkHXazSJf/assets/images/optimized/rev-a22ff8f/trashdaddydumpsters.com/wp-content/uploads/2024/12/30-yard-dumpster-rental-on-street.jpg',
  'https://cdn-ecenf.nitrocdn.com/gmuIpbPuHNnQKjjDFKwySSRLkHXazSJf/assets/images/optimized/rev-a22ff8f/trashdaddydumpsters.com/wp-content/uploads/2025/01/20-yard-roll-off-dumpster-in-driveway.jpg',
  'https://cdn-ecenf.nitrocdn.com/gmuIpbPuHNnQKjjDFKwySSRLkHXazSJf/assets/images/optimized/rev-a22ff8f/trashdaddydumpsters.com/wp-content/uploads/2025/05/black-20-yard-dumpster-in-a-driveway.jpg',
  'https://cdn-ecenf.nitrocdn.com/gmuIpbPuHNnQKjjDFKwySSRLkHXazSJf/assets/images/optimized/rev-a22ff8f/trashdaddydumpsters.com/wp-content/uploads/2025/09/brown-30-yard-dumpster-in-driveway-trash-daddy.jpg',
  'https://cdn-ecenf.nitrocdn.com/gmuIpbPuHNnQKjjDFKwySSRLkHXazSJf/assets/images/optimized/rev-a22ff8f/trashdaddydumpsters.com/wp-content/uploads/2025/10/brown-30-yard-dumpster-delivered-in-a-driveway.jpg',
  'https://cdn-ecenf.nitrocdn.com/gmuIpbPuHNnQKjjDFKwySSRLkHXazSJf/assets/images/optimized/rev-a22ff8f/trashdaddydumpsters.com/wp-content/uploads/2026/01/red-30-yard-roll-off-in-residential-driveway.jpg',
  'https://cdn-ilehjgn.nitrocdn.com/MWhFhJOMcBAJXGFmUtINWRiUAbHuBKpa/assets/images/optimized/rev-97f18ac/adr2021.wpengine.com/wp-content/uploads/2021/02/ADR-B-3.png',
  'https://cdn-ilehjgn.nitrocdn.com/MWhFhJOMcBAJXGFmUtINWRiUAbHuBKpa/assets/images/optimized/rev-97f18ac/adr2021.wpengine.com/wp-content/uploads/2021/02/dumpster-services-2f2b6c46-320w.png',
  'https://cdn-ilehjgn.nitrocdn.com/MWhFhJOMcBAJXGFmUtINWRiUAbHuBKpa/assets/images/optimized/rev-97f18ac/affordabledumpsterrental.com/wp-content/uploads/2021/02/Untitleddesign4-480w-300x222.png',
  'https://cdn-ilehjgn.nitrocdn.com/MWhFhJOMcBAJXGFmUtINWRiUAbHuBKpa/assets/images/optimized/rev-97f18ac/affordabledumpsterrental.com/wp-content/uploads/2023/03/GEfampic.png',
  'https://cdn-ilehjgn.nitrocdn.com/MWhFhJOMcBAJXGFmUtINWRiUAbHuBKpa/assets/images/optimized/rev-97f18ac/affordabledumpsterrental.com/wp-content/uploads/2025/06/10-off-callout-bar.png',
  'https://cdsmich.com/img/site/img/CDS_smLogo.png',
  'https://cloud-1de12d.becdn.net/media/iW=367&iH=275&oX=4&oY=0&cW=359&cH=275/34b5c4ed55b2a8d1e28b5d86889c0b02/IMG_1773.jpg',
  'https://defensedisposal.com/wp-content/plugins/wordpress-social-login/assets/img/32x32/wpzoom//facebook.png',
  'https://defensedisposal.com/wp-content/plugins/wordpress-social-login/assets/img/32x32/wpzoom//google.png',
  'https://defensedisposal.com/wp-content/plugins/wordpress-social-login/assets/img/32x32/wpzoom//twitter.png',
  'https://dumpdynastyrentals.com/assets/dump-dynasty-social.jpg',
  'https://dumpsterservicespc.com/wp-content/uploads/2019/07/dump-size-1-website-grant-.jpg',
  'https://expertroofingclaims.com/wp-content/uploads/2019/02/Slider-3.png',
  'https://ffssekatqtqsdfacjiks.supabase.co/storage/v1/object/public/site-assets/cws-og-image.png',
  'https://files.sysers.com/cp/upload/bdconcrete/editor//full/opengraphimage156.png',
  'https://files.sysers.com/cp/upload/deltarolloffdumpsters/editor//full/og_img_logo_titanTEMP.png',
  'https://files.sysers.com/cp/upload/dumpsterondemand/editor/full/dod-open-graph.png',
  'https://gojunkfree.com/wp-content/uploads/2014/03/gojunkfree.png',
  'https://jldumpstersmemphistn.com/wp-content/uploads/2025/09/Header-1.jpg',
  'https://langstondumpsterrental.com/wp-content/uploads/2025/02/10-Yard-2.jpg',
  'https://langstondumpsterrental.com/wp-content/uploads/2025/02/15-yard.jpg',
  'https://langstondumpsterrental.com/wp-content/uploads/2025/02/8898772385498346603-1024x768.jpg',
  'https://le-cdn.hibuwebsites.com/9ebac414c3fd4a2d97c5c3c943e70419/dms3rep/multi/opt/debris-box-hero-home-1920w.jpg',
  'https://le-cdn.hibuwebsites.com/ebad3414de6d4de9a4b8eaa622453016/dms3rep/multi/opt/Truck+with+dumpster+stretched+out-1920w.jpeg',
  'https://lirp.cdn-website.com/2fc4315b/dms3rep/multi/opt/K-K+Dumpster+Rentals-1920w.png',
  'https://lirp.cdn-website.com/6cf80ac3/dms3rep/multi/opt/Area+661+Hauling+Bakersfield+Lofgo-1920w.png',
  'https://lirp.cdn-website.com/fcc83a04/dms3rep/multi/opt/563a9c7-1920w.png',
  'https://lirp.cdn-website.com/fe20b6bd/dms3rep/multi/opt/Carmel+1200x630-1920w.png',
  'https://localjunkers.com/assets/Local-Junkers-Dark.png',
  'https://oaksdumpster.com/wp-content/uploads/2025/07/oaks_dumpsters.jpg',
  'https://spokanejunk.com/2000.',
  'https://storage.ie6countdown.com/assets/100/images/banners/warning_bar_0000_us.jpg',
  'https://tricountydisposalpa.com/wp-content/uploads/2023/03/cropped-dr_concrete_logo_updated-2.png',
  'https://triple3cjunk.com/wp-content/uploads/2021/09/American-Sales-Service-Inc.png',
  'https://westcoastwasteremovalanddumpsterrentals.com/wp-content/uploads/2025/04/qtq_30-1.webp',
  'https://westcoastwasteremovalanddumpsterrentals.com/wp-content/uploads/2025/04/qtq_30.webp',
  'https://westcoastwasteremovalanddumpsterrentals.com/wp-content/uploads/2025/04/rsw_1240h_620cg_true-1.webp',
  'https://westcoastwasteremovalanddumpsterrentals.com/wp-content/uploads/2025/04/rsw_600h_300cg_true.webp',
  'https://westcoastwasteremovalanddumpsterrentals.com/wp-content/uploads/2025/04/unnamed-1.png',
  'https://westcoastwasteremovalanddumpsterrentals.com/wp-content/uploads/2025/04/unnamed.png',
  'https://wp.okcdumpsterrental.com/wp-content/uploads/2022/11/Arrow.png',
  'https://www.bestwaycarting.com/wp/wp-content/uploads/2016/08/payment_button.png',
  'https://www.canyonviewdumpsters.com/nitropack_static/ewTanKdwNlsxmPyGqgmOwWwUYkXLnnPk/assets/images/optimized/rev-4979860/www.canyonviewdumpsters.com/wp-content/uploads/2022/05/3-Dumpsters-8.png',
  'https://www.canyonviewdumpsters.com/nitropack_static/ewTanKdwNlsxmPyGqgmOwWwUYkXLnnPk/assets/images/optimized/rev-4979860/www.canyonviewdumpsters.com/wp-content/uploads/2022/06/dumpster-rental-porta-potty-rental-utah-scaled.jpg',
  'https://www.sourgum.comimages/sourgum-dumpster-rental-meta-preview.png',
  'https://www.tjzebradumpsterssj.com/images/homepage/dumpster-rental.webp',
  'https://www.tjzebradumpsterssj.com/images/homepage/Toilet-rental.webp',
]

const brokenSet = new Set(BROKEN_URLS)

async function main() {
  let fixed = 0
  let page = 0
  const PAGE_SIZE = 1000

  while (true) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, photos')
      .not('photos', 'is', null)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) { console.error(error); break }
    if (!data || data.length === 0) break

    for (const biz of data) {
      if (!Array.isArray(biz.photos) || biz.photos.length === 0) continue

      const cleaned = biz.photos.filter(url => !brokenSet.has(url))
      if (cleaned.length < biz.photos.length) {
        const removed = biz.photos.length - cleaned.length
        const { error: upErr } = await supabase
          .from('businesses')
          .update({ photos: cleaned.length > 0 ? cleaned : null })
          .eq('id', biz.id)

        if (upErr) {
          console.error(`Error updating ${biz.id}:`, upErr.message)
        } else {
          console.log(`Fixed business ${biz.id}: removed ${removed} broken photo(s)`)
          fixed++
        }
      }
    }

    if (data.length < PAGE_SIZE) break
    page++
  }

  console.log(`\nDone. Fixed ${fixed} businesses.`)
}

main()
