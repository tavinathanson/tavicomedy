import Image from 'next/image'
import { siteConfig } from '@/config/site'

export default function ShowCard({ show }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col h-full">
      <div className="relative h-48 bg-gray-200">
        {/* Replace src with actual show images */}
        <Image
          src={show.image}
          alt={show.name}
          fill
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
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
        <h3 className="text-lg sm:text-xl font-bold text-comedy-dark mb-2">{show.name}</h3>
        <div className="space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-600 mb-4">
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {show.date}
          </p>
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{show.time}</span>
            {show.doors && (
              <span className="text-xs text-gray-500 ml-2">(Doors {show.doors})</span>
            )}
          </p>
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {show.venue}
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-700 mb-4 line-clamp-2 flex-grow">{show.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-comedy-purple">{show.price}</span>
            {show.price !== "Free" && siteConfig.showcaseTicketsAvailable && (
              <span className="text-xs text-gray-600 block">No additional fees</span>
            )}
            {show.isShowcase && !siteConfig.showcaseTicketsAvailable && (
              <span className="text-xs text-gray-600 block">Tickets coming soon</span>
            )}
          </div>
          <a
            href={show.isShowcase && !siteConfig.showcaseTicketsAvailable ? '#updates' : show.ticketLink}
            target={show.isShowcase && !siteConfig.showcaseTicketsAvailable ? '_self' : '_blank'}
            rel={show.isShowcase && !siteConfig.showcaseTicketsAvailable ? undefined : 'noopener noreferrer'}
            className={`${show.isOpenMic ? 'btn-secondary' : 'btn-primary'} !py-3 !px-6 text-sm`}
          >
            {show.isOpenMic ? 'Sign Up' : (siteConfig.showcaseTicketsAvailable ? 'Get Tickets' : siteConfig.noTickets.buttonText)}
          </a>
        </div>
      </div>
    </div>
  )
}