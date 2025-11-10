import { useState } from 'react'
import { FaInstagram } from 'react-icons/fa'

export default function EmailSignup() {
  const [email, setEmail] = useState('')
  const [interestType, setInterestType] = useState('both') // 'shows', 'openmics', or 'both'
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setStatus('Subscribing...')

    // Track Meta Pixel Lead event
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead')
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          interestType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus(data.message || 'Thanks for signing up!')
        setEmail('')

        // Track Meta Pixel conversion event for successful mailing list signup
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'CompleteRegistration', {
            content_name: 'Mailing List Signup',
            status: 'completed'
          })
        }
      } else {
        setStatus(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setStatus('Failed to subscribe. Please try again.')
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-700 to-comedy-purple rounded-2xl p-8 md:p-12 text-white max-w-4xl mx-auto">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight mb-4">Stay in the Loop</h2>
        <div className="max-w-md mx-auto">
          <p className="text-lg sm:text-xl mb-8">Get very occasional updates about upcoming shows.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto"
        >
          <p className="text-white/90 text-center mb-4 text-sm uppercase tracking-wide">I&apos;m interested in hearing about:</p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto mb-8">
            <label className={`flex items-center cursor-pointer px-4 py-4 rounded-lg transition-all border-2 ${
              interestType === 'both'
                ? 'bg-white border-white text-comedy-purple shadow-lg'
                : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50 text-white'
            }`}>
              <input
                type="radio"
                name="interest-type"
                value="both"
                checked={interestType === 'both'}
                onChange={(e) => setInterestType(e.target.value)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                interestType === 'both'
                  ? 'border-comedy-purple bg-comedy-purple'
                  : 'border-white bg-transparent'
              }`}>
                {interestType === 'both' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="font-medium">All comedy events<span className="block text-sm font-normal opacity-80">(shows + open mics)</span></span>
            </label>
            <label className={`flex items-center cursor-pointer px-4 py-4 rounded-lg transition-all border-2 ${
              interestType === 'shows'
                ? 'bg-white border-white text-comedy-purple shadow-lg'
                : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50 text-white'
            }`}>
              <input
                type="radio"
                name="interest-type"
                value="shows"
                checked={interestType === 'shows'}
                onChange={(e) => setInterestType(e.target.value)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                interestType === 'shows'
                  ? 'border-comedy-purple bg-comedy-purple'
                  : 'border-white bg-transparent'
              }`}>
                {interestType === 'shows' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="font-medium">Comedy shows only</span>
            </label>
            <label className={`flex items-center cursor-pointer px-4 py-4 rounded-lg transition-all border-2 ${
              interestType === 'openmics'
                ? 'bg-white border-white text-comedy-purple shadow-lg'
                : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50 text-white'
            }`}>
              <input
                type="radio"
                name="interest-type"
                value="openmics"
                checked={interestType === 'openmics'}
                onChange={(e) => setInterestType(e.target.value)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                interestType === 'openmics'
                  ? 'border-comedy-purple bg-comedy-purple'
                  : 'border-white bg-transparent'
              }`}>
                {interestType === 'openmics' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="font-medium">Open mics only</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              name="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-comedy-purple font-semibold rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              Subscribe
            </button>
          </div>
        </form>

        {status && (
          <div className={`mt-6 p-4 rounded-lg ${
            status.includes('Thanks') || status.includes('updated')
              ? 'bg-green-500/20 border-2 border-green-400/50'
              : status.includes('Subscribing')
              ? 'bg-white/10 border-2 border-white/30'
              : 'bg-red-500/20 border-2 border-red-400/50'
          }`}>
            <p className="text-base font-medium text-center">{status}</p>
          </div>
        )}

        {/* Instagram Follow - Below form */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-sm sm:text-base text-white/90 flex items-center justify-center gap-1 flex-wrap">
            <span>Or follow on Instagram:</span>
            <a
              href="https://instagram.com/tavinathanson"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white hover:text-white font-medium transition-colors"
            >
              <FaInstagram className="text-base sm:text-lg" />
              <span className="hover:underline">@tavinathanson</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}