import Image from 'next/image'
import { siteConfig } from '@/config/site'
import { useState, useEffect } from 'react'

// Convert 12h time to 24h format (e.g., "7:00 PM" -> "19:00")
function to24Hour(time12h) {
  const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null

  let hours = parseInt(match[1])
  const minutes = match[2]
  const isPM = match[3].toUpperCase() === 'PM'

  if (isPM && hours !== 12) hours += 12
  if (!isPM && hours === 12) hours = 0

  return `${String(hours).padStart(2, '0')}:${minutes}`
}

// Generate Google Calendar URL for a show
function generateCalendarUrl(show) {
  if (!show.calendarDate || !show.time) return null

  const time24 = to24Hour(show.time)
  if (!time24) return null

  // Format for Google Calendar
  const date = show.calendarDate.replace(/-/g, '')
  const time = time24.replace(':', '') + '00'

  // End time: 2 hours after start
  const [h, m] = time24.split(':').map(Number)
  const endTime = `${String(h + 2).padStart(2, '0')}${String(m).padStart(2, '0')}00`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: show.name,
    dates: `${date}T${time}/${date}T${endTime}`,
    details: show.description,
    location: `${show.venue}, ${show.location}`,
    ctz: 'America/New_York'
  })

  return `https://www.google.com/calendar/render?${params.toString()}`
}

