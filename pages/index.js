import Head from 'next/head'
import Image from 'next/image'
import { useEffect } from 'react'
import Navigation from '@/components/Navigation'
import ShowCard from '@/components/ShowCard'
import EmailSignup from '@/components/EmailSignup'
import TestimonialSubmit from '@/components/TestimonialSubmit'
import ComedianGrid from '@/components/ComedianGrid'
import { upcomingShows } from '@/data/shows'
import { comedians } from '@/data/comedians'
import { siteConfig } from '@/config/site'
import { FaInstagram } from 'react-icons/fa'

export default function Home() {
  const galleryImages = [
    { src: '/images/packed-room-placeholder.jpg', alt: 'Packed comedy show audience' }, // Replace with Copy of Crave Show Photos.png
    { src: '/images/performer-stage-placeholder.jpg', alt: 'Comedian performing on stage' }, // Replace with 823 45 Ratio Photo (2).png
    { src: '/images/packed-open-mic.jpg', alt: 'Packed open mic night' }, // Replace with your open mic photo
  ]

  // Format dates from config
  const formatButtonDate = (dateString) => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    return `${month} ${day}`
  }

  const showDate = formatButtonDate(siteConfig.nextShowDate)
  const openMicDate = formatButtonDate(siteConfig.nextOpenMicDate)

  // Sort shows by date (earliest first)
  const sortedShows = [...upcomingShows].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateA - dateB
  })

  // Get the primary showcase show to check soldOut status
  const primaryShowcase = upcomingShows.find(show => show.isShowcase)
  const isShowcaseSoldOut = primaryShowcase?.soldOut || false

  // Primary CTA - Show tickets
  // Check if we have a real date (contains a comma, indicating a formatted date)
  const hasNextShowDate = siteConfig.nextShowDate.includes(',')
  const nextShowButtonText = !siteConfig.showcaseTicketsAvailable && hasNextShowDate
    ? `${siteConfig.noTickets.buttonText}: Next Show ${showDate}`
    : siteConfig.noTickets.buttonText

  const primaryCTA = {
    href: isShowcaseSoldOut ? '#updates' : (siteConfig.showcaseTicketsAvailable ? siteConfig.tickets.buttonLink : siteConfig.noTickets.buttonLink),
    target: isShowcaseSoldOut ? "_self" : (siteConfig.showcaseTicketsAvailable ? "_blank" : "_self"),
    rel: isShowcaseSoldOut ? undefined : (siteConfig.showcaseTicketsAvailable ? "noopener noreferrer" : undefined),
    text: isShowcaseSoldOut ? 'Sold Out - Join Mailing List' : (siteConfig.showcaseTicketsAvailable ? `${siteConfig.tickets.buttonText} for ${showDate}` : nextShowButtonText),
    isEventbrite: siteConfig.showcaseTicketsAvailable && !isShowcaseSoldOut,
    eventId: (siteConfig.showcaseTicketsAvailable && !isShowcaseSoldOut) ? siteConfig.tickets.eventId : null
  }

  // Secondary CTAs
  const secondaryCTAs = [
    {
      href: "#shows",
      target: "_self",
      text: "Show Info",
      isScrollLink: true
    },
    {
      href: "https://openmic.tavicomedy.com",
      target: "_blank",
      rel: "noopener noreferrer",
      text: `Open Mic on ${openMicDate}`
    }
  ]

  // Initialize Eventbrite widget once on page load
  useEffect(() => {
    if (primaryCTA.isEventbrite && primaryCTA.eventId && !isShowcaseSoldOut && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      // Wait for EBWidgets to be available
      const initWidget = () => {
        if (window.EBWidgets) {
          try {
            window.EBWidgets.createWidget({
              widgetType: 'checkout',
              eventId: primaryCTA.eventId,
              modal: true,
              modalTriggerElementId: 'eb-primary-cta',
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
  }, [primaryCTA.isEventbrite, primaryCTA.eventId, isShowcaseSoldOut])

  return (
    <>
      <Head>
        <title>Tavi Comedy Lab - Comedy Shows in Lawrenceville/Princeton</title>
        <meta name="description" content="Packed comedy nights in Lawrenceville/Princeton. Building fun, personal, and creative comedy experiences. Expect 80+ attendees at shows!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image - Replace with actual packed room photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-packed-room.jpg" // Replace with Copy of Crave Show Photos.png
            alt="Packed comedy show"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center section-padding py-24 sm:py-32">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display uppercase tracking-tight text-white mb-2 sm:mb-4 leading-none px-2">
            Packed Comedy Shows and Open Mics
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl text-gray-100 mb-12 md:mb-14 font-medium px-2">
            Lawrenceville/Princeton
          </p>

          {/* Primary CTA - Full width on mobile, centered */}
          <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto w-full px-2">
            <div className="w-full sm:w-auto flex flex-col items-center">
              <a
                href={primaryCTA.href}
                target={primaryCTA.target}
                rel={primaryCTA.rel}
                className="btn-primary text-lg sm:text-xl md:text-2xl w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 backdrop-blur-sm font-semibold"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.fbq) {
                    window.fbq('track', 'Lead')
                  }
                  // If sold out, scroll to updates section
                  if (isShowcaseSoldOut) {
                    e.preventDefault()
                    document.querySelector('#updates')?.scrollIntoView({ behavior: 'smooth' })
                    return
                  }
                  // If Eventbrite modal is enabled, prevent default link behavior
                  // The modal is initialized via useEffect and will handle the click automatically
                  if (primaryCTA.isEventbrite && primaryCTA.eventId && !isShowcaseSoldOut && typeof window !== 'undefined' && window.location.protocol === 'https:' && window.EBWidgets) {
                    e.preventDefault()
                  }
                }}
                id={primaryCTA.isEventbrite ? 'eb-primary-cta' : undefined}
              >
                {primaryCTA.text} →
              </a>
              {isShowcaseSoldOut && (
                <p className="text-white/90 text-sm sm:text-base mt-2 text-center backdrop-blur-sm bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                  Limited tickets may be available at the door (not guaranteed)
                </p>
              )}
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Show Details - More subtle */}
              <a
                href={secondaryCTAs[0].href}
                target={secondaryCTAs[0].target}
                className="text-white/90 hover:text-white text-base sm:text-lg font-medium backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all px-6 py-3 rounded-full border border-white/30 w-full sm:w-auto text-center"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#shows')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {secondaryCTAs[0].text} ↓
              </a>

              {/* Open Mic - Green to stand out */}
              <a
                href={secondaryCTAs[1].href}
                target={secondaryCTAs[1].target}
                rel={secondaryCTAs[1].rel}
                className="btn-secondary text-sm sm:text-base md:text-lg px-6 py-3 backdrop-blur-sm w-full sm:w-auto"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.fbq) {
                    window.fbq('track', 'Lead')
                  }
                }}
              >
                {secondaryCTAs[1].text} →
              </a>
            </div>
          </div>
          {siteConfig.showcaseTicketsAvailable && !isShowcaseSoldOut && (
            <div className="mt-6 text-center">
              <a
                href="#updates"
                className="text-white/80 hover:text-white text-base sm:text-lg transition-colors inline-flex items-center gap-1"
              >
                Stay in the Loop: Get Updates →
              </a>
            </div>
          )}

          {/* Testimonial link - subtle and separate */}
          <div className="mt-4 text-center">
            <a
              href="#feedback"
              className="text-white/60 hover:text-white/90 text-sm transition-colors inline-flex items-center gap-1"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#feedback')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Been to a show? Share feedback ↓
            </a>
          </div>
        </div>
      </section>

      {/* Upcoming Shows Section */}
      <section id="shows" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto section-padding">
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight text-center mb-4">Upcoming Shows</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Join us for regular shows at <a href="https://share.google/sB2zjLQtXJxnBnvzp" target="_blank" rel="noopener noreferrer" className="link-text">Crave Nature&apos;s Eatery</a> in Lawrenceville
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {sortedShows.map(show => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery / Vibe Section */}
      <section className="py-20 bg-gradient-to-b from-white via-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto section-padding">
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight text-center mb-4">The Vibe</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Packed rooms, genuine laughter, and supporting local community
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <blockquote className="text-center">
                <p className="text-base md:text-lg text-gray-700 italic leading-relaxed">
                  &ldquo;Really enjoyed the show Saturday night. Great choice of talent. High quality and pace the whole evening.&rdquo;
                </p>
                <footer className="mt-3 text-sm text-gray-600 font-medium">
                  &mdash; Martin A.
                </footer>
              </blockquote>

              <blockquote className="text-center">
                <p className="text-base md:text-lg text-gray-700 italic leading-relaxed">
                  &ldquo;Both shows that I&apos;ve been to were defined by joy and consistent belly laughter! [...] A diverse plethora of delightful personalities who know how to tell a story and make us erupt in laughter.&rdquo;
                </p>
                <footer className="mt-3 text-sm text-gray-600 font-medium">
                  &mdash; Angel M.
                </footer>
              </blockquote>

              <blockquote className="text-center">
                <p className="text-base md:text-lg text-gray-700 italic leading-relaxed">
                  &ldquo;Comedians and host were amazing. I love that it&apos;s easy to order food ahead of time. [...] Wish you had shows twice a month.&rdquo;
                </p>
                <footer className="mt-3 text-sm text-gray-600 font-medium">
                  &mdash; Amber W.
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto section-padding">
          <h2 className="text-sm font-medium uppercase tracking-widest mb-6 text-gray-400 text-center">About</h2>
          <p className="text-gray-600 leading-relaxed">
            <a href="https://instagram.com/tavinathanson" target="_blank" rel="noopener noreferrer" className="link-text font-medium">Tavi Nathanson</a> produces live comedy shows in the Lawrenceville/Princeton area. <span className="italic">Crave Laughs</span> has grown into one of the most popular comedy shows in the area, regularly selling out with 80+ attendees.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            <span className="italic">Tavi Comedy Lab</span> is about creating a fun, supportive space for comedy in the Lawrenceville/Princeton area.
          </p>
        </div>
      </section>

      {/* Comedians Section */}
      <section id="comedians" className="py-16 bg-white">
        <div className="max-w-2xl mx-auto section-padding">
          <h2 className="text-sm font-medium uppercase tracking-widest text-center mb-6 text-gray-400">Past Performers</h2>
          <ComedianGrid comedians={comedians} />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto section-padding">
          <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tight text-center mb-12">FAQ</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Are ticketed shows BYOB?</h3>
              <p className="text-gray-500">Yes! BYOB is welcome at shows you buy a ticket for. Your purchase of food/drink from Crave keeps our BYOB policy possible.</p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Is there a minimum purchase?</h3>
              <p className="text-gray-500">Yes, there&apos;s a 1-item minimum per person at ticketed shows. Anything from the cafe menu counts! For free events like open mics, a purchase is highly encouraged to support the venue.</p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Are tickets refundable?</h3>
              <p className="text-gray-500">Yes! Tickets for the standup show are refundable until two days before the show.</p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Where can I park?</h3>
              <p className="text-gray-500">Parking at Crave is limited. Free street parking is available on nearby residential streets. Please allow a few extra minutes to find a spot.</p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">What sort of place is Crave?</h3>
              <p className="text-gray-500">
                A healthy cafe with a great setting for events. Check out their menu at{' '}
                <a href="https://www.cravenatureseatery.com/menu-2023" target="_blank" rel="noopener noreferrer" className="link-text">
                  cravenatureseatery.com
                </a>
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">I can&apos;t make this one but I&apos;m interested in the next one!</h3>
              <p className="text-gray-500">
                <a href="#updates" className="link-text">Join the mailing list</a>
                {' '}or follow{' '}
                <a href="https://instagram.com/tavinathanson" target="_blank" rel="noopener noreferrer" className="link-text">@tavinathanson</a>
                {' '}on Instagram.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="feedback" className="py-20 bg-white">
        <div className="section-padding">
          <TestimonialSubmit />
        </div>
      </section>

      {/* Email Updates Section */}
      <section id="updates" className="py-20 bg-gradient-to-br from-purple-700 to-comedy-purple">
        <div className="section-padding">
          <EmailSignup />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-comedy-dark text-white py-12">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-display uppercase tracking-wide mb-4">Tavi Comedy Lab</h3>
              <p className="text-gray-400">
                Building fun, personal, and creative comedy experiences in Lawrenceville/Princeton
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {siteConfig.showcaseTicketsAvailable && (
                  <li>
                    <a href="https://cravelaughs.eventbrite.com" className="text-gray-400 hover:text-white transition-colors">
                      Buy Tickets
                    </a>
                  </li>
                )}
                <li>
                  <a href="https://openmic.tavicomedy.com" className="text-gray-400 hover:text-white transition-colors">
                    Open Mic Sign Up
                  </a>
                </li>
                <li>
                  <a href="#updates" className="text-gray-400 hover:text-white transition-colors">
                    Email Updates
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <p className="mb-4">
                <a href="mailto:tavi@tavicomedy.com" className="text-white text-lg hover:text-comedy-purple transition-colors">
                  tavi@tavicomedy.com
                </a>
              </p>
              <a 
                href="https://instagram.com/tavinathanson" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <FaInstagram className="text-xl" />
                <span>@tavinathanson</span>
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Tavi Comedy Lab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
