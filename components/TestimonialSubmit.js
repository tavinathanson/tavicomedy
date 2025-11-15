import { useState } from 'react'

export default function TestimonialSubmit() {
  const [testimonial, setTestimonial] = useState('')
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
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus(data.message || 'Thanks for sharing!')
        setTestimonial('')
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
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Been to the show before?</h3>
      <p className="text-gray-600 mb-4">Leave an anonymous testimonial</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          placeholder="Share your experience..."
          rows="3"
          maxLength="500"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-comedy-purple focus:outline-none resize-none text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-500">
            {testimonial.length}/500
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !testimonial.trim()}
            className="px-6 py-2 bg-comedy-purple text-white font-medium rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-comedy-purple focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {status && !status.includes('Submitting') && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          status.includes('Thanks')
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p>{status}</p>
        </div>
      )}
    </div>
  )
}
