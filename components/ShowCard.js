import Image from 'next/image'
import { siteConfig } from '@/config/site'
import { useState, useEffect } from 'react'
import { MdMeetingRoom } from 'react-icons/md'

export default function ShowCard({ show }) {
  const [expanded, setExpanded] = useState(false)

  // Initialize Eventbrite widget once on component mount
  useEffect(() => {
    if (show.isShowcase && siteConfig.showcaseTicketsAvailable && show.eventId && typeof window !== 'undefined' && window.location.protocol === 'https:') {
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
  }, [show.isShowcase, show.eventId, show.id])

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-gray-200">
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

      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-bold text-comedy-dark mb-3">{show.name}</h3>

        {/* Price prominently displayed */}
        <div className="mb-4">
          <span className="text-3xl sm:text-4xl font-bold text-comedy-purple">{show.price}</span>
          {show.price !== "Free" && siteConfig.showcaseTicketsAvailable && (
            <span className="text-sm text-gray-600 block mt-1">online or at door • no extra taxes or fees</span>
          )}
          {show.isShowcase && !siteConfig.showcaseTicketsAvailable && (
            <span className="text-sm text-gray-600 block mt-1">Tickets coming soon</span>
          )}
        </div>

        {/* Event Details Section Header */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Event Details</h4>
        </div>

        {/* Key Info */}
        <div className="space-y-2 text-sm sm:text-base text-gray-600 mb-4">
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{show.time}</span>
            {show.doors && (
              <span className="text-xs text-gray-500 ml-2">• Doors {show.doors}</span>
            )}
          </p>
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <a
              href="https://share.google/9tb5seashzWDsVGOr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-comedy-purple transition-colors hover:underline"
            >
              {show.venue}, {show.location}
            </a>
          </p>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-700 mb-3">{show.description}</p>

        {/* Vibe/What to Expect */}
        {show.vibe && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs sm:text-sm text-gray-700 font-medium">{show.vibe}</p>
          </div>
        )}

        {/* Highlights - Important Details */}
        {show.highlights && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Good to know:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              {show.highlights.duration && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{show.highlights.duration}</span>
                </div>
              )}
              {show.highlights.ages && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{show.highlights.ages}</span>
                </div>
              )}
              {show.highlights.format && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{show.highlights.format}</span>
                </div>
              )}
              {show.highlights.doors && (
                <div className="flex items-center">
                  <MdMeetingRoom className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>{show.highlights.doors}</span>
                </div>
              )}
              {show.highlights.parking && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>{show.highlights.parking}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Info - Collapsible */}
        {show.additionalInfo && (
          <div className="mb-4 border-t border-gray-200 pt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-medium text-comedy-purple hover:text-comedy-purple/80 flex items-center gap-1 transition-colors"
            >
              {expanded ? 'Less info' : 'More info'}
              <svg
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expanded && (
              <ul className="mt-3 text-xs sm:text-sm text-gray-700 space-y-2 list-disc pl-5">
                {show.additionalInfo.map((info, index) => {
                  // Simple safe HTML rendering - only allow <strong> tags
                  const parts = info.split(/(<strong>.*?<\/strong>)/g)
                  return (
                    <li key={index}>
                      {parts.map((part, i) => {
                        if (part.startsWith('<strong>')) {
                          const text = part.replace(/<\/?strong>/g, '')
                          return <strong key={i}>{text}</strong>
                        }
                        return part
                      })}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {/* Performers - Show names, click to expand - only show when tickets available */}
        {show.performers && show.performers.length > 0 && siteConfig.showcaseTicketsAvailable && show.isShowcase && (
          <LineupSection performers={show.performers} />
        )}

        {/* CTA Button - Full width at bottom */}
        <div className="mt-auto pt-6">
          <a
            href={show.isShowcase && !siteConfig.showcaseTicketsAvailable ? '#updates' : show.ticketLink}
            target={show.isShowcase && !siteConfig.showcaseTicketsAvailable ? '_self' : '_blank'}
            rel={show.isShowcase && !siteConfig.showcaseTicketsAvailable ? undefined : 'noopener noreferrer'}
            className={`${show.isOpenMic ? 'btn-secondary' : 'btn-primary'} w-full !py-4 text-base sm:text-lg font-semibold`}
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Lead')
              }
              // If Eventbrite modal is enabled, prevent default link behavior
              // The modal is initialized via useEffect and will handle the click automatically
              if (show.isShowcase && siteConfig.showcaseTicketsAvailable && show.eventId && typeof window !== 'undefined' && window.location.protocol === 'https:' && window.EBWidgets) {
                e.preventDefault()
              }
            }}
            id={show.isShowcase && siteConfig.showcaseTicketsAvailable ? `eb-showcard-${show.id}` : undefined}
          >
            {show.isOpenMic ? 'Sign Up →' : (siteConfig.showcaseTicketsAvailable ? siteConfig.tickets.buttonText : siteConfig.noTickets.buttonText)}
          </a>
        </div>
      </div>
    </div>
  )
}

// Lineup section with collapsible performer details
function LineupSection({ performers }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-t border-gray-200 pt-3 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">
          Lineup ({performers.length} comedians):
        </h4>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-comedy-purple hover:text-comedy-purple/80 font-semibold px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded transition-colors flex-shrink-0"
        >
          {expanded ? 'Hide Comedian Bios' : 'Show Comedian Bios'}
        </button>
      </div>

      {!expanded && (
        <p className="text-xs sm:text-sm text-gray-600 mb-3">
          {performers.map((performer, index) => (
            <span key={index}>
              {performer.instagram ? (
                <a
                  href={`https://instagram.com/${performer.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-comedy-purple hover:text-comedy-purple/80 hover:underline"
                >
                  {performer.name}
                </a>
              ) : (
                performer.name
              )}
              {index < performers.length - 1 && ', '}
            </span>
          ))}
        </p>
      )}

      {expanded && (
        <div className="space-y-3 mt-3">
          {performers.map((performer, index) => (
            <PerformerCard key={index} performer={performer} />
          ))}
        </div>
      )}
    </div>
  )
}

// Performer card component with collapsible bio
function PerformerCard({ performer }) {
  const [showBio, setShowBio] = useState(false)

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-grow">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h5 className="font-semibold text-sm text-gray-900">{performer.name}</h5>
            {performer.instagram && (
              <a
                href={`https://instagram.com/${performer.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-comedy-purple hover:text-comedy-purple/80 hover:underline py-1"
              >
                @{performer.instagram}
              </a>
            )}
          </div>
          {performer.credits && (
            <p className="text-xs text-gray-600 mt-1">
              {performer.credits.split(/(https?:\/\/\S+|@\w+)/g).map((part, i) => {
                if (part.match(/^https?:\/\//)) return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-comedy-purple hover:underline">{part}</a>
                if (part.match(/^@(\w+)/)) return <a key={i} href={`https://instagram.com/${part.slice(1)}`} target="_blank" rel="noopener noreferrer" className="text-comedy-purple hover:underline">{part}</a>
                return part
              })}
            </p>
          )}
        </div>
        {performer.bio && (
          <button
            onClick={() => setShowBio(!showBio)}
            className="text-xs text-comedy-purple hover:text-comedy-purple/80 font-medium flex-shrink-0 py-1 px-2"
          >
            {showBio ? 'Less' : 'Bio'}
          </button>
        )}
      </div>
      {showBio && performer.bio && (
        <p className="text-xs text-gray-700 mt-2 leading-relaxed">
          {performer.bio.split(/(https?:\/\/\S+|@\w+)/g).map((part, i) => {
            if (part.match(/^https?:\/\//)) return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-comedy-purple hover:underline">{part}</a>
            if (part.match(/^@(\w+)/)) return <a key={i} href={`https://instagram.com/${part.slice(1)}`} target="_blank" rel="noopener noreferrer" className="text-comedy-purple hover:underline">{part}</a>
            return part
          })}
        </p>
      )}
    </div>
  )
}