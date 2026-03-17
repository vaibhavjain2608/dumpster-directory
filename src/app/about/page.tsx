import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, BarChart2, MessageSquare, MapPin, Building2, Database, ShieldCheck, RefreshCw, Mail, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About DumpsterListing — America\'s Dumpster Rental Directory',
  description:
    'DumpsterListing is a free directory covering 31,000+ US cities. Learn how we research and verify dumpster rental companies and pricing data.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About DumpsterListing — America\'s Dumpster Rental Directory',
    description:
      'DumpsterListing is a free directory covering 31,000+ US cities. Learn how we research and verify dumpster rental companies and pricing data.',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About DumpsterListing',
  url: 'https://dumpsterlisting.com/about',
  description: 'DumpsterListing is the largest free directory of dumpster rental companies in the United States, covering 31,000+ cities.',
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://dumpsterlisting.com/#organization',
    name: 'DumpsterListing',
    url: 'https://dumpsterlisting.com',
    foundingDate: '2026',
    description: 'The largest free directory of dumpster rental companies in the United States.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@dumpsterlisting.com',
      contactType: 'customer support',
      availableLanguage: 'English',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: 5,
    },
  },
}

const STEPS = [
  {
    icon: Search,
    step: '1',
    title: 'Search Your City',
    description:
      'Enter your city or browse our directory of 31,000+ cities across the United States to find dumpster rental companies near you.',
  },
  {
    icon: BarChart2,
    step: '2',
    title: 'Compare Companies',
    description:
      'View business details, ratings, phone numbers, and websites for every local company — all in one place, no bouncing between tabs.',
  },
  {
    icon: MessageSquare,
    step: '3',
    title: 'Get Quotes',
    description:
      'Submit a quick lead form or call directly. Local companies compete for your business, so you get fair pricing fast.',
  },
]

const STATS = [
  { value: '31,000+', label: 'US Cities Covered' },
  { value: '500+', label: 'Verified Companies' },
  { value: '100%', label: 'Free for Renters' },
]

const METHODOLOGY_POINTS = [
  {
    icon: Database,
    title: 'Data Collection',
    description:
      'We compile business listings from public records, Google Business data, state contractor registries, and direct outreach to local haulers across all 50 states.',
  },
  {
    icon: ShieldCheck,
    title: 'Verification',
    description:
      'Each listing is cross-referenced for accuracy — we verify phone numbers are active, websites resolve correctly, and business addresses are valid before publishing.',
  },
  {
    icon: RefreshCw,
    title: 'Regular Updates',
    description:
      'Pricing data is refreshed monthly using quotes collected from providers in major US markets. Business listings are reviewed quarterly for accuracy.',
  },
]

const TRUST_SIGNALS = [
  'No paid placements — listings are ranked by relevance, not ad spend',
  'Pricing ranges are based on real quotes, not estimates',
  'We do not sell your contact information to third parties',
  'All data is collected from public sources and verified manually',
]

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-sm font-medium text-green-700 mb-5">
            <MapPin className="h-4 w-4" />
            About Us
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            The Dumpster Rental Directory<br className="hidden sm:block" /> Built for Real People
          </h1>
          <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-2xl">
            DumpsterListing helps homeowners and contractors find trusted local dumpster rental companies
            fast — without the runaround. We cover 31,000+ cities across all 50 states.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Stats */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm"
              >
                <div className="text-4xl font-extrabold text-green-700 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Finding a dumpster rental company used to mean hours of searching, calling numbers that don&apos;t
            work, and getting wildly inconsistent quotes. We wanted to fix that.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our mission is simple: make it easy for anyone — homeowners cleaning out a garage, contractors
            managing a job site, or property managers handling renovations — to find a reliable local dumpster
            rental company in minutes, not hours. The service is completely free for renters.
          </p>
        </section>

        {/* Data Methodology */}
        <section id="methodology">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">How We Research Our Data</h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            Our directory covers 31,000+ US cities. Here&apos;s how we collect, verify, and maintain the data
            you see on every page.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {METHODOLOGY_POINTS.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="rounded-lg bg-green-100 p-2 w-fit mb-4">
                    <Icon className="h-5 w-5 text-green-700" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{point.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{point.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Trust Signals */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Our Commitment to Accuracy</h2>
          <div className="rounded-xl border border-green-100 bg-green-50 p-6 space-y-3">
            {TRUST_SIGNALS.map((signal) => (
              <div key={signal} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{signal}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-green-100 p-2">
                      <Icon className="h-5 w-5 text-green-700" />
                    </div>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
                      Step {step.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Why We Built It */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Why We Built DumpsterListing</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We noticed that searching for &quot;dumpster rental near me&quot; returns a chaotic mix of ads, generic
            directories, and outdated listings. Local service discovery in the dumpster rental space was
            broken — and small, legitimate businesses were hard to find because they couldn&apos;t compete with
            large national chains on ad spend.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We set out to build a clean, focused, trustworthy directory specifically for this industry.
            One place where a homeowner in any city can quickly see their real options, compare companies,
            and reach out — and where local businesses get a fair shot at being discovered.
          </p>
        </section>

        {/* Team */}
        <section>
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">The Team</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              DumpsterListing is built by a small team of researchers and developers focused on making local
              service discovery easier. We believe finding a reliable local business should be simple,
              transparent, and fast — and we&apos;re committed to continuously improving the directory.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200 w-fit">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white font-bold text-lg">
                DL
              </div>
              <div>
                <p className="font-semibold text-gray-900">DumpsterListing Research Team</p>
                <p className="text-sm text-gray-500">Researching dumpster rental markets across the US</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Have a question, a correction, or want to list your business? We&apos;re happy to help.
          </p>
          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="h-5 w-5 text-green-600" />
            <a href="mailto:hello@dumpsterlisting.com" className="font-medium hover:text-green-700 transition-colors">
              hello@dumpsterlisting.com
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-green-700 px-8 py-12 text-center text-white shadow-lg">
          <h2 className="text-2xl font-extrabold mb-3">Ready to Find a Dumpster?</h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto">
            Browse our directory and get connected with local dumpster rental companies in your city today.
            It&apos;s completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/dumpster-rental"
              className="rounded-xl bg-white px-8 py-3.5 text-base font-bold text-green-700 hover:bg-green-50 transition shadow"
            >
              Find Your City
            </a>
            <a
              href="/list-your-business"
              className="inline-flex items-center gap-2 rounded-xl border border-green-400 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-600 transition"
            >
              <Building2 className="h-4 w-4" />
              List Your Business
            </a>
          </div>
        </section>

      </div>
    </>
  )
}
