import { useState } from 'react'

export default function EmailSignup() {
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState({
    showcase: true,
    openmic: false
  })
  const [status, setStatus] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const MAILCHIMP_ACTION_URL = process.env.NEXT_PUBLIC_MAILCHIMP_ACTION_URL
    
    if (!MAILCHIMP_ACTION_URL) {
      setStatus('Mailchimp is not configured. Please add NEXT_PUBLIC_MAILCHIMP_ACTION_URL to your environment variables.')
      return
    }
    
    // Add tag IDs if configured
    const baseTag = process.env.NEXT_PUBLIC_MAILCHIMP_TAG_WEBSITE
    const comedyShowTag = process.env.NEXT_PUBLIC_MAILCHIMP_TAG_COMEDY_SHOWS
    const openMicTag = process.env.NEXT_PUBLIC_MAILCHIMP_TAG_OPEN_MICS
    
    const tags = []
    
    // Always add base website tag if configured
    if (baseTag) tags.push(baseTag)
    
    // Add specific tags based on interests
    if (interests.showcase && comedyShowTag) tags.push(comedyShowTag)
    if (interests.openmic && openMicTag) tags.push(openMicTag)
    
    const form = e.target
    
    // Add hidden tags field if we have any tags
    if (tags.length > 0) {
      const tagsDiv = document.createElement('div')
      tagsDiv.setAttribute('hidden', '')
      
      const tagsInput = document.createElement('input')
      tagsInput.type = 'hidden'
      tagsInput.name = 'tags'
      tagsInput.value = tags.join(',')
      
      tagsDiv.appendChild(tagsInput)
      form.appendChild(tagsDiv)
    }
    
    form.action = MAILCHIMP_ACTION_URL
    form.submit()
  }

  return (
    <div className="bg-gradient-to-br from-purple-700 to-comedy-purple rounded-2xl p-8 md:p-12 text-white max-w-4xl mx-auto">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight mb-6">Stay in the Loop</h2>
        <div className="max-w-md mx-auto">
          <p className="text-lg sm:text-xl mb-8">Get very occasional updates about upcoming shows. No spam.</p>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          method="post"
          target="_blank"
          className="max-w-md mx-auto"
        >
          <p className="text-white/90 text-center mb-4 text-sm uppercase tracking-wide">I&apos;m interested in hearing about:</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
            <label className="flex items-center cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                name={`group[${process.env.NEXT_PUBLIC_MAILCHIMP_GROUP_ID}][1]`}
                value="1"
                checked={interests.showcase}
                onChange={(e) => setInterests({...interests, showcase: e.target.checked})}
                className="w-5 h-5 mr-3 rounded accent-white"
              />
              <span className="text-white font-medium">Comedy shows</span>
            </label>
            <label className="flex items-center cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                name={`group[${process.env.NEXT_PUBLIC_MAILCHIMP_GROUP_ID}][2]`}
                value="2"
                checked={interests.openmic}
                onChange={(e) => setInterests({...interests, openmic: e.target.checked})}
                className="w-5 h-5 mr-3 rounded accent-white"
              />
              <span className="text-white font-medium">Comedy open mics</span>
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
          <p className="mt-4 text-sm bg-white/20 rounded p-2">{status}</p>
        )}
      </div>
    </div>
  )
}