export default function ShowCard({ show }) {
  const [expanded, setExpanded] = useState(false)

  // Initialize Eventbrite widget once on component mount
  useEffect(() => {
    if (show.isShowcase && siteConfig.showcaseTicketsAvailable && !show.soldOut && show.eventId && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      // Wait for EBWidgets to be available
      const initWidget = () => {
        if (window.EBWidgets) {
          try {
            window.EBWidgets.createWidget({
              widgetType: 'checkout',
              eventId: show.eventId,
              modal: true,
              modalTriggerElementId: `eb-showcard-${show.id}`,
              onOrderComplete: function() {
                if (typeof window !== 'undefined' && window.fbq) {
                  window.fbq('track', 'Purchase')
                  // Also track as conversion event for unified tracking with mailing list signups
                  window.fbq('track', 'CompleteRegistration', {
                    content_name: 'Ticket Purchase',
                    status: 'completed'
                  })
                }
              }
            })
          } catch (error) {
            console.error('Eventbrite widget initialization failed:', error)
          }
        }
      }

      // Check if already loaded
      if (window.EBWidgets) {
        initWidget()
      } else {
        // Wait for script to load
        const checkInterval = setInterval(() => {
          if (window.EBWidgets) {
            clearInterval(checkInterval)
            initWidget()
          }
        }, 100)

        // Clear interval after 5 seconds to prevent infinite checking
        setTimeout(() => clearInterval(checkInterval), 5000)
      }
    }
  }, [show.isShowcase, show.eventId, show.id, show.soldOut])

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="relative h-44 bg-gray-100">
        {/* Replace src with actual show images */}
        <Image
          src={show.image}
          alt={show.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        {/* Date badge - top left */}
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
          <p className="text-xs font-medium">
            <svg className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {show.date}
          </p>
        </div>
        {/* Event type badge - top right */}
        {show.isShowcase && (
          <div className="absolute top-2 right-2 bg-comedy-purple text-white px-3 py-1 rounded-full text-sm font-semibold">
            Showcase
          </div>
        )}
        {show.isOpenMic && (
          <div className="absolute top-2 right-2 bg-comedy-green text-white px-3 py-1 rounded-full text-sm font-semibold">
            Open Mic
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900">{show.name}</h3>
          <span className="text-lg font-semibold text-comedy-purple ml-3">{show.price}</span>
        </div>

        {/* Status badges */}
        {show.soldOut && siteConfig.showcaseTicketsAvailable && (
          <p className="text-sm text-red-600 mb-3">Sold out online · limited door tickets may be available</p>
        )}
        {show.almostSoldOut && !show.soldOut && siteConfig.showcaseTicketsAvailable && (
          <p className="text-sm text-orange-600 mb-3">Almost sold out</p>
        )}
        {show.isShowcase && !siteConfig.showcaseTicketsAvailable && (
          <p className="text-sm text-gray-500 mb-3">Tickets coming soon</p>
        )}

        {/* Key Info with icons */}
        <div className="space-y-2 text-sm mb-4">
          <p className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2 text-comedy-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <strong>{show.date}</strong><span className="mx-1">·</span>{show.time}{show.doors && <span className="text-gray-500 ml-1">· Doors {show.doors}</span>}
          </p>
          <p className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2 text-comedy-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <a
              href="https://share.google/9tb5seashzWDsVGOr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-comedy-purple transition-colors"
            >
              {show.venue}, {show.location}
            </a>
          </p>
          {generateCalendarUrl(show) && (
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-comedy-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <a
                href={generateCalendarUrl(show)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-comedy-purple hover:underline font-medium"
              >
                Add to calendar
              </a>
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">{show.description}</p>

        {/* Vibe */}
        {show.vibe && (
          <p className="text-sm text-gray-500 italic mb-4">{show.vibe}</p>
        )}

        {/* Highlights - readable with icons */}
        {show.highlights && (
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
            {show.highlights.duration && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-comedy-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {show.highlights.duration}
              </span>
            )}
            {show.highlights.ages && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-comedy-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {show.highlights.ages}
              </span>
            )}
            {show.highlights.format && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-comedy-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {show.highlights.format}
              </span>
            )}
            {show.highlights.parking && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-comedy-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                {show.highlights.parking}
              </span>
            )}
          </div>
        )}

        {/* Additional Info - Collapsible */}
        {show.additionalInfo && (
          <div className="mb-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-comedy-purple font-medium"
            >
              <span>{expanded ? '−' : '+'}</span>{' '}
              <span className="hover:underline">{expanded ? 'Hide details' : 'Show details'}</span>
            </button>
            {expanded && (
              <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-3">
                {show.additionalInfo.map((info, index) => {
                  // Strip <strong> tags and just use the text
                  const cleanText = info.replace(/<\/?strong>/g, '')
                  return (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-comedy-purple mt-0.5">›</span>
                      <span className="text-gray-700">{cleanText}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Performers - compact */}
        {show.performers && show.performers.length > 0 && siteConfig.showcaseTicketsAvailable && show.isShowcase && (
          <LineupSection performers={show.performers} />
        )}

        {/* CTA Button */}
        <div className="mt-auto pt-4">
          <a
            href={show.soldOut ? '#updates' : (show.isShowcase && !siteConfig.showcaseTicketsAvailable ? '#updates' : show.ticketLink)}
            target={show.soldOut ? '_self' : (show.isShowcase && !siteConfig.showcaseTicketsAvailable ? '_self' : '_blank')}
            rel={show.soldOut ? undefined : (show.isShowcase && !siteConfig.showcaseTicketsAvailable ? undefined : 'noopener noreferrer')}
            className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
              show.isOpenMic
                ? 'bg-comedy-green text-white hover:bg-green-700'
                : 'bg-comedy-purple text-white hover:bg-purple-700'
            }`}
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Lead')
              }
              if (show.soldOut) {
                e.preventDefault()
                document.querySelector('#updates')?.scrollIntoView({ behavior: 'smooth' })
                return
              }
              if (show.isShowcase && siteConfig.showcaseTicketsAvailable && !show.soldOut && show.eventId && typeof window !== 'undefined' && window.location.protocol === 'https:' && window.EBWidgets) {
                e.preventDefault()
              }
            }}
            id={show.isShowcase && siteConfig.showcaseTicketsAvailable && !show.soldOut ? `eb-showcard-${show.id}` : undefined}
          >
            {show.isOpenMic ? 'Sign Up' : (show.soldOut ? 'Join Mailing List' : (siteConfig.showcaseTicketsAvailable ? 'Get Tickets' : 'Get Updates'))}
          </a>
        </div>
      </div>
    </div>
  )
}

// Lineup section - comma-separated names with clear bio expand
function LineupSection({ performers }) {
  const [expanded, setExpanded] = useState(false)
  const hasBios = performers.some(p => p.bio)

  return (
    <div className="mb-4 border border-gray-200 rounded-lg p-3 bg-gray-50/50">
      <p className="text-sm text-gray-600">
        <span className="text-gray-500 font-medium">Lineup:</span>{' '}
        {performers.map((performer, index) => (
          <span key={index}>
            {performer.name}
            {index < performers.length - 1 && ', '}
          </span>
        ))}
      </p>
      {hasBios && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-comedy-purple font-medium mt-2"
        >
          <span>{expanded ? '−' : '+'}</span>{' '}
          <span className="hover:underline">{expanded ? 'Hide bios' : 'Meet the comics'}</span>
        </button>
      )}
      {expanded && (
        <div className="space-y-3 mt-3 bg-white rounded-lg p-3 border border-gray-100">
          {performers.map((performer, index) => (
            <div key={index} className="text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{performer.name}</span>
                {performer.instagram && (
                  <a
                    href={`https://instagram.com/${performer.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-comedy-purple hover:underline text-xs"
                  >
                    @{performer.instagram}
                  </a>
                )}
              </div>
              {performer.credits && (
                <p className="text-xs text-gray-400 italic mt-1">{performer.credits}</p>
              )}
              {performer.bio && (
                <p className="text-xs text-gray-600 mt-1">{performer.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Performer card - simplified
function PerformerCard({ performer }) {
  return (
    <div className="text-sm">
      <p className="text-gray-900">
        <span className="font-medium">{performer.name}</span>
        {performer.instagram && (
          <a
            href={`https://instagram.com/${performer.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-comedy-purple hover:underline ml-2"
          >
            @{performer.instagram}
          </a>
        )}
      </p>
      {performer.credits && (
        <p className="text-xs text-gray-500 mt-0.5">{performer.credits}</p>
      )}
      {performer.bio && (
        <p className="text-xs text-gray-600 mt-1">{performer.bio}</p>
      )}
    </div>
  )
}