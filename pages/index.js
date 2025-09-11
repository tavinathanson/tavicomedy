import Head from 'next/head'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import ShowCard from '@/components/ShowCard'
import EmailSignup from '@/components/EmailSignup'
import { upcomingShows } from '@/data/shows'

export default function Home() {
  const galleryImages = [
    { src: '/images/packed-room-placeholder.jpg', alt: 'Packed comedy show audience' }, // Replace with Copy of Crave Show Photos.png
    { src: '/images/performer-stage-placeholder.jpg', alt: 'Comedian performing on stage' }, // Replace with 823 45 Ratio Photo (2).png
    { src: '/images/flyer-1-placeholder.jpg', alt: 'Comedy show flyer' }, // Replace with Sep 25 Flyer.png
    { src: '/images/flyer-2-placeholder.jpg', alt: 'Comedy show promotional material' },
    { src: '/images/audience-laughing-placeholder.jpg', alt: 'Audience enjoying the show' },
    { src: '/images/venue-placeholder.jpg', alt: 'Crave Nature\'s Eatery venue' },
  ]

  return (
    <>
      <Head>
        <title>Tavi Comedy Lab - Comedy Shows in Lawrenceville & Princeton</title>
        <meta name="description" content="Packed comedy nights in Lawrenceville and Princeton. Experience Crave Laughs - the comedy show people actually show up for. 80-100+ attendees every show." />
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href="https://cravelaughs.tavicomedy.com" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm sm:text-base md:text-lg w-full sm:w-auto backdrop-blur-sm">
              Get Tickets →
            </a>
            <a href="https://openmic.tavicomedy.com" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm sm:text-base md:text-lg w-full sm:w-auto backdrop-blur-sm">
              Sign Up for Open Mic →
            </a>
          </div>
        </div>
      </section>

      {/* Upcoming Shows Section */}
      <section id="shows" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto section-padding">
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight text-center mb-4">Upcoming Shows</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Join us for our regular shows at Crave Nature's Eatery in Lawrenceville
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {upcomingShows.map(show => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery / Vibe Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto section-padding">
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight text-center mb-4">The Vibe</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Packed rooms, genuine laughter, and a community that keeps coming back
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              Tavi Nathanson produces live comedy shows in the Lawrenceville/Princeton area. 
              Crave Laughs has grown into one of the most popular comedy nights locally, 
              regularly selling out with 80–100+ attendees. 
            </p>
            <p className="text-xl leading-relaxed mt-6">
              Tavi Comedy Lab is about building fun, personal, and creative comedy experiences 
              that bring people together. We focus on the experience, not celebrity comics - 
              creating unique shows in unique venues that celebrate our local community.
            </p>
          </div>
        </div>
      </section>

      {/* Email Updates Section */}
      <section id="updates" className="py-20">
        <div className="max-w-7xl mx-auto section-padding">
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
                Building fun, personal, and creative comedy experiences in Lawrenceville & Princeton
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://cravelaughs.tavicomedy.com" className="text-gray-400 hover:text-white transition-colors">
                    Get Tickets
                  </a>
                </li>
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
              <p className="text-gray-400 mb-2">
                <a href="mailto:tavi@tavicomedy.com" className="hover:text-white transition-colors">
                  tavi@tavicomedy.com
                </a>
              </p>
              <p className="text-gray-400">
                <a href="https://instagram.com/tavinathanson" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  @tavinathanson
                </a>
              </p>
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