import { useState } from 'react'

export default function EmailSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Replace the action URL below with your actual Mailchimp form action URL
    // You can find this in your Mailchimp embed form code
    const MAILCHIMP_ACTION_URL = 'https://YOUR-MAILCHIMP-URL-HERE'
    
    // For now, just show a message
    setStatus('Please replace the Mailchimp URL in EmailSignup.js with your actual Mailchimp form action URL')
    
    // Uncomment below when you have your Mailchimp URL
    // const form = e.target
    // form.action = MAILCHIMP_ACTION_URL
    // form.submit()
  }

  return (
    <div className="bg-gradient-to-br from-comedy-purple to-comedy-blue rounded-2xl p-8 md:p-12 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display uppercase tracking-tight mb-4">Stay in the Loop</h2>
        <p className="text-lg sm:text-xl mb-2">Get very occasional updates about upcoming shows.</p>
        <p className="text-base sm:text-lg opacity-90 mb-6 sm:mb-8">No spam. Not even once a month. Just when something cool is happening.</p>
        
        <form 
          onSubmit={handleSubmit}
          method="post"
          target="_blank"
          className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
        >
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
        </form>
        
        {status && (
          <p className="mt-4 text-sm bg-white/20 rounded p-2">{status}</p>
        )}
      </div>
    </div>
  )
}