import { useState } from 'react'

export default function TestimonialSubmit() {
  const [testimonial, setTestimonial] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!testimonial.trim()) {
      setStatus('Please enter a testimonial')
      return
    }

    setIsSubmitting(true)
    setStatus('Submitting...')

    try {
      const response = await fetch('/api/testimonial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testimonial: testimonial.trim(),
          name: name.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus(data.message || 'Thanks for sharing!')
        setTestimonial('')
        setName('')
      } else {
        setStatus(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Testimonial submission error:', error)
      setStatus('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Been to a show?</h3>
        <p className="text-gray-500 text-sm">Share your experience. We may use it as a testimonial.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          placeholder="What did you think?"
          rows="3"
          maxLength="500"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-comedy-purple focus:ring-1 focus:ring-comedy-purple/20 focus:outline-none resize-none text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all text-sm"
        />

        <div className="mt-3 flex items-center gap-3">
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            maxLength="50"
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-comedy-purple focus:ring-1 focus:ring-comedy-purple/20 focus:outline-none text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={isSubmitting || !testimonial.trim()}
            className="px-5 py-2 bg-comedy-purple text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-comedy-purple/30 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '...' : 'Submit'}
          </button>
        </div>

        {status && !status.includes('Submitting') && (
          <div className={`mt-3 p-2 rounded text-sm text-center ${
            status.includes('Thanks')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {status}
          </div>
        )}
      </form>
    </div>
  )
}
