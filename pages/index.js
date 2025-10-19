import Head from 'next/head'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import ShowCard from '@/components/ShowCard'
import EmailSignup from '@/components/EmailSignup'
import { upcomingShows } from '@/data/shows'
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

  // Sort hero buttons by date if both dates are available
  const buttons = []

  // Show tickets button
  const showButton = {
    href: siteConfig.showcaseTicketsAvailable ? siteConfig.tickets.buttonLink : siteConfig.noTickets.buttonLink,
    target: siteConfig.showcaseTicketsAvailable ? "_blank" : "_self",
    rel: siteConfig.showcaseTicketsAvailable ? "noopener noreferrer" : undefined,
    text: siteConfig.showcaseTicketsAvailable ? `${siteConfig.tickets.buttonText} for ${showDate}` : siteConfig.noTickets.buttonText,
    className: "btn-primary text-base sm:text-lg md:text-xl w-full sm:w-auto backdrop-blur-sm",
    date: siteConfig.showcaseTicketsAvailable ? new Date(siteConfig.nextShowDate) : null,
    isEventbrite: siteConfig.showcaseTicketsAvailable,
    eventId: siteConfig.showcaseTicketsAvailable ? siteConfig.tickets.eventId : null
  }

  // Open mic button
  const openMicButton = {
    href: "https://openmic.tavicomedy.com",
    target: "_blank",
    rel: "noopener noreferrer",
    text: `Open Mic on ${openMicDate}`,
    className: "btn-secondary text-sm sm:text-base md:text-lg w-full sm:w-auto backdrop-blur-sm opacity-90",
    date: new Date(siteConfig.nextOpenMicDate),
    isEventbrite: false
  }

  // Add buttons and sort by date if both have dates
  buttons.push(showButton, openMicButton)
  if (showButton.date && openMicButton.date) {
    buttons.sort((a, b) => a.date - b.date)
  }

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
          {!siteConfig.showcaseTicketsAvailable && (
            <p className="text-base sm:text-lg text-gray-200 mb-4 px-2">
              Join the mailing list to hear about the next show
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {buttons.map((button, index) => (
              <a
                key={index}
                href={button.href}
                target={button.target}
                rel={button.rel}
                className={button.className}
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.fbq) {
                    window.fbq('track', 'Lead')
                  }
                  // Eventbrite modal only works on HTTPS
                  if (button.isEventbrite && button.eventId && typeof window !== 'undefined' && window.location.protocol === 'https:' && window.EBWidgets) {
                    e.preventDefault()
                    window.EBWidgets.createWidget({
                      widgetType: 'checkout',
                      eventId: button.eventId,
                      modal: true,
                      modalTriggerElementId: `eb-button-${index}`,
                      onOrderComplete: function() {
                        if (typeof window !== 'undefined' && window.fbq) {
                          window.fbq('track', 'Purchase')
                        }
                      }
                    })
                  }
                  // On HTTP (localhost), fall back to opening Eventbrite in new tab
                }}
                id={button.isEventbrite ? `eb-button-${index}` : undefined}
              >
                {button.text} →
              </a>
            ))}
          </div>
          {siteConfig.showcaseTicketsAvailable && (
            <div className="mt-6 text-center">
              <a
                href="#updates"
                className="text-white/80 hover:text-white text-base sm:text-lg transition-colors inline-flex items-center gap-1"
              >
                Stay in the Loop: Get Updates →
              </a>
            </div>
          )}
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
      <section className="py-20">
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
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto section-padding">
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight text-center mb-8 md:mb-12">About Tavi Comedy Lab</h2>
          <div className="prose prose-lg mx-auto text-gray-700">
            <p className="text-xl leading-relaxed">
              <a href="https://instagram.com/tavinathanson" target="_blank" rel="noopener noreferrer" className="link-text">Tavi Nathanson</a> produces live comedy shows in the Lawrenceville/Princeton area. <span className="italic">Crave Laughs</span> has grown into one of the most popular comedy shows in the area, 
              regularly selling out with 80+ attendees. 
            </p>
            <p className="text-xl leading-relaxed mt-6">
              <span className="italic">Tavi Comedy Lab</span> is about creating a fun, supportive space for comedy in the Lawrenceville/Princeton area.
            </p>
          </div>
        </div>
      </section>

      {/* Email Updates Section */}
      <section id="updates" className="py-20">
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
                      Get Tickets
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
