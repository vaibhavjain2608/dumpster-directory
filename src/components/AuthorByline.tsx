import { Calendar, Clock, Database } from 'lucide-react'

interface AuthorBylineProps {
  updatedDate: string   // e.g. "March 2026"
  readTimeMin?: number
  showMethodology?: boolean
}

export default function AuthorByline({ updatedDate, readTimeMin, showMethodology = false }: AuthorBylineProps) {
  return (
    <div className="my-6 space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-700 text-white text-xs font-bold">
            DL
          </div>
          <span>
            By <span className="font-medium text-gray-700">DumpsterListing Research Team</span>
          </span>
        </div>

        {/* Updated date */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>Updated {updatedDate}</span>
        </div>

        {/* Read time */}
        {readTimeMin && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{readTimeMin} min read</span>
          </div>
        )}
      </div>

      {/* Methodology note */}
      {showMethodology && (
        <div className="flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>
            Pricing data is collected from quotes across 500+ dumpster rental providers in 31,000+ US cities.
            Figures represent market ranges and are updated regularly.{' '}
            <a href="/about#methodology" className="underline underline-offset-2 hover:text-green-700">
              Learn about our methodology.
            </a>
          </span>
        </div>
      )}
    </div>
  )
}
