import { FaInstagram, FaYoutube } from 'react-icons/fa'

export default function ComedianGrid({ comedians }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-1.5">
      {comedians.map((comedian, index) => {
        const isYoutube = comedian.youtube
        const link = isYoutube
          ? `https://youtube.com/@${comedian.youtube}`
          : `https://instagram.com/${comedian.instagram}`

        return (
          <a
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 py-1.5 text-gray-600 hover:text-comedy-purple transition-colors group"
          >
            {isYoutube ? (
              <FaYoutube className="text-gray-300 group-hover:text-comedy-purple transition-colors text-xs flex-shrink-0" />
            ) : (
              <FaInstagram className="text-gray-300 group-hover:text-comedy-purple transition-colors text-xs flex-shrink-0" />
            )}
            <span className="text-sm">{comedian.name}</span>
          </a>
        )
      })}
    </div>
  )
}
