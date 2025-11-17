import { FaInstagram, FaYoutube } from 'react-icons/fa'

export default function ComedianGrid({ comedians }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-w-5xl mx-auto">
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
            className="flex items-center gap-1.5 p-2 bg-white rounded-md hover:bg-gray-50 transition-colors border border-gray-200 hover:border-comedy-purple group"
          >
            {isYoutube ? (
              <FaYoutube className="text-gray-400 group-hover:text-comedy-purple transition-colors flex-shrink-0 text-sm" />
            ) : (
              <FaInstagram className="text-gray-400 group-hover:text-comedy-purple transition-colors flex-shrink-0 text-sm" />
            )}
            <span className="text-xs text-gray-700 truncate">{comedian.name}</span>
          </a>
        )
      })}
    </div>
  )
}
