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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Been to a show?</h3>
        <p className="text-gray-600">Share your experience anonymously</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-purple-100">
        <textarea
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          placeholder="What did you think of the show?"
          rows="4"
          maxLength="500"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-comedy-purple focus:ring-2 focus:ring-comedy-purple/20 focus:outline-none resize-none text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500 font-medium">
            {testimonial.length}/500
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !testimonial.trim()}
            className="px-8 py-3 bg-comedy-purple text-white font-semibold rounded-xl hover:bg-purple-700 hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-comedy-purple/30 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-95"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {status && !status.includes('Submitting') && (
          <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
            status.includes('Thanks')
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <p className="text-center">{status}</p>
          </div>
        )}
      </form>
    </div>
  )
}
