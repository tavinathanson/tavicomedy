import { useState } from 'react'
import Link from 'next/link'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl md:text-3xl font-display tracking-wide text-comedy-dark">
              TAVI COMEDY LAB
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="#home" className="text-gray-700 hover:text-comedy-purple transition-colors">
                Home
              </Link>
              <Link href="#shows" className="text-gray-700 hover:text-comedy-purple transition-colors">
                Shows
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-comedy-purple transition-colors">
                About
              </Link>
              <Link href="#updates" className="text-gray-700 hover:text-comedy-purple transition-colors">
                Updates
              </Link>
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <Link href="#home" className="block px-3 py-2 text-gray-700 hover:text-comedy-purple">
              Home
            </Link>
            <Link href="#shows" className="block px-3 py-2 text-gray-700 hover:text-comedy-purple">
              Shows
            </Link>
            <Link href="#about" className="block px-3 py-2 text-gray-700 hover:text-comedy-purple">
              About
            </Link>
            <Link href="#updates" className="block px-3 py-2 text-gray-700 hover:text-comedy-purple">
              Updates
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}